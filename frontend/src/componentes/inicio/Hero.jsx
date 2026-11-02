import { useState } from "react";
import { motion } from "motion/react";

export default function Hero() {
  // useState me sirve para que React "se acuerde" de lo que escribe la persona "busqueda" es el valor actual (empieza vacío) y "setBusqueda" es la función que uso para cambiarlo. Cada vez que cambia, React vuelve a dibujar el componente con el valor nuevo.
  const [busqueda, setBusqueda] = useState("");

  // Las líneas del título en una lista, para animarlas una por una.
// "amarillo" me dice si esa línea lleva la palabra SpotMarket pintada de amarillo.
const lineasTitulo = [
  { texto: "Explorá el mapa", amarillo: false },
  { texto: "de SpotMarket", amarillo: true },
];

  // Esta función se ejecuta cuando envío el formulario (Enter o clic en la flecha).
  const enviarBusqueda = (evento) => {
    // Los formularios por defecto recargan la página. Con esto lo evito.
    evento.preventDefault();
    // Por ahora solo muestro lo buscado en la consola. 
    console.log("Buscando:", busqueda);
  };

  return (
    // py-16: espacio arriba y abajo. max-w-7xl mx-auto: lo centro y limito su ancho.
    <section className="mx-auto max-w-7xl px-6 py-16">

      {/* En pantallas grandes divido en 2 columnas.
          En celular queda todo en una sola columna. */}
      <div className="grid items-center gap-12 lg:grid-cols-2">

        <div className="flex flex-col gap-6">

          {/*  una píldora con borde y un puntito amarillo. */}
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-borde bg-gris-oscuro px-2 py-1.5 text-xs text-gris-azulado">
            <span className="h-1 w-1 rounded-full bg-amarillo" />
            Encuentra lo que necesitas
          </span>

         {/* font-titulo: uso mi segunda fuente solo acá. */}
<h1 className="font-titulo text-5xl font-normal leading-tight tracking-wide md:text-6xl">
  {lineasTitulo.map((linea, indice) => (
    // Cada línea tiene un contenedor con overflow-hidden: todo lo que se sale de su caja queda oculto. Así el texto parece "salir desde abajo de una cortina". pb-1 evita que se corten las letras
    <span key={linea.texto} className="block overflow-hidden pb-1">
      <motion.span
        className="block"
        // Empiezo con el texto corrido 110% hacia abajo, o sea, escondido.
        initial={{ y: "110%" }}
        // Y lo llevo a su lugar normal (0).
        animate={{ y: 0 }}
        transition={{
          duration: 1.0,
          // Cada línea espera un poco más que la anterior: 0, 0.15, 0.3 segundos...
          delay: indice * 0.15,
          // Curva de velocidad:
          ease: [0.5, 0.8, 1, 1],
        }}
      >
        {/* Si la línea tiene amarillo, separo "de" y pinto solo "SpotMarket". */}
        {linea.amarillo ? (
          <>
            de <span className="text-amarillo">SpotMarket</span>
          </>
        ) : (
          linea.texto
        )}
      </motion.span>
    </span>
  ))}
</h1>

          {/* La descripción, en gris para que no compita con el título. max-w-md la mantiene angosta. */}
          <p className="max-w-md text-gris-azulado">
            Descubrí comercios locales cerca de vos, encontrá lo que necesitás y apoyá a tu comunidad.
          </p>

        {/* max-w-md: el mismo ancho que mi párrafo, así quedan alineados. py-1.5 pl-4 pr-1.5: menos espacio adentro border-borde bg-gris-oscuro: mismo borde y fondo que mi insignia de arriba. */}
<form
  onSubmit={enviarBusqueda}
  className="flex max-w-md items-center gap-2 rounded-xl border border-borde bg-gris-oscuro py-1.5 pl-4 pr-1.5"
>
  {/* text-sm: la letra del buscador es del mismo tamaño que la de mis botones. */}
  <input
    type="text"
    value={busqueda}
    onChange={(evento) => setBusqueda(evento.target.value)}
    placeholder="Buscar productos, comercios o categorías..."
    className="flex-1 bg-transparent text-sm text-blanco placeholder:text-gris-azulado focus:outline-none"
  />

  {/* h-8 w-8: botón de 32px en vez de 40px, para que no sobresalga. */}
  <button
    type="submit"
    aria-label="Buscar"
    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-amarillo text-negro transition hover:brightness-110"
  >
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  </button>
</form>
        </div>

        {/* Por ahora dejo una caja vacía como reserva. Después pongo acá el mapa ilustrado. */}
        <div className="hidden h-72 rounded-3xl border border-borde bg-gris-oscuro lg:block" />
      </div>
    </section>
  );
}