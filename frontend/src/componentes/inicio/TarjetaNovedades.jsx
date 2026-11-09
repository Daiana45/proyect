import { useState } from "react";

// "className" me deja darle estilos extra desde afuera (lo uso para bajar las tarjetas pares).
export default function TarjetaNovedades({ ultimaNovedades, className = "" }) {
  const [meGusta, setMeGusta] = useState(ultimaNovedades?.me_gusta || 0);
  const [dioLike, setDioLike] = useState(false);

  if (!ultimaNovedades){
        return null;
    }

  const alternarLike = () => {
    const nuevoEstado = !dioLike;
    setMeGusta(nuevoEstado? meGusta - 1 : meGusta + 1);
    setDioLike(!nuevoEstado);
  };

  return (
    // "group" me deja animar la foto cuando paso el mouse por cualquier parte de la tarjeta.
    <article className={`group w-56 shrink-0 snap-start ${className}`}>

      {/* La foto, en formato vertical 4:5. overflow-hidden recorta la foto
          cuando se agranda al pasar el mouse. */}
      <div className="relative aspect-4/5 overflow-hidden rounded-md bg-gris-oscuro">
        {ultimaNovedades.imagen ? (
          <img
            src={ultimaNovedades.imagen}
            alt={ultimaNovedades.nombre}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          // Mientras no tenga foto, dejo el fondo liso, sin decoración.
          <div className="h-full w-full" />
        )}

        {/* La etiqueta "Oferta" es una tira pegada al borde izquierdo, sin redondear. */}
        {ultimaNovedades.en_oferta && (
          <span className="absolute left-0 top-3 bg-amarillo px-2 py-0.5 text-[11px] font-bold uppercase text-negro">
            Oferta
          </span>
        )}
      </div>

      {/* El texto va debajo de la foto, sin cajas. */}
      <div className="mt-3">
  {/* Nombre y precio: bajé de text-sm a text-[13px]. */}
  <div className="flex items-baseline justify-between gap-2">
    <h3 className="text-[13px] font-semibold">{ultimaNovedades.nombre}</h3>
    <span className="text-[13px] font-semibold">$ {ultimaNovedades.precio.toLocaleString("es-AR")}</span>
  </div>

  <div className="flex items-baseline justify-between gap-2">
    <p className="text-[11px] text-gris-azulado">
      {ultimaNovedades.tienda?.nombre} · {ultimaNovedades.categorias?.[0]?.nombre}
    </p>
    {/* El precio anterior tachado, ahora en rojo. */}
    {ultimaNovedades.en_oferta && ultimaNovedades.precio_anterior && (
      <span className="text-[11px] text-rojo line-through">
        $ {ultimaNovedades.precio_anterior.toLocaleString("es-AR")}
      </span>
    )}
  </div>

  <div className="mt-2 flex items-center justify-between text-[11px] text-gris-azulado">
    <span>{ultimaNovedades.distancia}</span>
    <button
      onClick={alternarLike}
      className={`cursor-pointer transition ${dioLike ? "text-rojo" : "hover:text-blanco"}`}
    >
      ♥ {meGusta}
    </button>
  </div>
</div>
    </article>
  );
}