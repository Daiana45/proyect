import { useContext } from "react";
import { ActividadContext } from "../../contexto/actividad";

// Devuelve { favoritos, alertas, opiniones, esFavorito, alternarFavorito, alerta, guardarAlerta, quitarAlerta, agregarOpinion, borrarOpinion, vaciarActividad }
export default function useActividad() {
  const contexto = useContext(ActividadContext);
  if (!contexto) throw new Error("useActividad tiene que usarse dentro de <ActividadProvider>");
  return contexto;
}