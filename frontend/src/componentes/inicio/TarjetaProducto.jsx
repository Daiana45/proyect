import { useState } from "react";

// Mientras un producto no tenga foto, muestro un degradado del color de su categoría.
// Las categorías que no estén en esta lista usan el gris de "Otros".
const degradados = {
  Deportes: "from-azul/40",
  Hogar: "from-violeta/40",
  Alimentos: "from-verde/40",
  Mascotas: "from-naranja/40",
  Limpieza: "from-azul/30",
  Otros: "from-gris-azulado/30",
};

// Le doy formato a los precios: 45990 → $45.990
const formatear = (numero) => `$${numero.toLocaleString("es-AR")}`;

export default function TarjetaProducto({ producto }) {
  // ¿Le di "me gusta"? Empieza en que no.
  const [leGusta, setLeGusta] = useState(false);

  // Uso la primera categoría del producto para elegir el color de fondo.
  const categoria = producto.categorias[0]?.nombre;
  const degradado = degradados[categoria] ?? degradados.Otros;

  return (
    // w-48 = 192px. shrink-0: en el carrusel no se achica. snap-start: el carrusel frena alineado a su borde.
    <article className="w-48 shrink-0 snap-start">

      {/* La foto, en proporción 4:5. Si no hay imagen, queda el degradado. */}
      <div className={`relative aspect-4/5 overflow-hidden rounded-md bg-linear-to-br ${degradado} to-gris-oscuro`}>
        {producto.imagen && (
          <img src={producto.imagen} alt={producto.nombre} className="h-full w-full object-cover" />
        )}

        {/* Cartelito de oferta, arriba a la izquierda. */}
        {producto.en_oferta && (
          <span className="absolute left-2 top-2 rounded-sm bg-rojo px-1.5 py-0.5 text-[10px] font-semibold text-blanco">
            Oferta
          </span>
        )}
      </div>

      <div className="mt-2">
        <h3 className="text-xs font-semibold">{producto.nombre}</h3>
        <p className="text-[10px] text-gris-azulado">{producto.tienda.nombre}</p>

        {/* Precio de antes tachado en rojo (si hay) y precio actual. */}
        <p className="mt-1 text-xs">
          {producto.precio_anterior && (
            <span className="mr-2 text-[10px] text-rojo line-through">{formatear(producto.precio_anterior)}</span>
          )}
          <span className="font-semibold">{formatear(producto.precio)}</span>
        </p>

        {/* Distancia a la izquierda y "me gusta" a la derecha. */}
        <div className="mt-1 flex items-center justify-between text-[10px]">
          <span className="text-azul">{producto.distancia}</span>
          <button
            onClick={() => setLeGusta(!leGusta)}
            aria-label="Me gusta"
            className={`cursor-pointer transition ${leGusta ? "text-rojo" : "text-azul hover:text-rojo"}`}
          >
            ♥ {producto.me_gusta + (leGusta ? 1 : 0)}
          </button>
        </div>
      </div>
    </article>
  );
}