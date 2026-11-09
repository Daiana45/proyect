// Datos de ejemplo del menú. Después las categorías salen de GET /categorias.
// Cada categoría tiene grupos, y cada grupo tiene sus ítems.
export const menuCategorias = [
  {
    nombre: "Deportes",
    grupos: [
      { titulo: "Calzado", items: ["Zapatillas", "Botines", "Ojotas"] },
      { titulo: "Camping", items: ["Mochilas", "Carpas", "Bolsas de dormir"] },
      { titulo: "Entrenamiento", items: ["Pesas", "Colchonetas", "Bicicletas"] },
      { titulo: "Indumentaria", items: ["Remeras", "Shorts", "Camperas"] },
      { titulo: "Pelotas", items: ["Fútbol", "Básquet", "Vóley"] },
    ],
  },
  {
    nombre: "Hogar",
    grupos: [
      { titulo: "Decoración", items: ["Velas", "Cuadros", "Almohadones"] },
      { titulo: "Cocina", items: ["Ollas", "Vajilla", "Utensilios"] },
      { titulo: "Dormitorio", items: ["Almohadas", "Sábanas", "Acolchados"] },
      { titulo: "Climatización", items: ["Ventiladores", "Estufas", "Aires"] },
    ],
  },
  {
    nombre: "Alimentos",
    grupos: [
      { titulo: "Almacén", items: ["Yerba", "Café", "Fideos"] },
      { titulo: "Frescos", items: ["Lácteos", "Fiambres", "Huevos"] },
      { titulo: "Desayuno", items: ["Galletitas", "Mermeladas", "Cereales"] },
      { titulo: "Congelados", items: ["Hamburguesas", "Verduras", "Helados"] },
    ],
  },
  {
    nombre: "Mascotas",
    grupos: [
      { titulo: "Perros", items: ["Alimento", "Camas", "Juguetes"] },
      { titulo: "Gatos", items: ["Alimento", "Rascadores", "Arena"] },
      { titulo: "Otros animales", items: ["Aves", "Peces", "Roedores"] },
    ],
  },
  {
    nombre: "Bebidas",
    grupos: [
      { titulo: "Sin alcohol", items: ["Gaseosas", "Aguas", "Jugos"] },
      { titulo: "Con alcohol", items: ["Cervezas", "Vinos", "Fernet"] },
      { titulo: "Infusiones", items: ["Té", "Mate cocido", "Café frío"] },
    ],
  },
  {
    nombre: "Panadería",
    grupos: [
      { titulo: "Panes", items: ["Pan francés", "Pan lactal", "Pan de molde"] },
      { titulo: "Dulces", items: ["Facturas", "Tortas", "Alfajores"] },
      { titulo: "Salados", items: ["Empanadas", "Tartas", "Pizzas"] },
    ],
  },
  {
    nombre: "Frutas y Verduras",
    grupos: [
      { titulo: "Frutas", items: ["Manzanas", "Bananas", "Cítricos"] },
      { titulo: "Verduras", items: ["Tomates", "Papas", "Cebollas"] },
      { titulo: "De hoja", items: ["Lechuga", "Acelga", "Espinaca"] },
    ],
  },
  {
    nombre: "Limpieza",
    grupos: [
      { titulo: "Hogar", items: ["Lavandina", "Limpiapisos", "Desinfectantes"] },
      { titulo: "Cocina", items: ["Detergentes", "Esponjas", "Trapos"] },
      { titulo: "Ropa", items: ["Jabón en polvo", "Suavizantes", "Quitamanchas"] },
    ],
  },
  {
    nombre: "Ferretería",
    grupos: [
      { titulo: "Herramientas", items: ["Taladros", "Destornilladores", "Martillos"] },
      { titulo: "Electricidad", items: ["Cables", "Lamparitas", "Tomas"] },
      { titulo: "Pinturas", items: ["Látex", "Esmaltes", "Rodillos"] },
    ],
  },
  {
    nombre: "Librería",
    grupos: [
      { titulo: "Escolar", items: ["Cuadernos", "Carpetas", "Mochilas"] },
      { titulo: "Escritura", items: ["Lapiceras", "Lápices", "Marcadores"] },
      { titulo: "Oficina", items: ["Resmas", "Abrochadoras", "Biblioratos"] },
    ],
  },
  {
    nombre: "Farmacia",
    grupos: [
      { titulo: "Medicamentos", items: ["Analgésicos", "Antigripales", "Vitaminas"] },
      { titulo: "Cuidado personal", items: ["Protector solar", "Cremas", "Shampoo"] },
      { titulo: "Higiene", items: ["Alcohol en gel", "Barbijos", "Pañales"] },
    ],
  },
  {
    nombre: "Otros",
    grupos: [
      { titulo: "Electrónica", items: ["Auriculares", "Parlantes", "Cargadores"] },
      { titulo: "Relojes", items: ["Smartwatches", "Pulseras", "Accesorios"] },
      { titulo: "Regalos", items: ["Tarjetas", "Packaging", "Artículos de fiesta"] },
    ],
  },
];