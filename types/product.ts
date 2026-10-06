// types/product.ts
// Tipos de TypeScript para los productos. No generan código que se ejecute:
// solo le dicen al editor qué forma tienen los datos, así avisa si usás
// un campo que no existe (como pasaba con "title" o "thumbnail" de DummyJSON).

// Product: lo que DEVUELVE el backend al listar, crear o editar un producto
export type Product = {
  id: string; // lo genera el backend
  owner_id: string; // dueño del producto; el backend lo toma del token
  name: string; // 2 a 160 caracteres
  description: string; // hasta 5000 caracteres
  price: string; // la API lo devuelve como TEXTO (por eso se usa Number(item.price))
  stock: number; // entero mayor o igual a 0
  active: boolean; // si el producto está activo
  created_at: string; // fecha de creación, la pone el backend
  updated_at: string; // fecha de última modificación, la pone el backend
};

// ProductInput: lo que se ENVÍA al crear o editar.
// Solo lleva los campos permitidos; id, owner_id, created_at y updated_at
// NO se envían porque el backend los rechaza (error 400 invalid_json).
export type ProductInput = {
  name: string; // obligatorio
  description?: string; // el "?" significa que es opcional
  price: number; // al enviar va como NÚMERO (al recibir llega como texto)
  stock?: number; // opcional; si no se manda, el backend usa 0
  active?: boolean; // opcional; si no se manda, el backend usa true
};
