import { useEffect, useRef } from "react";
import TarjetaNovedades from "./TarjetaNovedades";
import { ultimasNovedades } from "../../data/ultimasnovedades";

// Ancho de una tarjeta (224px) + el espacio entre tarjetas (24px).
const PASO = 248;

export default function CarruselNovedades() {
  const pista = useRef(null);
  const pausado = useRef(false);

  const mover = (direccion) => pista.current.scrollBy({ left: direccion * PASO, behavior: "smooth" });

  // Movimiento automático: cada 3 segundos avanzo una tarjeta, salvo que el mouse esté encima.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const intervalo = setInterval(() => {
      if (pausado.current) return;
      const fila = pista.current;
      const llegoAlFinal = fila.scrollLeft + fila.clientWidth >= fila.scrollWidth - 10;
      if (llegoAlFinal) fila.scrollTo({ left: 0, behavior: "smooth" });
      else fila.scrollBy({ left: PASO, behavior: "smooth" });
    }, 3000);

    return () => clearInterval(intervalo);
  }, []);

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">

      <div className="mb-6 flex items-end justify-between border-b border-borde pb-3">
        <div>
          {/* font-sans: fuente genérica del sistema. text-3xl: un poco más chico que antes (4xl). */}
          <h2 className="font-sans text-3xl font-semibold tracking-tight">Ultimas Novedades</h2>
          <p className="mt-1 text-xs text-gris-azulado">Lo más nuevo de SpotMarket</p>
        </div>

        <div className="flex gap-4 text-xl text-gris-azulado">
          <button onClick={() => mover(-1)} aria-label="Anterior" className="cursor-pointer transition hover:text-amarillo">←</button>
          <button onClick={() => mover(1)} aria-label="Siguiente" className="cursor-pointer transition hover:text-amarillo">→</button>
        </div>
      </div>

      {/* Todas las tarjetas alineadas, sin desfase. */}
      <div
        ref={pista}
        onMouseEnter={() => (pausado.current = true)}
        onMouseLeave={() => (pausado.current = false)}
        className="flex snap-x snap-mandatory items-start gap-6 overflow-x-auto scroll-smooth pb-2 [scrollbar-none] [&::-webkit-scrollbar]:hidden"
      >
        {ultimasNovedades.map((ultimasNovedades) => (
          <TarjetaNovedades key={ultimasNovedades.id} ultimasNovedades={ultimasNovedades} />
        ))}
      </div>
    </section>
  );
}