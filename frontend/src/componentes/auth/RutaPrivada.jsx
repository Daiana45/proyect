import { Navigate, Outlet, useLocation } from "react-router";
import useAuth from "../hooks/useAuth";

// Envuelve las rutas privadas: si no hay sesión, redirige al login recordando a dónde quería ir.
export default function RutaPrivada() {
  const { estaLogueado } = useAuth();
  const desde = useLocation();

  if (!estaLogueado) return <Navigate to="/login" replace state={{ desde }} />;
  return <Outlet />;
}