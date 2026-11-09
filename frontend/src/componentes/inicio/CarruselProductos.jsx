import { useEffect, useRef } from "react";
import { Link } from "react-router";
import TarjetaProducto from "./TarjetaProducto";

// Ancho de una tarjeta (192px) + el espacio entre tarjetas (16px).
const PASO = 208;

// Recibo: titulo, la lista de productos a mostrar, la ruta del "Ver más"
// y "filtros" (algo extra que quiera poner entre el encabezado y las tarjetas, como los botones de marcas).
export default function CarruselProductos({ titulo, productos, ruta = "/catalogo", filtros }) {
  const pista = useRef(null);
  const pausado = useRef(false);

  // Separo la última palabra del título para ponerla en negrita.
  const palabras = titulo.split(" ");
  const ultima = palabras.pop();

  const mover = (direccion) => pista.current.scrollBy({ left: direccion * PASO, behavior: "smooth" });

  // Cada 3 segundos avanzo una tarjeta. Al llegar al final vuelvo al principio.
  useEffect(() => {
    // Si la persona pidió menos movimiento en su sistema, no muevo nada solo.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const intervalo = setInterval(() => {
      if (pausado.current || !pista.current) return;
      const fila = pista.current;
      const llegoAlFinal = fila.scrollLeft + fila.clientWidth >= fila.scrollWidth - 10;
      if (llegoAlFinal) fila.scrollTo({ left: 0, behavior: "smooth" });
      else fila.scrollBy({ left: PASO, behavior: "smooth" });
    }, 3000);

    return () => clearInterval(intervalo);
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-6 py-8">

      {/* Encabezado: título a la izquierda; "Ver más" y las flechas a la derecha. Una línea abajo lo separa. */}
      <div className="mb-4 flex items-end justify-between border-b border-borde pb-3">
        <h2 className="text-2xl font-light uppercase">
          {palabras.join(" ")} <strong className="font-bold">{ultima}</strong>
        </h2>

        <div className="flex items-center gap-3">
          <Link
            to={ruta}
            className="text-xs text-gris-azulado underline decoration-transparent decoration-2 underline-offset-4 transition hover:decoration-rojo"
          >
            Ver más →
          </Link>
          {/* Las dos flechas, en cuadraditos con borde. */}
          <button
            onClick={() => mover(-1)}
            aria-label="Anterior"
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-borde text-xs text-gris-azulado transition hover:border-rojo hover:text-rojo"
          >
            ←
          </button>
          <button
            onClick={() => mover(1)}
            aria-label="Siguiente"
            className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-md border border-borde text-xs text-gris-azulado transition hover:border-rojo hover:text-rojo"
          >
            →
          </button>
        </div>
      </div>

      {/* Si me pasaron filtros, los muestro acá. */}
      {filtros}

      {productos.length === 0 ? (
        <p className="py-6 text-xs text-gris-azulado">No hay productos para mostrar.</p>
      ) : (
        // El carrusel se pausa mientras el mouse está encima.
        // snap-x snap-mandatory: al soltar, frena alineado a una tarjeta.
        // [scrollbar-width:none]: escondo la barra de scroll.
        <div
          ref={pista}
          onMouseEnter={() => (pausado.current = true)}
          onMouseLeave={() => (pausado.current = false)}
          className="flex snap-x snap-mandatory items-start gap-4 overflow-x-auto scroll-smooth pb-2 scrollbar-none [&::-webkit-scrollbar]:hidden"
        >
          {productos.map((producto) => (
            <TarjetaProducto key={producto.id} producto={producto} />
          ))}
        </div>
      )}
    </section>
  );
}