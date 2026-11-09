import { motion } from "motion/react";
// Importo el icono chico del logo (solo el pin con la moneda, sin fondo).
import logoMark from "../../assets/logos/logo-mark.svg";

// Las frases que van pasando por la cinta.
const frases = [
  "Mirá todo en el mapa",
  "Subí tus productos",
  "Decidí con información",
  "Compará precios",
  "Encontrá comercios cerca",
];

export default function CintaMarca() {
  return (
    // overflow-hidden: lo que se sale de la cinta queda oculto. Las dos líneas finas son el borde de arriba y de abajo.
    <div className="overflow-hidden border-y border-borde py-1" aria-hidden>
      {/* Repito la lista 4 veces seguidas. Muevo todo hasta la mitad (-50%) y vuelvo a empezar:
          como la segunda mitad es igual a la primera, el salto no se nota. */}
      <motion.div
        className="flex w-max gap-8"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 40, ease: "linear", repeat: Infinity }}
      >
        {[...frases, ...frases, ...frases, ...frases].map((frase, indice) => (
          <div key={indice} className="flex items-center gap-8">
            {/* text-xs: letra chica. whitespace-nowrap: que cada frase quede en una sola línea. */}
            <span className="whitespace-nowrap text-xs font-medium text-gris-azulado">{frase}</span>
            {/* El logo como imagen. h-6: alto de 24px, el ancho se ajusta solo (w-auto). */}
            <img src={logoMark} alt="" className="h-6 w-auto shrink-0" />
          </div>
        ))}
      </motion.div>
    </div>
  );
}