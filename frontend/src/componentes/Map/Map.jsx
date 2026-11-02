import { motion } from "motion/react";

// Calles del mapa 
const STREETS = [
  { d: "M-20 700 C300 600 520 740 800 620 S1150 520 1300 560", color: "var(--color-rojo-oscuro)", op: 0.8, w: 26, delay: 0.1 },
  { d: "M0 250 L1280 330", color: "var(--color-blanco)", op: 0.09, w: 1.5, delay: 0.2 },
  { d: "M0 560 L1280 480", color: "var(--color-blanco)", op: 0.09, w: 1.5, delay: 0.35 },
  { d: "M300 0 L420 800", color: "var(--color-blanco)", op: 0.09, w: 1.5, delay: 0.5 },
  { d: "M880 0 L760 800", color: "var(--color-blanco)", op: 0.09, w: 1.5, delay: 0.65 },
  { d: "M0 130 C400 170 700 60 1280 150", color: "var(--color-amarillo)", op: 0.25, w: 3, delay: 0.8 },
  { d: "M1040 0 L1160 800", color: "var(--color-blanco)", op: 0.06, w: 1.5, delay: 0.95 },
  { d: "M120 0 L40 800", color: "var(--color-blanco)", op: 0.06, w: 1.5, delay: 1.1 },
];

export default function Map() {
  return (
    <>
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        style={{
          background: "radial-gradient(ellipse at 50% 55%, color-mix(in srgb, var(--color-rojo-oscuro) 75%, transparent) 0%, transparent 65%)",
        }}
      />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1280 800"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        aria-hidden="true"
      >
        {STREETS.map((s, index) => (
          <motion.path
            key={index}
            d={s.d}
            strokeWidth={s.w}
            style={{ stroke: s.color, strokeOpacity: s.op }}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.2, delay: s.delay, ease: [0.5, 0, 0.2, 1] }}
          />
        ))}
      </svg>
    </>
  );
}