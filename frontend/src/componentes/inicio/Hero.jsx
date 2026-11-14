import { motion } from "motion/react";
import MapaHero from "./MapaHero";

// Las líneas del título. Cada línea es una lista de pedacitos, y cada pedacito puede ser:
// "amarillo": se pinta de dorado. "cursiva": va en itálica.
const lineasTitulo = [
  [{ texto: "Explorá el" }],
  [{ texto: "mapa", cursiva: true }],
  [{ texto: "de " }, { texto: "SpotMarket", amarillo: true }],
];

export default function Hero() {
  return (
    // py-12: espacio arriba y abajo. max-w-7xl mx-auto: lo centro y limito su ancho.
    <section className="mx-auto max-w-7xl px-6 py-12">

      {/* En pantallas grandes divido en 2 columnas. En celular queda todo en una sola columna. */}
      <div className="grid items-center gap-12 lg:grid-cols-2">

        <div className="flex flex-col gap-5">

          {/* font-titulo: Fraunces, una serif gruesa. tracking-tight y leading-[0.95] le dan el aspecto compacto. */}
          <h1 className="font-titulo text-4xl font-extrabold leading-[0.95] tracking-tight md:text-5xl">
            {lineasTitulo.map((linea, indice) => (
              // Cada línea tiene un contenedor con overflow-hidden: lo que se sale de su caja queda oculto.
              // Así el texto parece "salir desde una cortina". pb-2 evita que se corten las letras.
              <span key={indice} className="block overflow-hidden pb-2">
                <motion.span
                  className="block"
                  // Empiezo con el texto corrido a la derecha y lo llevo a su lugar normal (0).
                  initial={{ x: "-50%" }}
                  animate={{ x: 0 }}
                  transition={{
                    duration: 1,
                    // Cada línea espera un poco más que la anterior: 0, 0.15, 0.3 segundos...
                    delay: indice * 0.15,
                    ease: [0.5, 0.8, 1, 1],
                  }}
                >
                  {/* Recorro los pedacitos de la línea y le doy a cada uno su estilo. */}
                  {linea.map((pedazo) => (
                    <span
                      key={pedazo.texto}
                      className={`${pedazo.amarillo ? "text-amarillo" : ""} ${pedazo.cursiva ? "italic" : ""}`}
                    >
                      {pedazo.texto}
                    </span>
                  ))}
                </motion.span>
              </span>
            ))}
          </h1>

          {/* Los {" "} son espacios explícitos: sin ellos JSX se come el espacio cuando hay salto de línea */}
          <motion.p
            initial={{ opacity: -1, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="max-w-md font-serif text-[18px] leading-relaxed text-gris-azulado"
          >
            <span className="text-blanco">Informate</span> de los mejores precios de tu zona,{" "}
            <span className="text-blanco">desde la comodidad</span> de tu hogar.
          </motion.p>
        </div>

        {/* El mapa de Formosa Capital con los comercios (ahora se ve también en celular, debajo del texto) */}
        <MapaHero />
      </div>
    </section>
  );
}