// services/auth.ts
// Funciones de autenticación: registrarse, iniciar sesión y cerrar sesión.
// Usan apiRequest (api.ts) para llamar al backend y session.ts para guardar tokens.

import { apiRequest } from './api';
import { clearSession, saveSession } from '@/lib/session';

// Forma de la respuesta que devuelve el backend al iniciar sesión
export type LoginResponse = {
  access_token: string; // llave para las rutas protegidas
  refresh_token: string; // sirve para renovar el access_token
  token_type: string; // normalmente "bearer"
  expires_in: number; // segundos de vida del access_token
  user: {
    id: string;
    email: string;
    role: string;
  };
};

// INICIAR SESIÓN (POST /api/v1/auth/login)
export async function login(email: string, password: string) {
  const data = await apiRequest<LoginResponse>('/api/v1/auth/login', {
    method: 'POST',
    // Los datos viajan como texto JSON en el cuerpo de la petición
    body: JSON.stringify({ email, password }),
  });

  // Si el login salió bien, se guardan los tokens en el celular.
  // Si falló, apiRequest ya lanzó un error y esta línea no se ejecuta.
  await saveSession(data.access_token, data.refresh_token);
  return data;
}

// REGISTRARSE (POST /api/v1/auth/signup)
// No guarda tokens: después de registrarse hay que iniciar sesión.
export async function signup(email: string, password: string) {
  return apiRequest<unknown>('/api/v1/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

// CERRAR SESIÓN (POST /api/v1/auth/logout)
// Todavía no está conectada a ningún botón: en Home el botón de salir
// solo vuelve al login. Es uno de los desafíos opcionales de la guía.
export async function logout() {
  try {
    // auth: true agrega el token, porque esta ruta es protegida
    await apiRequest<void>('/api/v1/auth/logout', {
      method: 'POST',
      auth: true,
    });
  } finally {
    // finally se ejecuta siempre: aunque el backend falle,
    // los tokens se borran del celular igual.
    await clearSession();
  }
}