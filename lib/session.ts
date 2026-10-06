// lib/session.ts
// Guarda, lee y borra los tokens de la sesión en el celular.
// Usa AsyncStorage, que es un almacenamiento simple de pares clave/valor
// que sigue ahí aunque se cierre la app.
//
// Los dos tokens que entrega el backend al iniciar sesión:
//   - access_token:  es la "llave" que se envía en cada petición protegida.
//                    Dura poco tiempo.
//   - refresh_token: sirve para pedir un access_token nuevo cuando vence.

import AsyncStorage from '@react-native-async-storage/async-storage';

// Nombres (claves) con los que se guardan los tokens
const ACCESS_TOKEN = 'access_token';
const REFRESH_TOKEN = 'refresh_token';

// Guarda los dos tokens juntos. Se llama después de un login exitoso.
// multiSet guarda varios pares clave/valor en una sola operación.
export async function saveSession(accessToken: string, refreshToken: string) {
  await AsyncStorage.multiSet([
    [ACCESS_TOKEN, accessToken],
    [REFRESH_TOKEN, refreshToken],
  ]);
}

// Devuelve el access_token guardado, o null si no hay sesión iniciada.
// Lo usa api.ts para armar el header Authorization.
export async function getAccessToken() {
  return AsyncStorage.getItem(ACCESS_TOKEN);
}

// Devuelve el refresh_token guardado (se usaría para renovar la sesión).
export async function getRefreshToken() {
  return AsyncStorage.getItem(REFRESH_TOKEN);
}

// Borra los dos tokens. Es lo que "cierra la sesión" en el celular.
export async function clearSession() {
  await AsyncStorage.multiRemove([ACCESS_TOKEN, REFRESH_TOKEN]);
}