import { Link } from "react-router";
import { motion } from "motion/react";

// Colores de cada variante: fondo, texto y estilo del botón
const variantes = {
  dorado: { fondo: "bg-amarillo text-negro", boton: "bg-negro text-blanco" },
  rojo: { fondo: "bg-rojo text-blanco", boton: "bg-amarillo text-negro" },
};

// Banner con foto a la izquierda (cortada en diagonal) y texto a la derecha.
// Props: variante (dorado | rojo), titulo, texto, boton, ruta, imagen
export default function BannerPromo({ variante = "dorado", titulo, texto, boton, ruta, imagen }) {
  const estilo = variantes[variante];

  return (
    <section className="mx-auto my-10 max-w-7xl px-4">
      <div className={`relative flex h-52 overflow-hidden rounded-md md:h-60 ${estilo.fondo}`}>
        {/* Foto: ocupa el 58% de la izquierda y se corta en diagonal. Se oculta en celular */}
        {imagen && (
          <div
            className="absolute inset-y-0 left-0 hidden w-[58%] md:block"
            style={{ clipPath: "polygon(0 0, 100% 0, 88% 100%, 0 100%)" }}
          >
            <img src={imagen} alt="" className="h-full w-full object-cover object-center" />
          </div>
        )}

        {/* Texto: a la derecha en pantallas grandes, ocupando todo en celular */}
        <motion.div
          initial={{ opacity: 0, x: 16 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="relative z-10 flex w-full flex-col justify-center gap-2 px-6 md:ml-auto md:w-[42%] md:pl-4 md:pr-8"
        >
          <h2 className="font-titulo text-xl font-bold leading-tight md:text-2xl">{titulo}</h2>
          <p className="text-xs opacity-80">{texto}</p>
          <Link
            to={ruta}
            className={`mt-1 w-fit rounded-sm px-4 py-2 text-[11px] font-semibold transition hover:opacity-90 ${estilo.boton}`}
          >
            {boton}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}