// Comercios de ejemplo. Después salen de GET /tiendas.
// distanciaKm: por ahora inventada. Con el backend la calculo con la ubicación de la persona.
import { ubicaciones } from "./ubicaciones";

const base = [
  { id: 1, nombre: "Deportes Norte", categoria: "Deportes", distanciaKm: 1.2 },
  { id: 2, nombre: "TechZone", categoria: "Otros", distanciaKm: 2.4 },
  { id: 3, nombre: "Tienda del Barrio", categoria: "Deportes", distanciaKm: 1.8 },
  { id: 4, nombre: "Hogar & Deco", categoria: "Hogar", distanciaKm: 0.9 },
  { id: 5, nombre: "Frutería La Esquina", categoria: "Alimentos", distanciaKm: 0.6 },
  { id: 6, nombre: "PetLove", categoria: "Mascotas", distanciaKm: 3.1 },
  { id: 7, nombre: "Almacén Don Pepe", categoria: "Alimentos", distanciaKm: 0.4 },
  { id: 8, nombre: "Café del Centro", categoria: "Alimentos", distanciaKm: 1.8 },
];

// La dirección de cada comercio sale de ubicaciones.js (la que armás con /editor-ubicaciones),
// así siempre coincide con el punto del mapa. Si todavía no tiene dirección, no se muestra ninguna.
const conDireccion = base.map((comercio) => ({ ...comercio, direccion: ubicaciones[comercio.nombre]?.direccion }));

// Los comercios que están en el mapa pero no en la lista de arriba también entran, para que su dirección se vea
const extras = Object.entries(ubicaciones)
  .filter(([nombre]) => !base.some((comercio) => comercio.nombre === nombre))
  .map(([nombre, ubicacion], i) => ({ id: base.length + i + 1, nombre, direccion: ubicacion.direccion }));

export const comercios = [...conDireccion, ...extras];