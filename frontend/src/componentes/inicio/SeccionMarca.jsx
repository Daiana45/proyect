import { useState } from "react";
import CarruselProductos from "./CarruselProductos";
import { productos } from "../../data/productos";

// Armo la lista de marcas sacándola de los productos.
// Set elimina las repetidas. "Todas" va primero.
const marcas = ["Todas", ...new Set(productos.map((producto) => producto.marca))];

export default function SeccionMarca() {
  const [marcaActiva, setMarcaActiva] = useState("Todas");

  // Si eligió una marca, me quedo solo con sus productos.
  const filtrados =
    marcaActiva === "Todas" ? productos : productos.filter((producto) => producto.marca === marcaActiva);

  // Los botones de marca. Los paso al carrusel como "filtros".
  const botones = (
    <div className="mb-4 flex flex-wrap gap-2">
      {marcas.map((marca) => (
        <button
          key={marca}
          onClick={() => setMarcaActiva(marca)}
          className={`cursor-pointer rounded-full px-3 py-1 text-xs transition ${
            marca === marcaActiva ? "bg-amarillo font-semibold text-negro" : "border border-borde hover:border-gris-azulado"
          }`}
        >
          {marca}
        </button>
      ))}
    </div>
  );

  return (
    // key={marcaActiva}: al cambiar de marca, el carrusel se arma de cero y vuelve al principio.
    // ruta: el "Ver más →" lleva al catálogo filtrado por la marca elegida (o a todo si está en "Todas").
    <CarruselProductos
      key={marcaActiva}
      titulo="Descubrí las mejores marcas"
      productos={filtrados}
      filtros={botones}
      ruta={marcaActiva === "Todas" ? "/catalogo" : `/catalogo?marca=${encodeURIComponent(marcaActiva)}`}
    />
  );
}