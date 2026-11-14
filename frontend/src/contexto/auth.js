import { createContext } from "react";

// El "contexto" es una caja compartida: cualquier página puede preguntarle quién está logueado.
export const AuthContext = createContext(null);