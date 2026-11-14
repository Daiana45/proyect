import { Link } from "react-router";
import { motion } from "motion/react";
import { comercios } from "../../data/comercios";

// Banner amarillo de los comercios. Los 5 nombres abren el catálogo con ese comercio tildado.
// Props: ciudad (palabra gigante de fondo si no hay foto), imagen (foto a la derecha), ruta (botón del mapa)
export default function BannerLugares({ ciudad = "Formosa", imagen, ruta = "/mapa" }) {
  return (
    <section className="mx-auto my-10 max-w-7xl px-4">
      <div className="relative flex h-60 overflow-hidden rounded-md bg-amarillo text-negro md:h-64">
        {/* Foto: ocupa el 42% de la derecha y se corta en diagonal. Si no hay foto, va la palabra gigante */}
        {imagen ? (
          <div
            className="absolute inset-y-0 right-0 hidden w-[42%] md:block"
            style={{ clipPath: "polygon(12% 0, 100% 0, 100% 100%, 0 100%)" }}
          >
            <img src={imagen} alt="" className="h-full w-full object-cover object-center" />
          </div>
        ) : (
          <span
            aria-hidden
            className="pointer-events-none absolute -bottom-6 right-4 font-titulo text-[8rem] font-bold leading-none text-transparent"
            style={{ WebkitTextStroke: "2px rgba(5,11,26,0.25)" }}
          >
            {ciudad}
          </span>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="relative z-10 flex w-full flex-col justify-center gap-2 px-6 md:w-[58%] md:px-8"
        >
          <h2 className="font-titulo text-xl font-bold md:text-2xl">Los comercios de tu barrio</h2>
          <p className="text-xs opacity-80">Conocé los locales de la zona y mirá qué venden.</p>

          <div className="flex flex-wrap gap-1.5">
            {comercios.slice(0, 5).map((comercio) => (
              <Link
                key={comercio.nombre}
                to={`/catalogo?tienda=${encodeURIComponent(comercio.nombre)}`}
                className="rounded-full bg-negro px-2.5 py-1 text-[10px] font-semibold text-blanco transition hover:bg-negro/80"
              >
                {comercio.nombre}
              </Link>
            ))}
          </div>

          {/* Botón con relleno negro que se desliza al pasar el mouse */}
          <Link
            to={ruta}
            className="group relative mt-1 w-fit overflow-hidden rounded-sm border border-negro px-4 py-2 text-[11px] font-semibold uppercase tracking-wide"
          >
            <span className="absolute inset-0 -translate-x-full bg-negro transition-transform duration-300 group-hover:translate-x-0" />
            <span className="relative transition-colors group-hover:text-amarillo">Ver en el mapa →</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}