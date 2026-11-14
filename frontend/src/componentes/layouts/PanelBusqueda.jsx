import { motion } from "motion/react";

// Escribo la sugerencia marcando lo que ya tipeé en normal y el resto en negrita (como YouTube)
function Resaltado({ texto, consulta }) {
  const inicio = consulta ? texto.toLowerCase().indexOf(consulta) : -1;
  if (inicio === -1) return <span className="font-semibold">{texto}</span>;
  const fin = inicio + consulta.length;
  return (
    <>
      <span className="font-semibold">{texto.slice(0, inicio)}</span>
      <span>{texto.slice(inicio, fin)}</span>
      <span className="font-semibold">{texto.slice(fin)}</span>
    </>
  );
}

// Props:
// lista: las sugerencias a mostrar (las calcula el Navbar).
// activo: cuál está marcada con las flechas (-1 = ninguna). setActivo: la marca al pasar el mouse.
// seleccionarSugerencia: busca ese texto. completar: la pone en el input sin buscar (flecha ↖).
// texto: lo que escribí en el buscador.
export default function PanelBusqueda({ lista, activo, setActivo, seleccionarSugerencia, completar, texto = "" }) {
  const consulta = texto.trim().toLowerCase();

  return (
    <motion.ul
      // data-busqueda: el Navbar lo usa para saber que un clic acá adentro NO es "afuera"
      data-busqueda
      id="panel-busqueda"
      role="listbox"
      aria-label="Sugerencias de búsqueda"
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.12 }}
      className="absolute inset-x-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-borde bg-gris-oscuro py-1.5 shadow-xl shadow-black/40"
    >
      {lista.map((fila, i) => (
        <li
          key={fila}
          role="option"
          aria-selected={i === activo}
          onMouseEnter={() => setActivo(i)}
          className={`flex items-center ${i === activo ? "bg-negro" : ""}`}
        >
          {/* tabIndex -1: se mueve con ↑ ↓ desde el input, no con Tab ni con el navegador espacial */}
          <button
            type="button"
            tabIndex={-1}
            onClick={() => seleccionarSugerencia(fila)}
            className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 px-4 py-2 text-left text-xs text-blanco"
          >
            {/* Lupa igual para todas las sugerencias */}
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-gris-azulado" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <span className="truncate">
              <Resaltado texto={fila} consulta={consulta} />
            </span>
          </button>

          {/* Flecha para pasar la sugerencia al input sin buscar todavía */}
          <button
            type="button"
            tabIndex={-1}
            aria-label={`Usar "${fila}" en el buscador`}
            onClick={() => completar(fila)}
            className="mr-2 cursor-pointer rounded-full p-1.5 text-gris-azulado transition hover:text-amarillo"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M17 7 7 17M7 9v8h8" />
            </svg>
          </button>
        </li>
      ))}
    </motion.ul>
  );
}