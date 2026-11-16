import { motion } from "motion/react";
import { Receipt } from "lucide-react";

// Estas son las frases que aparecen en la cinta.
const frases = [
  "Mirá todo en el mapa",
  "Subí tus productos",
  "Decidí con información",
  "Compará precios",
  "Encontrá comercios cerca",
];

export default function CintaMarca() {
  return (
    // Dejo el fondo transparente para que se integre con la página.
    <div
      className="overflow-hidden border-y border-borde/60 py-2"
      aria-hidden="true"
    >
      <motion.div
        className="flex w-max"
        animate={{ x: ["0%", "-50%"] }}
        transition={{
          duration: 40,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        {[0, 1].map((grupo) => (
          <div
            key={grupo}
            className="flex shrink-0 items-center gap-5 pr-5"
          >
            {frases.map((frase, indice) => (
              <div
                key={`${grupo}-${indice}`}
                className="flex shrink-0 items-center gap-8"
              >
                <span className="whitespace-nowrap text-xs font-extralight text-texto-secundario md:text-sm">
                  {frase}
                </span>

<Receipt
  size={20}
  strokeWidth={0.75}
  className="shrink-0 text-violeta"
/>
              </div>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
