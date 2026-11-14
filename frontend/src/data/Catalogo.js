import { productos as basicos } from "./productos";
import { menuCategorias } from "./menuCategorias";
import { tiendas } from "./tiendas";

// Hora actual calculada una vez, y una función para sacar la fecha y hora de "hace N horas".
// Las horas pueden llevar decimales: 0.5 = 30 minutos.
const hoy = Date.now();
const fechaHace = (horas) => new Date(hoy - horas * 3600000).toISOString();

// ---------- MODELO ----------
// Cada elemento del catálogo es UNA PUBLICACIÓN: un comercio que vende un producto a su precio.
// El mismo producto (mismo nombre, marca y categoría) aparece en varios comercios, y la página del producto
// los junta para compararlos. Son datos de ejemplo: cuando venga el backend, esto se borra.

// En qué comercios se vende cada categoría (todas tienen al menos 3, para poder comparar).
export const comerciosPorCategoria = {
  Deportes: ["Deportes Norte", "Tienda del Barrio", "Mayorista Centro"],
  Hogar: ["Hogar & Deco", "TechZone", "Tienda del Barrio"],
  Alimentos: ["Almacén Don Pepe", "Súper Sol", "Mayorista Centro", "Frutería La Esquina"],
  Mascotas: ["PetLove", "Tienda del Barrio", "Súper Sol"],
  Bebidas: ["Súper Sol", "Kiosco 24 hs López", "Mayorista Centro", "Almacén Don Pepe"],
  Panadería: ["Panadería San José", "Súper Sol", "Almacén Don Pepe"],
  "Frutas y Verduras": ["Frutería La Esquina", "Feria del Sol", "Súper Sol"],
  Limpieza: ["Súper Sol", "Mayorista Centro", "Almacén Don Pepe"],
  Ferretería: ["Ferretería El Tornillo", "Tienda del Barrio", "Mayorista Centro"],
  Librería: ["Librería Papel", "Tienda del Barrio", "Kiosco 24 hs López"],
  Farmacia: ["Farmacia Central", "Súper Sol", "Kiosco 24 hs López"],
  Otros: ["TechZone", "Tienda del Barrio", "Súper Sol"],
};

// Marcas de ejemplo de cada categoría.
const marcasPorCategoria = {
  Deportes: ["Topper", "Norte", "Olympikus"],
  Hogar: ["Essen", "Cannon", "Liliana"],
  Alimentos: ["Arcor", "Marolio", "Ledesma"],
  Mascotas: ["Pedigree", "Sanicat", "Whiskas"],
  Bebidas: ["Coca-Cola", "Quilmes", "Villavicencio"],
  Panadería: ["Bimbo", "Artesanal", "Fargo"],
  "Frutas y Verduras": ["Regional", "Orgánica", "Del Valle"],
  Limpieza: ["Skip", "Procenex", "Verdeflor"],
  Ferretería: ["Stanley", "Black+Decker", "Alba"],
  Librería: ["Rivadavia", "Bic", "Faber-Castell"],
  Farmacia: ["Bayer", "Nivea", "Johnson's"],
  Otros: ["Xiaomi", "Sonora", "Philips"],
};

// La distancia es del COMERCIO, no del producto: el mismo comercio siempre está a la misma distancia.
// Uso la de productos.js cuando existe y, si no, reparto una de la lista.
const distancias = ["300 m", "400 m", "600 m", "900 m", "1,1 km", "1,6 km", "2,4 km", "3,2 km"];
const distanciaDeTienda = {};
basicos.forEach((p) => {
  distanciaDeTienda[p.tienda.nombre] ??= p.distancia;
});
Object.keys(tiendas).forEach((nombre, i) => {
  distanciaDeTienda[nombre] ??= distancias[i % distancias.length];
});

// Cada comercio cobra distinto: multiplico el precio base por un factor según el comercio.
const factoresPrecio = [1, 1.08, 0.94, 1.17, 1.26];
// Algunas publicaciones están en oferta (con precio anterior) y algunas caras tienen cuotas.
const descuentosPosibles = [10, 20, 30, 40, 50];
const ofertaDe = (precio, n) =>
  n % 4 === 0
    ? Math.round(precio / (1 - descuentosPosibles[(n / 4) % descuentosPosibles.length] / 100) / 10) * 10
    : null;
const cuotasDe = (precio, n) => (precio > 35000 && n % 2 === 0 ? [3, 6, 12][n % 3] : null);

// Arma una publicación completa. "n" es un número de orden que uso para variar las cosas sin que
// cambien cada vez que recargo la página.
function publicacion({ id, nombre, marca, categoria, tienda, precioBase, n, extra = {} }) {
  const precio = Math.round((precioBase * factoresPrecio[n % 5]) / 10) * 10;
  const anterior = ofertaDe(precio, n);
  const cuotas = cuotasDe(precio, n);
  return {
    id,
    nombre,
    marca,
    precio,
    precio_anterior: anterior,
    en_oferta: anterior !== null,
    me_gusta: (n * 13) % 120,
    imagen: null,
    distancia: distanciaDeTienda[tienda],
    createdAt: fechaHace((n * 37) % 400),
    tienda: { nombre: tienda },
    categorias: [{ nombre: categoria }],
    ...(cuotas ? { cuotas } : {}),
    ...extra,
  };
}

// Los productos de productos.js también se venden en otros comercios de su categoría
const replicas = basicos.flatMap((p, k) => {
  const categoria = p.categorias[0].nombre;
  const otros = comerciosPorCategoria[categoria].filter((t) => t !== p.tienda.nombre).slice(0, 2 + (k % 2));
  return otros.map((tienda, j) =>
    publicacion({ id: 1000 + k * 10 + j, nombre: p.nombre, marca: p.marca, categoria, tienda, precioBase: p.precio, n: k + j + 1 })
  );
});

// Un producto por cada ítem del menú de categorías, vendido en 2 a 4 comercios de esa categoría
const generados = menuCategorias
  .flatMap((cat) => cat.grupos.flatMap((grupo) => grupo.items.map((item) => ({ cat: cat.nombre, grupo: grupo.titulo, item }))))
  .flatMap(({ cat, grupo, item }, i) => {
    const marca = marcasPorCategoria[cat][i % 3];
    const comercios = comerciosPorCategoria[cat];
    const precioBase = Math.round((1500 + ((i * 7919) % 60000)) / 10) * 10;
    const cantidad = Math.min(comercios.length, 2 + (i % 3));
    return Array.from({ length: cantidad }, (_, j) =>
      publicacion({
        id: 2000 + i * 10 + j,
        nombre: `${item} ${marca}`,
        marca,
        categoria: cat,
        tienda: comercios[(i + j) % comercios.length],
        precioBase,
        n: i + j,
        // grupo y subcategoria: los usa el menú de categorías para filtrar (?grupo= y ?sub=)
        extra: { grupo, subcategoria: item },
      })
    );
  });

// El catálogo completo. La página de inicio sigue usando solo productos.js.
export const productosCatalogo = [...basicos, ...replicas, ...generados];