import { productosCatalogo } from "../data/catalogo";

// Lo que se sugiere cuando todavía no escribí nada
const populares = ["Yerba Mate", "Leche Entera", "Aceite de Girasol", "Zapatillas", "Detergente", "Café", "Arcor", "Súper Sol"];

// Todos los términos buscables: nombres de productos, marcas y comercios, sin repetir.
// Se arma una sola vez al cargar el archivo.
const terminos = [...new Set(productosCatalogo.flatMap((p) => [p.nombre, p.marca, p.tienda.nombre]))];

const MAXIMO = 8;

// Devuelve la lista de sugerencias para lo que escribí.
// Primero las que empiezan igual y después las que lo contienen. Si no hay ninguna, devuelve lo escrito.
export function obtenerSugerencias(texto) {
  const consulta = texto.trim().toLowerCase();
  if (!consulta) return populares;

  const lista = [
    ...terminos.filter((t) => t.toLowerCase().startsWith(consulta)),
    ...terminos.filter((t) => !t.toLowerCase().startsWith(consulta) && t.toLowerCase().includes(consulta)),
  ].slice(0, MAXIMO);

  return lista.length ? lista : [texto.trim()];
}