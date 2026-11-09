// Datos de cada comercio. Es provisorio: el backend me va a mandar tipo, rubro, valoración y si está abierto.
// tipo: Cadena | Pyme | Mayorista | Kiosco | Feria (cómo es el comercio)
// rubro: a qué se dedica (supermercado, farmacia, ferretería...)
export const tiendas = {
  "Almacén Don Pepe": { tipo: "Pyme", rubro: "Almacén", rating: 4.5, abierto: true },
  "Súper Sol": { tipo: "Cadena", rubro: "Supermercado", rating: 4.2, abierto: true },
  "Frutería La Esquina": { tipo: "Pyme", rubro: "Verdulería y frutería", rating: 4.7, abierto: true },
  TechZone: { tipo: "Cadena", rubro: "Electrónica", rating: 4.3, abierto: true },
  "Tienda del Barrio": { tipo: "Pyme", rubro: "Tienda general", rating: 4.1, abierto: false },
  "Deportes Norte": { tipo: "Cadena", rubro: "Deportes", rating: 4.4, abierto: true },
  "Hogar & Deco": { tipo: "Pyme", rubro: "Hogar y decoración", rating: 4.6, abierto: true },
  PetLove: { tipo: "Cadena", rubro: "Mascotas", rating: 4.5, abierto: true },
  "Mayorista Centro": { tipo: "Mayorista", rubro: "Mayorista", rating: 4.0, abierto: true },
  "Kiosco 24 hs López": { tipo: "Kiosco", rubro: "Kiosco", rating: 4.2, abierto: true },
  "Panadería San José": { tipo: "Pyme", rubro: "Panadería", rating: 4.8, abierto: true },
  "Feria del Sol": { tipo: "Feria", rubro: "Feria y mercado", rating: 4.4, abierto: false },
  "Ferretería El Tornillo": { tipo: "Pyme", rubro: "Ferretería", rating: 4.6, abierto: true },
  "Librería Papel": { tipo: "Pyme", rubro: "Librería", rating: 4.3, abierto: false },
  "Farmacia Central": { tipo: "Cadena", rubro: "Farmacia", rating: 4.5, abierto: true },
};

// Datos de una tienda. Si no está en la lista, uso valores por defecto.
export const datosTienda = (nombre) => tiendas[nombre] ?? { tipo: "Pyme", rubro: "Otros", rating: 4, abierto: true };

// Solo el tipo ("Cadena", "Pyme"...).
export const tipoDeTienda = (nombre) => datosTienda(nombre).tipo;