// app/_layout.tsx
// Layout raíz: envuelve TODAS las pantallas de la app.
// Acá se cargan las fuentes, se controla la pantalla de bienvenida (splash)
// y se declaran las rutas disponibles con un Stack (pantallas apiladas).

import { useEffect } from 'react';
import { Stack } from 'expo-router'; // navegación por pila: cada pantalla se apila sobre la anterior
import { StatusBar } from 'expo-status-bar'; // controla el color de los íconos de la barra superior
import { useFrameworkReady } from '@/hooks/useFrameworkReady'; // hook de la plantilla del proyecto
import { useFonts } from 'expo-font'; // carga fuentes personalizadas
import {
  Inter_400Regular,
  Inter_700Bold,
} from '@expo-google-fonts/inter'; // fuente Inter (normal y negrita)
import * as SplashScreen from 'expo-splash-screen'; // pantalla de bienvenida mientras carga la app
import '../global.css'; // estilos globales de NativeWind (Tailwind)

// Mantiene visible el splash hasta que las fuentes estén listas
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  // Carga las fuentes. fontsLoaded pasa a true al terminar; fontError si falló.
  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
  });

  // Cuando las fuentes terminaron de cargar (o fallaron), se oculta el splash
  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // Mientras no estén listas las fuentes no se dibuja nada
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      {/* headerShown: false oculta la barra de título; cada pantalla tiene su propio diseño.
          initialRouteName="index": la primera pantalla es el login. */}
      <Stack
        screenOptions={{ headerShown: false }}
        initialRouteName="index">
        {/* Cada Stack.Screen coincide con un archivo de la carpeta app/ */}
        {/* app/index.tsx -> login */}
        <Stack.Screen name="index" />
        {/* app/home.tsx -> inicio */}
        <Stack.Screen name="home" />
        {/* app/signup.tsx -> registro */}
        <Stack.Screen name="signup" />
        {/* app/products.tsx -> productos */}
        <Stack.Screen name="products" />
        {/* pantalla para rutas que no existen */}
        <Stack.Screen name="+not-found" />
      </Stack>
      {/* Íconos oscuros en la barra superior, porque el fondo es claro */}
      <StatusBar style="dark" />
    </>
  );
}
