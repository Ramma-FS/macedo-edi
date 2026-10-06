// app/products.tsx
// Pantalla de productos. Hace todo el CRUD contra el backend:
//   - Listar (GET)     -> loadProducts
//   - Buscar (GET)     -> el campo "Buscar" + debounce
//   - Crear (POST)     -> handleCreate
//   - Editar (PATCH)   -> startEdit + handleUpdate
//   - Eliminar (DELETE)-> confirmDelete + handleDelete

import { useEffect, useState } from 'react';
import {
  ActivityIndicator, // ruedita de carga
  Alert, // cuadro de confirmación nativo (para borrar)
  FlatList, // lista optimizada para muchos elementos
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // evita que el contenido quede bajo la barra de estado
import { router } from 'expo-router'; // para volver a la pantalla anterior
// Funciones que hablan con el backend (están en services/products.ts)
import {
  createProduct,
  deleteProduct,
  listProducts,
  updateProduct,
} from '@/services/products';
// Tipos de TypeScript: Product es lo que devuelve la API, ProductInput lo que se envía
import { Product, ProductInput } from '@/types/product';

export default function ProductsScreen() {
  // ---------- ESTADOS ----------
  // Cada useState guarda un dato que, al cambiar, vuelve a dibujar la pantalla.

  // Lista de productos que viene del backend
  const [products, setProducts] = useState<Product[]>([]);
  // true mientras se está cargando la lista (muestra la ruedita)
  const [loading, setLoading] = useState(true);
  // Mensaje de error que se muestra en rojo (null = no hay error)
  const [error, setError] = useState<string | null>(null);

  // Texto escrito en el buscador
  const [search, setSearch] = useState('');

  // Campos del formulario. Son texto porque los TextInput siempre devuelven string;
  // se convierten a número recién al validar (ver readForm).
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('0');
  // true mientras se guarda (crear/editar): sirve para deshabilitar el botón
  const [saving, setSaving] = useState(false);
  // Producto que se está editando. null = el formulario está en modo "crear"
  const [editing, setEditing] = useState<Product | null>(null);

  // ---------- LISTAR (GET /api/v1/products) ----------
  async function loadProducts() {
    try {
      setLoading(true);
      setError(null);
      // página 1, 20 productos, filtrando por lo que haya en el buscador
      const response = await listProducts(1, 20, search);
      // La API devuelve { data: [...], meta: {...} }; la lista está en "data"
      setProducts(response.data);
    } catch (e) {
      // Si algo falla se muestra el mensaje en pantalla (no solo en consola)
      setError(e instanceof Error ? e.message : 'Error al cargar productos.');
    } finally {
      // finally se ejecuta siempre, haya salido bien o mal
      setLoading(false);
    }
  }

  // ---------- BUSCADOR CON "DEBOUNCE" ----------
  // Este efecto corre al abrir la pantalla y cada vez que cambia "search".
  // El setTimeout espera 400 ms desde la última tecla antes de llamar al backend,
  // así no se hace una petición por cada letra. Si el usuario sigue escribiendo,
  // la función de limpieza (clearTimeout) cancela la espera anterior.
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // ---------- VALIDAR FORMULARIO ----------
  // Se usa tanto al crear como al editar para no repetir código.
  // Devuelve los valores ya convertidos a número, o null si algo está mal
  // (en ese caso deja el mensaje de error en pantalla).
  function readForm() {
    // replace(',', '.') permite escribir el decimal con coma
    const numericPrice = Number(price.replace(',', '.'));
    const numericStock = Number(stock);

    if (name.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres.');
      return null;
    }

    // Number('') da 0, por eso también se controla que no esté vacío
    if (price.trim() === '' || Number.isNaN(numericPrice) || numericPrice < 0) {
      setError('Ingresá un precio válido.');
      return null;
    }

    // El stock tiene que ser un número entero, sin decimales y sin negativos
    if (!Number.isInteger(numericStock) || numericStock < 0) {
      setError('El stock debe ser un entero mayor o igual a 0.');
      return null;
    }

    return { name: name.trim(), price: numericPrice, stock: numericStock };
  }

  // Deja el formulario vacío y vuelve al modo "crear"
  function resetForm() {
    setName('');
    setPrice('');
    setStock('0');
    setEditing(null);
  }

  // ---------- CREAR (POST /api/v1/products) ----------
  async function handleCreate() {
    const values = readForm();
    if (!values) return; // si no pasó la validación, se corta acá

    try {
      setSaving(true);
      setError(null);

      // Solo se envían los campos permitidos. NO se mandan id, owner_id,
      // created_at ni updated_at, porque el backend los rechaza (400 invalid_json).
      await createProduct({
        name: values.name,
        description: '',
        price: values.price,
        stock: values.stock,
      });

      resetForm(); // limpia los campos
      await loadProducts(); // vuelve a pedir la lista para ver el producto nuevo
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo crear el producto.');
    } finally {
      setSaving(false);
    }
  }

  // ---------- EDITAR (PATCH /api/v1/products/:id) ----------
  // Paso 1: al tocar "Editar", se cargan los datos del producto en el formulario
  function startEdit(item: Product) {
    setError(null);
    setEditing(item); // guarda cuál producto se está editando
    setName(item.name);
    // El precio llega como string ("15000.00"); Number lo pasa a número
    // y String lo vuelve texto para mostrarlo en el campo
    setPrice(String(Number(item.price)));
    setStock(String(item.stock));
  }

  // Paso 2: al tocar "Guardar cambios", se envía el PATCH
  async function handleUpdate() {
    if (!editing) return;

    const values = readForm();
    if (!values) return;

    // PATCH es parcial: se arma un objeto solo con los campos que cambiaron
    const changes: Partial<ProductInput> = {};
    if (values.name !== editing.name) changes.name = values.name;
    if (values.price !== Number(editing.price)) changes.price = values.price;
    if (values.stock !== editing.stock) changes.stock = values.stock;

    // Si no cambió nada, no tiene sentido llamar al backend
    if (Object.keys(changes).length === 0) {
      setError('No hay cambios para guardar.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      await updateProduct(editing.id, changes);

      resetForm();
      await loadProducts();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo editar el producto.');
    } finally {
      setSaving(false);
    }
  }

  // ---------- ELIMINAR (DELETE /api/v1/products/:id) ----------
  // Esta función hace el borrado en sí (se llama después de confirmar)
  async function handleDelete(item: Product) {
    try {
      setError(null);
      await deleteProduct(item.id);

      // Si justo se estaba editando el producto borrado, se limpia el formulario
      if (editing?.id === item.id) resetForm();

      await loadProducts(); // actualiza la lista
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo eliminar el producto.');
    }
  }

  // Esta función muestra el aviso de confirmación antes de borrar
  function confirmDelete(item: Product) {
    Alert.alert(
      'Eliminar producto',
      `¿Seguro que querés eliminar "${item.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' }, // cierra el aviso sin hacer nada
        {
          text: 'Eliminar',
          style: 'destructive', // se muestra en rojo
          onPress: () => handleDelete(item),
        },
      ]
    );
  }

  // ---------- PANTALLA ----------
  return (
    <SafeAreaView className="flex-1 bg-[#F4F7F6]">
      <View className="flex-1 px-6 py-6">
        {/* Encabezado: botón Volver + título */}
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-[#145F52] font-bold">Volver</Text>
          </TouchableOpacity>
          <Text className="text-xl font-bold text-[#16332E]">Productos</Text>
          {/* Espacio vacío del mismo ancho que "Volver" para que el título quede centrado */}
          <View className="w-12" />
        </View>

        {/* Formulario: sirve para crear y para editar */}
        <View className="bg-white border border-[#DCE5E2] rounded-xl p-4 mb-4">
          {/* El título cambia según el modo */}
          <Text className="text-[#16332E] font-bold mb-3">
            {editing ? 'Editar producto' : 'Nuevo producto'}
          </Text>

          <TextInput
            className="border border-[#DCE5E2] rounded-lg px-3 h-12 mb-3 text-[#16332E]"
            placeholder="Nombre"
            placeholderTextColor="#9ca3af"
            value={name}
            onChangeText={setName}
          />

          {/* Precio y stock, uno al lado del otro */}
          <View className="flex-row mb-3">
            <TextInput
              className="flex-1 border border-[#DCE5E2] rounded-lg px-3 h-12 mr-3 text-[#16332E]"
              placeholder="Precio"
              placeholderTextColor="#9ca3af"
              keyboardType="decimal-pad" // teclado numérico con decimales
              value={price}
              onChangeText={setPrice}
            />
            <TextInput
              className="flex-1 border border-[#DCE5E2] rounded-lg px-3 h-12 text-[#16332E]"
              placeholder="Stock"
              placeholderTextColor="#9ca3af"
              keyboardType="number-pad" // teclado numérico solo con enteros
              value={stock}
              onChangeText={setStock}
            />
          </View>

          {/* Botón principal: según el modo, crea o guarda los cambios */}
          <TouchableOpacity
            onPress={editing ? handleUpdate : handleCreate}
            disabled={saving} // evita tocarlo dos veces mientras guarda
            activeOpacity={0.8}
            className={`bg-[#145F52] rounded-lg h-12 items-center justify-center ${saving ? 'opacity-60' : ''}`}>
            <Text className="text-white font-semibold">
              {saving
                ? 'Guardando...'
                : editing
                  ? 'Guardar cambios'
                  : 'Crear producto'}
            </Text>
          </TouchableOpacity>

          {/* El botón Cancelar solo aparece cuando se está editando */}
          {editing && (
            <TouchableOpacity
              onPress={() => {
                resetForm();
                setError(null);
              }}
              disabled={saving}
              className="h-10 items-center justify-center mt-2">
              <Text className="text-[#70817D] font-semibold">Cancelar</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Buscador: filtra por nombre o descripción (se envía como ?search=...) */}
        <TextInput
          className="bg-white border border-[#DCE5E2] rounded-lg px-3 h-12 mb-4 text-[#16332E]"
          placeholder="Buscar producto..."
          placeholderTextColor="#9ca3af"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Ruedita de carga: solo se ve mientras loading es true */}
        {loading && <ActivityIndicator />}

        {/* Mensaje de error: solo se ve si error tiene texto */}
        {error && (
          <Text className="text-red-600 mb-4">{error}</Text>
        )}

        {/* Lista de productos */}
        <FlatList
          data={products}
          keyExtractor={(item) => item.id} // cada elemento necesita una clave única
          refreshing={loading}
          onRefresh={loadProducts} // permite recargar arrastrando hacia abajo
          // Mensaje cuando no hay resultados (distinto si se está buscando o no)
          ListEmptyComponent={
            !loading ? (
              <Text>
                {search.trim()
                  ? 'No se encontraron productos.'
                  : 'No hay productos.'}
              </Text>
            ) : null
          }
          // Cómo se dibuja cada producto
          renderItem={({ item }) => (
            <View
              // La tarjeta que se está editando se marca con borde verde
              className={`bg-white border rounded-xl p-4 mb-3 ${
                editing?.id === item.id ? 'border-[#145F52]' : 'border-[#DCE5E2]'
              }`}>
              <Text className="text-[#16332E] font-bold text-base">
                {item.name}
              </Text>
              {/* price llega como texto, por eso Number() antes de formatearlo */}
              <Text className="text-[#70817D] mt-1">
                ${Number(item.price).toLocaleString('es-AR')}
              </Text>
              <Text className="text-[#70817D] mt-1">
                Stock: {item.stock}
              </Text>

              {/* Acciones del producto */}
              <View className="flex-row mt-3">
                <TouchableOpacity onPress={() => startEdit(item)} className="mr-6">
                  <Text className="text-[#145F52] font-bold">Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => confirmDelete(item)}>
                  <Text className="text-red-600 font-bold">Eliminar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
}