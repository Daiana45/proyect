import { useState } from "react";
import { ActividadContext } from "./actividad";
import useAuth from "../componentes/hooks/useAuth";
import { ahoraMs } from "../utils/ahora";

const CLAVE = "spotmarket_actividad";
const VACIO = { favoritos: [], alertas: [], opiniones: [] };

// Lee todo lo guardado: un objeto { "email@x.com": { favoritos, alertas, opiniones } }
const leer = () => {
  try {
    return JSON.parse(localStorage.getItem(CLAVE)) ?? {};
  } catch {
    return {};
  }
};

// Provisorio: sin backend, la actividad de cada usuario se guarda en el navegador, separada por email.
// Cuando esté el backend, cada función de acá pide a la API (POST /favoritos, /alertas, /opiniones) y el resto del sitio no cambia.
export default function ActividadProvider({ children }) {
  const { usuario } = useAuth();
  const [todo, setTodo] = useState(leer);

  const email = usuario?.email ?? null;
  const mia = (email && todo[email]) || VACIO;

  // Aplica un cambio a la actividad del usuario actual y lo guarda
  const cambiar = (funcion) => {
    if (!email) return;
    setTodo((anterior) => {
      const siguiente = { ...anterior, [email]: funcion(anterior[email] ?? VACIO) };
      try {
        localStorage.setItem(CLAVE, JSON.stringify(siguiente));
      } catch {
        // Si el navegador no deja guardar, dura hasta que recargue
      }
      return siguiente;
    });
  };

  const valor = {
    favoritos: mia.favoritos,
    alertas: mia.alertas,
    opiniones: mia.opiniones,

    // Favoritos: lista de ids de producto (el último agregado va primero)
    esFavorito: (id) => mia.favoritos.includes(id),
    alternarFavorito: (id) =>
      cambiar((a) => ({
        ...a,
        favoritos: a.favoritos.includes(id) ? a.favoritos.filter((x) => x !== id) : [id, ...a.favoritos],
      })),

    // Alertas: { id del producto, objetivo (precio al que quiere que le avisen), creada }
    alerta: (id) => mia.alertas.find((x) => x.id === id),
    guardarAlerta: (id, objetivo) =>
      cambiar((a) => {
        const existe = a.alertas.some((x) => x.id === id);
        return {
          ...a,
          alertas: existe
            ? a.alertas.map((x) => (x.id === id ? { ...x, objetivo } : x))
            : [{ id, objetivo, creada: ahoraMs() }, ...a.alertas],
        };
      }),
    quitarAlerta: (id) => cambiar((a) => ({ ...a, alertas: a.alertas.filter((x) => x.id !== id) })),

    // Opiniones: { id, productoId, texto, puntuacion, fecha }
    agregarOpinion: ({ productoId, texto, puntuacion }) =>
      cambiar((a) => ({
        ...a,
        opiniones: [{ id: ahoraMs(), productoId, texto, puntuacion, fecha: ahoraMs() }, ...a.opiniones],
      })),
    borrarOpinion: (id) => cambiar((a) => ({ ...a, opiniones: a.opiniones.filter((x) => x.id !== id) })),

    vaciarActividad: () => cambiar(() => VACIO),
  };

  return <ActividadContext.Provider value={valor}>{children}</ActividadContext.Provider>;
}