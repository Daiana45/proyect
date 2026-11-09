import { productos as basicos } from "./productos";

// Hora actual calculada una vez, y una función para sacar la fecha y hora de "hace N horas".
// Las horas pueden llevar decimales: 0.5 = 30 minutos.
const hoy = Date.now();
const fechaHace = (horas) => new Date(hoy - horas * 3600000).toISOString();

// Cada fila: [id, nombre, marca, precio, precio anterior (o null), categoría, tienda, distancia, horas desde que se cargó, me gusta, cuotas (opcional)]
// Así cargo muchos productos sin escribir un objeto entero por cada uno.
const filas = [
  [101, "Gaseosa Cola 2,25 L", "Coca-Cola", 2900, null, "Bebidas", "Súper Sol", "1,1 km", 30, 64],
  [102, "Gaseosa Cola 2,25 L", "Coca-Cola", 2750, 3100, "Bebidas", "Mayorista Centro", "3,2 km", 20, 40],
  [103, "Cerveza Rubia 1 L", "Quilmes", 2300, null, "Bebidas", "Kiosco 24 hs López", "300 m", 72, 52],
  [104, "Agua Mineral 2 L", "Villavicencio", 1100, 1300, "Bebidas", "Almacén Don Pepe", "400 m", 96, 21],
  [105, "Jugo en Polvo x 10", "Tang", 1800, null, "Bebidas", "Súper Sol", "1,1 km", 150, 18],
  [106, "Pan Lactal Grande", "Bimbo", 2600, null, "Panadería", "Súper Sol", "1,1 km", 6, 37],
  [107, "Facturas x 12", "Artesanal", 4800, 5400, "Panadería", "Panadería San José", "700 m", 0.5, 71],
  [108, "Pan Francés 1 kg", "Artesanal", 2400, null, "Panadería", "Panadería San José", "700 m", 3, 45],
  [109, "Tomate Redondo 1 kg", "Regional", 1900, 2300, "Frutas y Verduras", "Frutería La Esquina", "600 m", 22, 26],
  [110, "Banana 1 kg", "Regional", 1600, null, "Frutas y Verduras", "Feria del Sol", "2,4 km", 50, 19],
  [111, "Manzana Roja 1 kg", "Regional", 2100, null, "Frutas y Verduras", "Frutería La Esquina", "600 m", 75, 23],
  [112, "Limpiador de Pisos 900 ml", "Procenex", 2300, 2700, "Limpieza", "Mayorista Centro", "3,2 km", 120, 17],
  [113, "Jabón en Polvo 3 kg", "Skip", 9800, 11900, "Limpieza", "Súper Sol", "1,1 km", 190, 44, 6],
  [114, "Taladro Percutor 650 W", "Black+Decker", 68900, 79900, "Ferretería", "Ferretería El Tornillo", "1,6 km", 240, 33, 12],
  [115, "Set de Destornilladores x 6", "Stanley", 12900, null, "Ferretería", "Ferretería El Tornillo", "1,6 km", 290, 15],
  [116, "Cuaderno Rayado 96 hojas", "Rivadavia", 2900, null, "Librería", "Librería Papel", "1,3 km", 100, 28],
  [117, "Set de Lapiceras x 10", "Bic", 3200, 3800, "Librería", "Librería Papel", "1,3 km", 140, 24],
  [118, "Ibuprofeno 400 mg x 20", "Bayer", 3900, null, "Farmacia", "Farmacia Central", "900 m", 4, 30],
  [119, "Protector Solar FPS 50", "Nivea", 12500, 14900, "Farmacia", "Farmacia Central", "900 m", 210, 41, 3],
  [120, "Alimento para Perro 15 kg", "Pedigree", 39900, 45900, "Mascotas", "PetLove", "3,1 km", 70, 58, 12],
  [121, "Arena para Gatos 4 kg", "Sanicat", 6800, null, "Mascotas", "PetLove", "3,1 km", 168, 20],
  [122, "Pelota de Fútbol N°5", "Topper", 18900, 22900, "Deportes", "Deportes Norte", "1,2 km", 120, 47, 6],
  [123, "Remera Deportiva", "Topper", 14900, null, "Deportes", "Deportes Norte", "1,2 km", 260, 25, 3],
  [124, "Set de Ollas x 5", "Essen", 89900, 99900, "Hogar", "Hogar & Deco", "900 m", 140, 36, 12],
  [125, "Almohada Viscoelástica", "Cannon", 21900, null, "Hogar", "Hogar & Deco", "900 m", 330, 19, 6],
  [126, "Ventilador de Pie", "Liliana", 52900, 59900, "Hogar", "TechZone", "2,4 km", 90, 38, 12],
  [127, "Fideos Tirabuzón 500 g", "Matarazzo", 1500, null, "Alimentos", "Mayorista Centro", "3,2 km", 12, 22],
  [128, "Arroz Largo Fino 1 kg", "Gallo", 2100, 2500, "Alimentos", "Almacén Don Pepe", "400 m", 80, 31],
  [129, "Smartwatch Deportivo", "Xiaomi", 44900, 52900, "Otros", "TechZone", "2,4 km", 2, 66, 12],
];

// Convierto cada fila en un producto con la misma forma que los de productos.js
const extra = filas.map(([id, nombre, marca, precio, anterior, categoria, tienda, distancia, horas, me_gusta, cuotas]) => ({
  id,
  nombre,
  marca,
  precio,
  precio_anterior: anterior,
  en_oferta: anterior !== null,
  me_gusta,
  imagen: null,
  distancia,
  createdAt: fechaHace(horas),
  tienda: { nombre: tienda },
  categorias: [{ nombre: categoria }],
  ...(cuotas ? { cuotas } : {}),
}));

// El catálogo completo: los de siempre + los nuevos. La página de inicio sigue usando solo productos.js.
export const productosCatalogo = [...basicos, ...extra];