import { useLocation, useNavigate } from "react-router";
import useAuth from "./useAuth";

// Devuelve una función "protegida": si estás logueado hace la acción; si no, te manda al login
// y, cuando entrás, te devuelve a esta misma página.
// Uso:  const protegida = useAccionPrivada();
//       <button onClick={() => protegida(() => darMeGusta(id), "dar me gusta")}>
export default function useAccionPrivada() {
  const { estaLogueado } = useAuth();
  const navegar = useNavigate();
  const desde = useLocation();

  return (accion, motivo) => {
    if (estaLogueado) return accion();
    navegar("/login", { state: { desde, motivo } });
  };
}