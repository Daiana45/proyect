import { Link } from "react-router";

// Las tres ventajas que le muestro al comerciante. Para cambiar un texto, lo edito acá.
const ventajas = [
  { titulo: "Subí tus productos", texto: "Nombre, precio y foto, y listo." },
  { titulo: "Compará con otros", texto: "Tu precio al lado de otros comercios." },
  { titulo: "Aparecé en el mapa", texto: "Te encuentran los clientes cercanos." },
];

// Banner final para comercios: tarjeta roja con detalles dorados, con márgenes para que se despegue del fondo.
export default function BannerFinal() {
  return (
    <section className="mx-auto my-12 max-w-7xl px-4">
      <div className="grid gap-6 rounded-md bg-rojo px-8 py-8 text-blanco lg:grid-cols-2 lg:items-center">
        {/* Izquierda: título con la letra del Hero. "comercio" en cursiva y dorado */}
        <div>
          <h2 className="font-titulo text-3xl font-extrabold leading-none tracking-tight md:text-4xl">
            ¿Tenés un <span className="italic text-amarillo">comercio</span>?
          </h2>
          <p className="mt-2 max-w-sm text-sm text-blanco/85">Sumalo a SpotMarket y que los vecinos de tu zona vean lo que vendés.</p>

          {/* Botón dorado con flecha que se mueve al pasar el mouse (group-hover) */}
          <Link to="/registro" className="fondo-dorado group mt-4 inline-flex items-center gap-2 rounded-md px-4 py-2 text-xs font-semibold text-negro transition hover:opacity-90">
            Registrar mi comercio
            <span className="transition group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {/* Derecha: tres filas separadas por una línea fina clara */}
        <ul className="border-t border-blanco/25">
          {ventajas.map((ventaja) => (
            <li key={ventaja.titulo} className="flex items-baseline justify-between gap-4 border-b border-blanco/25 py-2.5">
              <span className="text-sm font-semibold">{ventaja.titulo}</span>
              <span className="text-right text-xs text-blanco/75">{ventaja.texto}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}