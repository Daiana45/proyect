import { motion } from "motion/react";

// Las líneas del título. Cada línea es una lista de pedacitos, y cada pedacito puede ser:
// "amarillo": se pinta de dorado. "cursiva": va en itálica.
const lineasTitulo = [
  [{ texto: "Explorá el" }],
  [{ texto: "mapa", cursiva: true }],
  [{ texto: "de " }, { texto: "SpotMarket", amarillo: true }],
];

export default function Hero() {
  return (
    // py-14: espacio arriba y abajo. max-w-7xl mx-auto: lo centro y limito su ancho.
    <section className="mx-auto max-w-7xl px-6 py-12">

      {/* En pantallas grandes divido en 2 columnas. En celular queda todo en una sola columna. */}
      <div className="grid items-center gap-12 lg:grid-cols-2">

        <div className="flex flex-col gap-5">

          {/* font-titulo: Fraunces, una serif gruesa. text-4xl md:text-5xl: más chico que antes.
              tracking-tight (letras más juntas) y leading-[0.95] (líneas pegadas) le dan el aspecto compacto. */}
          <h1 className="font-titulo text-4xl font-extrabold leading-[0.95] tracking-tight md:text-6xl">
            {lineasTitulo.map((linea, indice) => (
              // Cada línea tiene un contenedor con overflow-hidden: lo que se sale de su caja queda oculto.
              // Así el texto parece "salir desde abajo de una cortina". pb-2 evita que se corten las letras.
              <span key={indice} className="block overflow-hidden pb-2">
                <motion.span
                  className="block"
                  // Empiezo con el texto corrido 110% hacia abajo, o sea, escondido.
                  initial={{ y: "110%" }}
                  // Y lo llevo a su lugar normal (0).
                  animate={{ y: 0 }}
                  transition={{
                    duration: 0.9,
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

          {/* La descripción: gris para que no compita con el título, con las palabras clave en blanco.
              text-[15px] leading-relaxed: letra cómoda de leer y renglones con aire. max-w-md: angosta. */}
          <p className="max-w-md font-serif text-xl leading-relaxed text-gris-azulado">
            <span className="text-blanco">Informate</span> de los mejores precios de tu zona,
         <span className="text-blanco">desde la comodidad</span> de tu hogar.
          </p>
        </div>

        {/* Por ahora dejo una caja vacía como reserva. Después pongo acá el mapa real. */}
        <div className="hidden h-72 rounded-3xl border border-transparent bg-gris-oscuro lg:block" />
      </div>
    </section>
  );
}