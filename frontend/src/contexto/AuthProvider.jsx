import { useState } from "react";
import { AuthContext } from "./auth";
import { ahoraMs } from "../utils/ahora";

const CLAVE = "spotmarket_usuario";
// Datos de cada cuenta (nombre, barrio, foto, desde cuándo es miembro), para que no se pierdan al cerrar sesión
const CLAVE_CUENTAS = "spotmarket_cuentas";

// Lee el usuario guardado, por si recargo la página
const leerUsuario = () => {
  try {
    return JSON.parse(localStorage.getItem(CLAVE));
  } catch {
    return null;
  }
};

const leerCuentas = () => {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_CUENTAS)) ?? {};
  } catch {
    return {};
  }
};

// Mezcla los datos nuevos con los que ya había de esa cuenta y los guarda
const guardarCuenta = (email, datos) => {
  const cuenta = { ...leerCuentas()[email], ...datos };
  try {
    localStorage.setItem(CLAVE_CUENTAS, JSON.stringify({ ...leerCuentas(), [email]: cuenta }));
  } catch {
    // Si el navegador no deja guardar, los datos duran hasta que recargue
  }
  return cuenta;
};

// Provisorio: sin backend, la sesión se guarda en el navegador.
// Cuando esté el backend (cookie JWT), solo cambian estas funciones: piden /auth/login, /auth/registro, /auth/logout y /auth/perfil.
export default function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(leerUsuario);

  const guardar = (nuevo) => {
    setUsuario(nuevo);
    try {
      if (nuevo) localStorage.setItem(CLAVE, JSON.stringify(nuevo));
      else localStorage.removeItem(CLAVE);
    } catch {
      // Si el navegador no deja guardar, la sesión dura hasta que recargue
    }
  };

  const iniciarSesion = async ({ email }) => {
    const cuenta = leerCuentas()[email] ?? guardarCuenta(email, { nombre: email.split("@")[0], desde: ahoraMs() });
    const nuevo = { ...cuenta, email };
    guardar(nuevo);
    return nuevo;
  };

  const registrar = async ({ nombre, email }) => {
    const cuenta = guardarCuenta(email, { nombre, desde: leerCuentas()[email]?.desde ?? ahoraMs() });
    const nuevo = { ...cuenta, email };
    guardar(nuevo);
    return nuevo;
  };

  // Cambia datos del perfil: nombre, barrio, avatar
  const actualizarUsuario = (cambios) => {
    if (!usuario) return;
    const cuenta = guardarCuenta(usuario.email, cambios);
    guardar({ ...usuario, ...cuenta });
  };

  const cerrarSesion = () => guardar(null);

  return (
    <AuthContext.Provider
      value={{ usuario, estaLogueado: usuario !== null, iniciarSesion, registrar, actualizarUsuario, cerrarSesion }}
    >
      {children}
    </AuthContext.Provider>
  );
}