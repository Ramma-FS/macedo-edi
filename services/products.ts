// services/products.ts
// Funciones del CRUD de productos. Cada una llama a un endpoint del backend.
// Todas llevan auth: true porque las rutas de productos requieren sesión iniciada.

import { apiRequest } from './api';
import { Product, ProductInput } from '@/types/product';

// Forma de la respuesta del listado: los productos vienen en "data"
// y "meta" trae la información de paginación.
type ProductListResponse = {
  data: Product[];
  meta: {
    page: number; // página actual
    limit: number; // cuántos productos por página
    total: number; // total de productos que existen
  };
};

// LISTAR (GET /api/v1/products)
// page, limit y search tienen valores por defecto, así que se puede llamar
// simplemente listProducts() para traer la primera página.
export function listProducts(page = 1, limit = 20, search = '') {
  // URLSearchParams arma el texto "?page=1&limit=20" de forma segura
  const query = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  // El parámetro search solo se agrega si el usuario escribió algo
  if (search.trim()) query.set('search', search.trim());

  return apiRequest<ProductListResponse>(
    `/api/v1/products?${query.toString()}`,
    { auth: true }
  );
}

// CREAR (POST /api/v1/products)
// input debe llevar solo los campos permitidos (ver ProductInput).
export function createProduct(input: ProductInput) {
  return apiRequest<{ data: Product }>('/api/v1/products', {
    method: 'POST',
    auth: true,
    body: JSON.stringify(input),
  });
}

// EDITAR (PATCH /api/v1/products/:id)
// Partial<ProductInput> significa que todos los campos son opcionales:
// se envían solo los que cambiaron. El id va en la URL.
export function updateProduct(id: string, input: Partial<ProductInput>) {
  return apiRequest<{ data: Product }>(`/api/v1/products/${id}`, {
    method: 'PATCH',
    auth: true,
    body: JSON.stringify(input),
  });
}

// ELIMINAR (DELETE /api/v1/products/:id)
// El backend responde 204 (sin contenido), por eso el tipo es void.
export function deleteProduct(id: string) {
  return apiRequest<void>(`/api/v1/products/${id}`, {
    method: 'DELETE',
    auth: true,
  });
}