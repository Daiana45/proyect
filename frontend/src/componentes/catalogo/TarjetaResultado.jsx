import { tipoDeTienda } from "../../data/tiendas";
import { haceCuanto } from "../../utils/tiempo";

// Hora actual, calculada una sola vez al cargar el archivo (afuera del componente, para que no cambie en cada render).
const ahora = Date.now();

// Una fila de resultado: datos del producto a la izquierda y precio a la derecha.
export default function TarjetaResultado({ producto }) {
  const tipo = tipoDeTienda(producto.tienda.nombre);

  return (
    <article className="flex items-center justify-between gap-4 rounded-md border border-borde bg-gris-oscuro px-4 py-3 transition hover:border-gris-azulado">
      <div>
        <h2 className="text-sm font-semibold">{producto.nombre}</h2>
        <p className="text-xs text-gris-azulado">
          {producto.tienda.nombre} · a {producto.distancia}
        </p>

        {/* Etiquetas: tipo de comercio, cuándo se actualizó, oferta (roja) y cuotas (amarilla) */}
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px]">
          <span className={`rounded px-1.5 py-0.5 ${tipo === "Pyme" ? "bg-verde/15 text-verde" : "bg-borde text-gris-azulado"}`}>{tipo}</span>
          <span className="text-gris-azulado">Actualizado {haceCuanto(producto.createdAt, ahora)}</span>
          {producto.en_oferta && <span className="rounded bg-rojo px-1.5 py-0.5 font-semibold text-blanco">Oferta</span>}
          {/* Cuotas: solo si el producto las tiene. Divido el precio por la cantidad de cuotas */}
          {producto.cuotas && (
            <span className="rounded bg-amarillo/15 px-1.5 py-0.5 font-semibold text-amarillo">
              {producto.cuotas} cuotas de ${Math.round(producto.precio / producto.cuotas).toLocaleString("es-AR")}
            </span>
          )}
        </div>
      </div>

      {/* Precio a la derecha, con el anterior tachado en rojo si es oferta */}
      <div className="text-right">
        <p className="text-base font-bold">${producto.precio.toLocaleString("es-AR")}</p>
        {producto.en_oferta && producto.precio_anterior && (
          <p className="text-[10px] text-rojo line-through">${producto.precio_anterior.toLocaleString("es-AR")}</p>
        )}
      </div>
    </article>
  );
}