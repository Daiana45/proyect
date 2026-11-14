import { useEffect } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";

// Ventana que aparece cuando alguien sin sesión quiere puntuar, comentar o guardar en favoritos.
// "motivo" es el texto de lo que quería hacer. "alCerrar" la cierra.
export default function ModalRegistro({ motivo, alCerrar }) {
  // Se cierra con la tecla Escape
  useEffect(() => {
    const alTeclear = (e) => e.key === "Escape" && alCerrar();
    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [alCerrar]);

  return (
    // Fondo oscuro: si hacés clic afuera de la ventana, se cierra
    <div
      onClick={alCerrar}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-negro/70 px-4"
    >
      <motion.div
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-md border border-borde bg-gris-oscuro p-6 text-center"
      >
        <p className="font-titulo text-lg font-bold">Necesitás una cuenta</p>
        <p className="mt-2 text-xs text-gris-azulado">
          Para {motivo} tenés que registrarte o iniciar sesión. Es gratis y toma un minuto.
        </p>

        <div className="mt-5 flex flex-col gap-2 text-xs font-semibold">
          <Link
            to="/registro"
            className="rounded-sm fondo-dorado px-4 py-2.5 text-negro transition hover:brightness-110"
          >
            Registrarme
          </Link>
          <Link
            to="/login"
            className="rounded-sm border border-borde px-4 py-2.5 transition hover:border-blanco"
          >
            Ya tengo cuenta · Iniciar sesión
          </Link>
          <button
            onClick={alCerrar}
            className="cursor-pointer px-4 py-2 text-gris-azulado transition hover:text-blanco"
          >
            Ahora no
          </button>
        </div>
      </motion.div>
    </div>
  );
}