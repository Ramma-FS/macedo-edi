// app/home.tsx
// Pantalla de inicio una vez que se inició sesión. Es la ruta "/home".
// Muestra un saludo según la hora del día y el acceso a la pantalla de productos.

import { View, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // respeta la barra de estado y los bordes del celular
import { router } from 'expo-router'; // para navegar entre pantallas desde código
import { getGreeting } from '@/lib/greeting'; // devuelve "Buenos días", "Buenas tardes" o "Buenas noches"
import { LogOut, Sun, Moon, Sunset, CheckCircle2, Sparkles } from 'lucide-react-native'; // íconos

export default function HomeScreen() {
  // ---------- SALUDO SEGÚN LA HORA ----------
  const greeting = getGreeting(); // texto del saludo
  const hour = new Date().getHours(); // hora actual del celular (0 a 23)
  const isMorning = hour >= 5 && hour < 12; // de 5:00 a 11:59
  const isAfternoon = hour >= 12 && hour < 20; // de 12:00 a 19:59
  // Elige el ícono: sol de mañana, atardecer de tarde y luna el resto del tiempo.
  // Se guarda el componente en una variable para usarlo abajo como <Icon />.
  const Icon = isMorning ? Sun : isAfternoon ? Sunset : Moon;

  return (
    <SafeAreaView className="flex-1 bg-[#F4F7F6]">
      <View className="flex-1 w-full max-w-[720px] self-center px-6 py-8">

        {/* Encabezado: logo a la izquierda y botón de salir a la derecha */}
        <View className="flex-row items-center justify-between mb-12">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-[#145F52] rounded-xl items-center justify-center">
              <Text className="text-white text-lg font-bold">M</Text>
            </View>
            <Text className="text-[#16332E] text-base font-bold ml-3">MACEDO</Text>
          </View>
          {/* Botón de salir: por ahora solo vuelve al login.
              NO borra los tokens guardados (para eso existe logout() en services/auth.ts). */}
          <TouchableOpacity
            accessibilityLabel="Cerrar sesión" // texto para lectores de pantalla
            onPress={() => router.replace('/')}
            className="w-10 h-10 bg-white border border-[#DCE5E2] rounded-xl items-center justify-center">
            <LogOut size={18} color="#60736E" />
          </TouchableOpacity>
        </View>

        {/* Perfil: ícono del momento del día, saludo y nombre */}
        <View className="mb-10">
          <View className="w-14 h-14 bg-[#E0EFEB] rounded-2xl items-center justify-center mb-5">
            <Icon size={26} color="#145F52" />
          </View>
          <Text className="text-[#70817D] text-sm">
            {greeting}
          </Text>
          {/* El nombre "Usuario" está escrito fijo; mostrar el email real es un desafío opcional */}
          <Text className="text-[#16332E] text-[30px] leading-9 font-bold mt-1">
            Usuario
          </Text>
        </View>

        {/* Tarjeta verde: confirma que se inició sesión */}
        <View className="bg-[#145F52] rounded-2xl p-6 mb-5">
          <View className="flex-row items-center mb-4">
            <CheckCircle2 size={21} color="#BCE4DA" />
            <Text className="text-white text-base font-bold ml-3">
              Todo está listo
            </Text>
          </View>
          <Text className="text-[#D6ECE7] text-sm leading-5">
            Has iniciado sesión correctamente. Desde aquí podrás acceder a toda tu información.
          </Text>
        </View>

        {/* Tarjeta informativa (solo diseño) */}
        <View className="bg-white border border-[#DCE5E2] rounded-2xl p-5">
          <View className="flex-row items-center">
            <View className="w-10 h-10 bg-[#FFF0EB] rounded-xl items-center justify-center mr-4">
              <Sparkles size={19} color="#D95D41" />
            </View>
            <View className="flex-1">
              <Text className="text-[#16332E] text-sm font-bold">Una experiencia más simple</Text>
              <Text className="text-[#70817D] text-xs leading-5 mt-1">Tu espacio personal ya está activo.</Text>
            </View>
          </View>
        </View>

        {/* Acceso a la pantalla de productos (app/products.tsx).
            push apila la pantalla nueva, así "Volver" regresa a Home. */}
        <TouchableOpacity
          onPress={() => router.push('/products')}
          className="bg-white border border-[#DCE5E2] rounded-2xl p-5 mt-4">
          <Text className="text-[#16332E] font-bold">Gestionar productos</Text>
          <Text className="text-[#70817D] text-xs mt-1">
            Consultar, crear, editar y eliminar productos.
          </Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
}
