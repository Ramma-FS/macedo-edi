// app/signup.tsx
// Pantalla de registro. Es la ruta "/signup".
// Flujo: el usuario escribe email y contraseña (8 a 72 caracteres)
// -> se llama a signup() del servicio -> si el backend acepta,
// se vuelve al login para que inicie sesión.

import { useState } from 'react';
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
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react-native'; // íconos
import { signup } from '@/services/auth'; // función que llama al endpoint de registro

export default function SignupScreen() {
  // ---------- ESTADOS ----------
  const [email, setEmail] = useState(''); // texto del campo email
  const [password, setPassword] = useState(''); // texto del campo contraseña
  const [showPassword, setShowPassword] = useState(false); // true = se ve la contraseña
  const [error, setError] = useState<string | null>(null); // mensaje de error (null = sin error)
  const [loading, setLoading] = useState(false); // true mientras se espera la respuesta del backend
  // Qué campo está seleccionado, para pintar su borde de verde
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);

  // ---------- REGISTRARSE ----------
  async function handleSignUp() {
    // Validación: email no vacío y contraseña de 8 a 72 caracteres (regla del backend)
    if (!email.trim() || password.length < 8 || password.length > 72) {
      setError('Usá un correo válido y una contraseña de 8 a 72 caracteres.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // Llama al endpoint real de registro
      await signup(email.trim(), password);
      // Si salió bien, vuelve al login ("/" es app/index.tsx)
      router.replace('/');
    } catch (e) {
      // Si el backend rechaza (email repetido, dominio inválido, etc.), se muestra su mensaje
      setError(e instanceof Error ? e.message : 'No se pudo registrar.');
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

            {/* Botón de volver, logo y título */}
            <View className="mb-10">
              {/* asChild hace que el Link use el TouchableOpacity como botón */}
              <Link href="/" asChild>
                <TouchableOpacity className="w-11 h-11 bg-white border border-[#DCE5E2] rounded-xl items-center justify-center mb-9">
                  <ArrowLeft size={20} color="#324943" />
                </TouchableOpacity>
              </Link>
              <View className="flex-row items-center mb-9">
                <View className="w-11 h-11 bg-[#145F52] rounded-xl items-center justify-center">
                  <Text className="text-white text-xl font-bold">M</Text>
                </View>
                <View className="ml-3">
                  <Text className="text-[#16332E] text-base font-bold">MACEDO</Text>
                  <Text className="text-[#70817D] text-xs">Tu espacio, en orden</Text>
                </View>
              </View>
              <Text className="text-[#16332E] text-[30px] leading-9 font-bold">
                Crea tu cuenta
              </Text>
              <Text className="text-[#70817D] text-[15px] leading-6 mt-2">
                Empieza hoy. Solo te tomará un minuto.
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
            <View className="mb-6">
              <Text className="text-[#324943] text-sm font-bold mb-2">
                Contraseña
              </Text>
              <View className={`flex-row items-center bg-white rounded-xl border px-4 h-14 ${focusedField === 'password' ? 'border-[#145F52]' : 'border-[#DCE5E2]'}`}>
                <Lock size={19} color={focusedField === 'password' ? '#145F52' : '#8A9A96'} />
                <TextInput
                  className="flex-1 ml-3 text-[#16332E] text-[15px]"
                  placeholder="De 8 a 72 caracteres"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword} // oculta los caracteres salvo que showPassword sea true
                  textContentType="newPassword" // le indica al celular que es una contraseña nueva
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

            {/* Cuadro de error: solo se ve si error tiene texto */}
            {error && (
              <View className="bg-[#FFF0ED] border border-[#F5C8BE] rounded-xl px-4 py-3 mb-4">
                <Text className="text-[#A93E2B] text-sm">{error}</Text>
              </View>
            )}

            {/* Botón principal: registra al usuario */}
            <TouchableOpacity
              onPress={handleSignUp}
              disabled={loading} // evita tocarlo dos veces mientras carga
              activeOpacity={0.8}
              className={`bg-[#145F52] rounded-xl h-14 items-center justify-center ${loading ? 'opacity-60' : ''}`}>
              <Text className="text-white text-base font-semibold">
                {loading ? 'Registrando...' : 'Registrarme'}
              </Text>
            </TouchableOpacity>

            {/* Enlace al login */}
            <View className="flex-row flex-wrap justify-center mt-8">
              <Text className="text-[#70817D] text-sm mr-1">
                ¿Ya tienes una cuenta?
              </Text>
              <Link href="/" className="text-[#145F52] text-sm font-bold">
                Inicia sesión
              </Link>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
