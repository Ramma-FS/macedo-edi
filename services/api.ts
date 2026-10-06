// services/api.ts
// Función común para hablar con el backend. Todos los demás servicios
// (auth.ts, products.ts) pasan por acá, así la lógica de la URL, el token
// y los errores está escrita una sola vez.

import { getAccessToken } from '@/lib/session';

// URL base del backend. Se toma de la variable EXPO_PUBLIC_API_URL del archivo .env.
// Si esa variable no existe, usa la URL de la guía como valor por defecto.
const API_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  'https://backend-proyecto.n7softwares.com';

// Opciones de la petición: son las de fetch más una propia, "auth".
// Si auth es true, la función agrega el token a la petición.
type RequestOptions = RequestInit & {
  auth?: boolean;
};

// <T> es el tipo de dato que se espera recibir. Por ejemplo,
// apiRequest<LoginResponse>(...) devuelve un LoginResponse ya tipado.
export async function apiRequest<T>(
  path: string, // ruta del endpoint, por ejemplo '/api/v1/products'
  options: RequestOptions = {}
): Promise<T> {
  // Encabezados (headers) de la petición
  const headers = new Headers(options.headers);
  // Avisa al backend que se envía y se espera JSON
  headers.set('Content-Type', 'application/json');

  // Si la ruta es protegida, se agrega el token en el header Authorization
  if (options.auth) {
    const token = await getAccessToken();
    // Sin token no tiene sentido llamar: se corta con un error claro
    if (!token) throw new Error('No hay una sesión iniciada.');
    headers.set('Authorization', `Bearer ${token}`);
  }

  // Hace la petición real: URL base + ruta
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  // 204 significa "salió bien pero no hay contenido" (lo usa DELETE).
  // No hay JSON para leer, así que se devuelve vacío.
  if (response.status === 204) {
    return undefined as T;
  }

  // Convierte la respuesta de texto JSON a un objeto de JavaScript
  const body = await response.json();

  // response.ok es false cuando el código HTTP es 400, 401, 404, 422, etc.
  if (!response.ok) {
    // Busca el mensaje de error en el lugar donde cada servicio lo manda
    const message =
      body?.error?.message ?? // errores propios del backend
      body?.msg ?? // errores de Supabase Auth (login/signup)
      `Error HTTP ${response.status}`; // si no hay mensaje, muestra el código

    // Lanza el error: la pantalla lo atrapa con try/catch y lo muestra
    throw new Error(message);
  }

  return body as T;
}