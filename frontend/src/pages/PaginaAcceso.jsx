import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router";
import useAuth from "../componentes/hooks/useAuth";

// Prop: modo ("login" o "registro")
export default function PaginaAcceso({ modo = "login" }) {
  const esRegistro = modo === "registro";
  const { estaLogueado, iniciarSesion, registrar } = useAuth();
  const navegar = useNavigate();
  const { state } = useLocation();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");

  // A dónde vuelvo después de entrar: la página que me mandó acá, o el inicio
  const destino = state?.desde ? `${state.desde.pathname}${state.desde.search ?? ""}` : "/";

  if (estaLogueado) return <Navigate to={destino} replace />;

  const enviar = async (e) => {
    e.preventDefault();
    if (esRegistro && nombre.trim().length < 2) return setError("Escribí tu nombre.");
    if (!/^\S+@\S+\.\S+$/.test(email)) return setError("Escribí un email válido.");
    if (clave.length < 6) return setError("La contraseña tiene que tener al menos 6 caracteres.");
    setError("");
    if (esRegistro) await registrar({ nombre: nombre.trim(), email });
    else await iniciarSesion({ email });
    navegar(destino, { replace: true });
  };

  const campo = "mt-1 w-full rounded-md border border-borde bg-transparent px-3 py-2.5 text-sm outline-none focus:border-amarillo";

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="font-titulo text-2xl font-bold md:text-3xl">{esRegistro ? "Creá tu cuenta" : "Iniciá sesión"}</h1>

      {/* Si me mandaron acá desde un botón, aviso para qué */}
      {state?.motivo && (
        <p className="mt-3 rounded-md border border-amarillo/40 bg-amarillo/10 px-3 py-2 text-xs">
          Iniciá sesión para {state.motivo}.
        </p>
      )}

      <form onSubmit={enviar} className="mt-6 flex flex-col gap-4 rounded-md border border-borde bg-gris-oscuro p-5">
        {esRegistro && (
          <label className="text-xs text-gris-azulado">
            Nombre
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="name" className={campo} />
          </label>
        )}
        <label className="text-xs text-gris-azulado">
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" className={campo} />
        </label>
        <label className="text-xs text-gris-azulado">
          Contraseña
          <input
            type="password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            autoComplete={esRegistro ? "new-password" : "current-password"}
            className={campo}
          />
        </label>

        {error && <p className="text-xs text-rojo">{error}</p>}

        <button type="submit" className="cursor-pointer rounded-sm fondo-dorado px-4 py-2.5 text-sm font-semibold text-negro transition hover:brightness-110">
          {esRegistro ? "Registrarme" : "Entrar"}
        </button>
      </form>

      <p className="mt-4 text-center text-xs text-gris-azulado">
        {esRegistro ? "¿Ya tenés cuenta? " : "¿Todavía no tenés cuenta? "}
        <Link to={esRegistro ? "/login" : "/registro"} state={state} className="text-azul hover:underline">
          {esRegistro ? "Iniciá sesión" : "Registrate"}
        </Link>
      </p>
      <p className="mt-6 text-center text-[10px] text-gris-azulado">
        Acceso de prueba: por ahora cualquier email y contraseña de 6 caracteres o más.
      </p>
    </div>
  );
}