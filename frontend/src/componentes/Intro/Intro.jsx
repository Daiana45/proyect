import { motion, animate, useMotionValue, useTransform } from "motion/react";
import { useEffect, useRef } from "react";
import logoNavbar from "./LogoNavbar.svg";

// Definen el ritmo de la animación. Curvas de Bezier Cúbicas.
const EASE_OUT = [0.2, 0.8, 0.2, 1];
const EASE_IRIS = [0.75, 0, 0.2, 1];

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

// Ondas de expansión
const RIPPLES = [
  { delay: 0.6,  color: "var(--color-amarillo)", grosor: 1.5 },
  { delay: 1.1,  color: "var(--color-amarillo)", grosor: 1.5 },
  { delay: 1.95, color: "var(--color-rojo)",     grosor: 2 },   
  { delay: 2.25, color: "var(--color-rojo)",     grosor: 1 },
];

export default function Intro({ onFinish }) {
  // Radio del círculo transparente que revela la página de abajo
  const radio = useMotionValue(0);
  const mascaraImagen = useTransform(radio, (valorRadio) =>
    valorRadio <= 0
      ? "linear-gradient(#000, #000)"
      : `radial-gradient(circle at 50% 50%, transparent ${valorRadio}px, #000 ${valorRadio + 1.5}px)`
  );
  
  // Aro brillante que acompaña el borde del círculo
  const tamanoAro = useTransform(radio, (valorRadio) => valorRadio * 2);

  // Guardamos `onFinish` en una ref para evitar que el temporizador se reinicie
  const refFinalizar = useRef(onFinish);

  // CORRECCIÓN: Movimos la actualización de la ref dentro de un useEffect
  useEffect(() => {
    refFinalizar.current = onFinish;
  }, [onFinish]);

  useEffect(() => {
    const radioMaximo = Math.hypot(window.innerWidth, window.innerHeight) / 2 + 24;
    const animacionZoom = animate(radio, radioMaximo, { duration: 1.7, delay: 3.3, ease: EASE_IRIS });
    const temporizador = setTimeout(() => refFinalizar.current?.(), 5200);
    
    return () => {
      animacionZoom.stop();
      clearTimeout(temporizador);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Array vacío: se ejecuta solo una vez al montar

  return (
    <>
      <motion.div
        className="fixed inset-0 z-50 overflow-hidden bg-negro"
        style={{ maskImage: mascaraImagen, WebkitMaskImage: mascaraImagen }}
      >
        {/* Contenedor de TODO el contenido visible */}
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ delay: 3, duration: 0.5, ease: "easeOut" }}
        >
          {/* Lienzo SVG del mapa */}
          <svg
            className="absolute inset-0 h-full w-full"
            viewBox="0 0 1280 800"
            preserveAspectRatio="xMidYMid slice"
            fill="none"
            aria-hidden="true"
          >
            {STREETS.map((calle) => (
              <motion.path
                key={calle.d}
                d={calle.d}
                strokeWidth={calle.w}
                style={{ stroke: calle.color, strokeOpacity: calle.op }}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 2.2, delay: calle.delay, ease: [0.5, 0, 0.2, 1] }}
              />
            ))}
          </svg>

          {/* Punto de anclaje en el centro exacto de la pantalla */}
          <div className="absolute left-1/2 top-1/2 h-0 w-0">
            
            {/* Ondas de radar */}
            {RIPPLES.map((onda, indice) => (
              <motion.div
                key={indice}
                className="absolute -left-[100px] -top-[100px] h-[200px] w-[200px] rounded-full"
                style={{ border: `${onda.grosor}px solid ${onda.color}` }}
                initial={{ scale: 0.1, opacity: 0 }}
                animate={{ scale: [0.1, 3.4], opacity: [0.9, 0] }}
                transition={{ duration: 1.8, delay: onda.delay, ease: [0.2, 0.6, 0.3, 1] }}
              />
            ))}

            {/* Logo: cae desde arriba, rebota con física real */}
            <div className="absolute -left-[50px] -top-[94px] h-[100px] w-[100px]">
              <motion.div
                initial={{ y: -420, opacity: 0 }}
                animate={{ y: [-420, 0, -34, 0, -8, 0], opacity: 1 }}
                transition={{
                  y: {
                    duration: 1.4,
                    delay: 1.2,
                    times: [0, 0.55, 0.72, 0.88, 0.94, 1],
                    ease: ["easeIn", "easeOut", "easeIn", "easeOut", "easeOut"],
                  },
                  opacity: { duration: 0.35, delay: 1.2 },
                }}
              >
                <img 
                  src={logoNavbar} 
                  alt="Logo SpotMarket" 
                  className="w-full h-full drop-shadow-2xl" 
                />
              </motion.div>
            </div>

            {/* Texto "spotmarket" */}
            <motion.div
              className="absolute left-1/2 top-[46px] -translate-x-1/2 whitespace-nowrap text-center"
              initial={{ opacity: 0, letterSpacing: "0.6em", filter: "blur(14px)" }}
              animate={{ opacity: 1, letterSpacing: "-0.025em", filter: "blur(0px)" }}
              transition={{ duration: 1.5, delay: 2.1, ease: EASE_OUT }}
            >
              <h1 className="text-5xl font-black text-blanco md:text-6xl">
                spot<span className="text-amarillo">market</span>
              </h1>
            </motion.div>

            {/* Subtítulo */}
            <motion.p
              className="absolute left-1/2 top-[148px] -translate-x-1/2 whitespace-nowrap text-[11px] font-semibold uppercase tracking-[0.26em] text-gris-azulado md:text-[13px]"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 2.4 }}
            >
              Buscá · Explorá · Encontrá
            </motion.p>
          </div>

          {/* Textos de las esquinas */}
          <div className="absolute left-6 top-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-gris-azulado md:left-14">
            Spotmarket
          </div>
          <div className="absolute right-6 top-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-gris-azulado md:right-14">
            Buscador · Mapa
          </div>

          {/* Barra de carga inferior: riel de fondo */}
          <div
            className="absolute inset-x-6 bottom-10 h-px md:inset-x-14"
            style={{ backgroundColor: "color-mix(in srgb, white 10%, transparent)" }}
          />
          {/* Barra de carga inferior: línea roja */}
          <motion.div
            className="absolute inset-x-6 bottom-10 h-px origin-left bg-rojo md:inset-x-14"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 3, delay: 0.2, ease: "linear" }}
          />
        </motion.div>
      </motion.div>

      {/* Aro brillante rojo que acompaña el borde del zoom final */}
      <motion.div
        className="pointer-events-none fixed left-1/2 top-1/2 z-[51] rounded-full"
        style={{
          width: tamanoAro,
          height: tamanoAro,
          x: "-50%",
          y: "-50%",
          border: "1px solid var(--color-rojo)",
          boxShadow: "0 0 30px var(--color-rojo)",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: [1, 0.7, 0] }}
        transition={{ duration: 1.7, delay: 3.3, ease: "easeIn", times: [0, 0.7, 1] }}
      />
    </>
  );
}