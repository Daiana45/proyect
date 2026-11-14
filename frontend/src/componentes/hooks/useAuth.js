import { useContext } from "react";
import { AuthContext } from "../../contexto/auth";

// Devuelve { usuario, estaLogueado, iniciarSesion, registrar, cerrarSesion }
export default function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error("useAuth tiene que usarse dentro de <AuthProvider>");
  return contexto;
}