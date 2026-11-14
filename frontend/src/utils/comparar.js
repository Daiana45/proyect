import { aKm } from "./textoDistancia";

// Dos publicaciones son "el mismo producto" si coinciden categoría, marca y nombre.
// Cuando venga el backend esto se reemplaza por el id del producto.
export const claveDe = (p) => `${p.categorias[0].nombre}|${p.marca}|${p.nombre}`.toLowerCase();

// Junta todas las publicaciones del mismo producto y calcula la comparación.
// Devuelve: ofertas (de la más barata a la más cara), mejor, masCara, masCerca y ahorro (en pesos).
export function compararProducto(producto, catalogo) {
  const clave = claveDe(producto);

  // Una oferta por comercio: si un comercio apareciera dos veces me quedo con la más barata
  const porTienda = new Map();
  catalogo
    .filter((p) => claveDe(p) === clave)
    .forEach((p) => {
      const actual = porTienda.get(p.tienda.nombre);
      if (!actual || p.precio < actual.precio) porTienda.set(p.tienda.nombre, p);
    });

  // Orden: por precio y, si empatan, el más cercano primero
  const ofertas = [...porTienda.values()].sort((a, b) => a.precio - b.precio || aKm(a.distancia) - aKm(b.distancia));

  const mejor = ofertas[0];
  const masCara = ofertas[ofertas.length - 1];
  const masCerca = ofertas.reduce((cerca, o) => (aKm(o.distancia) < aKm(cerca.distancia) ? o : cerca), ofertas[0]);

  return { ofertas, mejor, masCara, masCerca, ahorro: masCara.precio - mejor.precio };
}