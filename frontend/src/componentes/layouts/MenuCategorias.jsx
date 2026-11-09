import { useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { menuCategorias } from "../../data/menuCategorias";

// Colores que se van alternando en los títulos de los grupos: amarillo, rojo, amarillo, rojo...
// Para cambiar el orden o agregar otro color, edito esta lista.
const coloresGrupo = [
  "bg-amarillo/10 text-amarillo hover:bg-amarillo/20",
  "bg-rojo/10 text-rojo hover:bg-rojo/20",
];

// Menú grande de categorías, como el de Carrefour.
// Prop: cerrar (función que cierra el menú; la usa el fondo oscuro y cada enlace).
export default function MenuCategorias({ cerrar }) {
  // Cuál categoría de la izquierda está activa (la que muestro a la derecha). Arranca con la primera.
  const [activa, setActiva] = useState(0);
  const categoria = menuCategorias[activa];

  return (
    <>
      {/* Fondo oscuro detrás del menú: al tocarlo se cierra.
          absolute + top-full: empieza justo debajo del navbar. El alto es lo que queda de pantalla. */}
      <motion.button
        aria-label="Cerrar menú"
        onClick={cerrar}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="absolute inset-x-0 top-full z-40 h-[calc(100vh-3.5rem)] cursor-default bg-negro/60"
      />

      {/* Panel. inset-x-0 + mx-auto + max-w-7xl lo centran y lo dejan del ancho del contenido.
          h-[34rem] es el alto: si lo quiero más grande o más chico, cambio ese número. */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.18 }}
        className="absolute inset-x-0 top-full z-50 mx-auto flex h-34rem max-h-[calc(100vh-4rem)] max-w-7xl overflow-hidden rounded-b-md border border-t-0 border-borde bg-gris-oscuro shadow-2xl"
      >
        {/* Izquierda: lista de categorías con scroll propio por si son muchas */}
        <ul className="w-56 shrink-0 overflow-y-auto border-r border-borde py-2">
          {menuCategorias.map((c, i) => (
            <li key={c.nombre}>
              <Link
                to={`/catalogo?categoria=${encodeURIComponent(c.nombre)}`}
                onClick={cerrar}
                onMouseEnter={() => setActiva(i)}
                onFocus={() => setActiva(i)}
                className={`flex items-center justify-between border-l-2 px-4 py-2 text-xs transition ${
                  i === activa ? "border-amarillo bg-negro text-amarillo" : "border-transparent hover:bg-negro/60"
                }`}
              >
                {c.nombre}
                <span aria-hidden className="text-gris-azulado">›</span>
              </Link>
            </li>
          ))}
        </ul>

        {/* Derecha: título, enlace y los grupos. Se oculta en celular */}
        <div className="hidden flex-1 overflow-y-auto px-8 py-5 md:block">
          <div className="border-b border-borde pb-3">
            <h2 className="text-lg font-semibold">{categoria.nombre}</h2>
            <Link
              to={`/catalogo?categoria=${encodeURIComponent(categoria.nombre)}`}
              onClick={cerrar}
              className="mt-1 inline-block text-[10px] font-semibold uppercase tracking-wide text-azul hover:underline"
            >
              Ver todos los productos →
            </Link>
          </div>

          {/* Grupos en 3 columnas. columns-3 los reparte solo, y break-inside-avoid evita que un grupo se corte a la mitad */}
          <div className="mt-4 columns-2 gap-8 lg:columns-3">
            {categoria.grupos.map((grupo, i) => (
              <div key={grupo.titulo} className="mb-4 break-inside-avoid">
                {/* Título del grupo: el color alterna según su posición (i % 2 da 0, 1, 0, 1...) */}
                <Link
                  to={`/catalogo?categoria=${encodeURIComponent(categoria.nombre)}&buscar=${encodeURIComponent(grupo.titulo)}`}
                  onClick={cerrar}
                  className={`flex items-center justify-between rounded-sm px-3 py-1.5 text-[11px] font-semibold transition ${coloresGrupo[i % coloresGrupo.length]}`}
                >
                  {grupo.titulo}
                  <span aria-hidden>›</span>
                </Link>

                <ul className="mt-1.5 flex flex-col gap-1 px-3">
                  {grupo.items.map((item) => (
                    <li key={item}>
                      <Link
                        to={`/catalogo?categoria=${encodeURIComponent(categoria.nombre)}&buscar=${encodeURIComponent(item)}`}
                        onClick={cerrar}
                        className="text-[11px] text-gris-azulado transition hover:text-blanco"
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}