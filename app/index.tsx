// app/index.tsx
// Pantalla de inicio de sesión (login). Es la primera que se ve al abrir la app
// (en Expo Router, "index" es la ruta "/").
// Flujo: el usuario escribe email y contraseña -> se llama a login() del servicio
// -> si el backend acepta, se guardan los tokens y se pasa a Home.

import { useState } from 'react';
import { login } from '@/services/auth'; // función que llama al backend y guarda los tokens
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView, // sube el contenido cuando aparece el teclado
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // respeta la barra de estado y los bordes del celular
import { Link, router } from 'expo-router'; // Link = enlace entre pantallas, router = navegar desde código
import { Mail, Lock, Eye, EyeOff } from 'lucide-react-native'; // íconos

export default function LoginScreen() {
  // ---------- ESTADOS ----------
  const [email, setEmail] = useState(''); // texto del campo email
  const [password, setPassword] = useState(''); // texto del campo contraseña
  const [showPassword, setShowPassword] = useState(false); // true = se ve la contraseña
  const [error, setError] = useState<string | null>(null); // mensaje de error (null = sin error)
  const [loading, setLoading] = useState(false); // true mientras se espera la respuesta del backend
  // Qué campo está seleccionado, para pintar su borde de verde
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

  // ---------- INICIAR SESIÓN ----------
  async function handleSignIn() {
    // Validación básica: no se llama al backend con campos vacíos
    if (!email.trim() || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // Llama al endpoint real de login. Si sale bien, login() también guarda los tokens.
      await login(email.trim(), password);
      // replace (en vez de push) para que, al tocar "atrás", no se vuelva al login
      router.replace('/home');
    } catch (e) {
      // Si el backend rechaza (credenciales incorrectas, etc.), se muestra su mensaje
      setError(e instanceof Error ? e.message : 'No se pudo iniciar sesión.');
    } finally {
      // Se ejecuta siempre: vuelve a habilitar el botón
      setLoading(false);
    }
  }

  // ---------- PANTALLA ----------
  return (
    <SafeAreaView className="flex-1 bg-[#F4F7F6]">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        <ScrollView
          contentContainerClassName="flex-grow justify-center"
          keyboardShouldPersistTaps="handled">
          <View className="w-full max-w-[440px] self-center px-6 py-8">

            {/* Logo y título */}
            <View className="mb-10">
              <View className="flex-row items-center mb-10">
                <View className="w-11 h-11 bg-[#145F52] rounded-xl items-center justify-center">
                  <Text className="text-white text-xl font-bold">M</Text>
                </View>
                <View className="ml-3">
                  <Text className="text-[#16332E] text-base font-bold">MACEDO</Text>
                  <Text className="text-[#70817D] text-xs">Tu espacio, en orden</Text>
                </View>
              </View>
              <Text className="text-[#16332E] text-[30px] leading-9 font-bold">
                Bienvenido de nuevo
              </Text>
              <Text className="text-[#70817D] text-[15px] leading-6 mt-2">
                Ingresa tus datos para acceder a tu cuenta.
              </Text>
            </View>

            {/* Campo: correo electrónico */}
            <View className="mb-4">
              <Text className="text-[#324943] text-sm font-bold mb-2">
                Correo electrónico
              </Text>
              {/* El borde cambia de color según si el campo está seleccionado */}
              <View className={`flex-row items-center bg-white rounded-xl border px-4 h-14 ${focusedField === 'email' ? 'border-[#145F52]' : 'border-[#DCE5E2]'}`}>
                <Mail size={19} color={focusedField === 'email' ? '#145F52' : '#8A9A96'} />
                <TextInput
                  className="flex-1 ml-3 text-[#16332E] text-[15px]"
                  placeholder="tucorreo@ejemplo.com"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={setEmail} // cada letra escrita actualiza el estado
                  autoCapitalize="none" // no pone mayúscula automática
                  autoCorrect={false} // desactiva el autocorrector
                  keyboardType="email-address" // teclado con @
                  textContentType="emailAddress"
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            </View>

            {/* Campo: contraseña */}
            <View className="mb-2">
              <Text className="text-[#324943] text-sm font-bold mb-2">
                Contraseña
              </Text>
              <View className={`flex-row items-center bg-white rounded-xl border px-4 h-14 ${focusedField === 'password' ? 'border-[#145F52]' : 'border-[#DCE5E2]'}`}>
                <Lock size={19} color={focusedField === 'password' ? '#145F52' : '#8A9A96'} />
                <TextInput
                  className="flex-1 ml-3 text-[#16332E] text-[15px]"
                  placeholder="••••••••"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword} // oculta los caracteres salvo que showPassword sea true
                  textContentType="password"
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                />
                {/* Botón del ojito: muestra u oculta la contraseña */}
                <TouchableOpacity
                  onPress={() => setShowPassword((s) => !s)} // invierte el valor actual
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                  {showPassword ? (
                    <EyeOff size={19} color="#70817D" />
                  ) : (
                    <Eye size={19} color="#70817D" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* "Olvidaste tu contraseña": todavía no hace nada (es solo diseño) */}
            <TouchableOpacity className="self-end mb-7 py-1">
              <Text className="text-[#145F52] text-sm font-bold">
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>

            {/* Cuadro de error: solo se ve si error tiene texto */}
            {error && (
              <View className="bg-[#FFF0ED] border border-[#F5C8BE] rounded-xl px-4 py-3 mb-4">
                <Text className="text-[#A93E2B] text-sm">{error}</Text>
              </View>
            )}

            {/* Botón principal: inicia sesión */}
            <TouchableOpacity
              onPress={handleSignIn}
              disabled={loading} // evita tocarlo dos veces mientras carga
              activeOpacity={0.8}
              className={`bg-[#145F52] rounded-xl h-14 items-center justify-center ${loading ? 'opacity-60' : ''}`}>
              <Text className="text-white text-base font-semibold">
                {loading ? 'Ingresando...' : 'Iniciar sesión'}
              </Text>
            </TouchableOpacity>

            {/* Separador visual */}
            <View className="flex-row items-center my-7">
              <View className="flex-1 h-px bg-[#DCE5E2]" />
              <Text className="text-[#8A9A96] text-xs mx-4">O CONTINÚA CON</Text>
              <View className="flex-1 h-px bg-[#DCE5E2]" />
            </View>

            {/* Botón de Google: todavía no hace nada (es solo diseño) */}
            <TouchableOpacity
              activeOpacity={0.8}
              className="flex-row items-center justify-center bg-white border border-[#DCE5E2] rounded-xl h-14">
              <View className="w-7 h-7 rounded-full bg-[#FFF3EF] items-center justify-center mr-3">
                <Text className="text-[#E35F42] text-sm font-bold">G</Text>
              </View>
              <Text className="text-[#324943] text-sm font-bold">
                Continuar con Google
              </Text>
            </TouchableOpacity>

            {/* Enlace a la pantalla de registro (app/signup.tsx) */}
            <View className="flex-row flex-wrap justify-center mt-8">
              <Text className="text-[#70817D] text-sm mr-1">
                ¿No tienes una cuenta?
              </Text>
              <Link href="/signup" className="text-[#145F52] text-sm font-bold">
                Regístrate
              </Link>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}