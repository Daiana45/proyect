import useAuth from "./useAuth";

// Dice si hay una sesión iniciada. Ahora usa el mismo login que el resto del sitio (useAuth).
export function useSesion() {
  const { estaLogueado } = useAuth();
  return { logueado: estaLogueado };
}