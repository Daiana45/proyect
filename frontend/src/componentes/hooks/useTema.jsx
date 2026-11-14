
import { useEffect, useState } from "react";

const TEMA_POR_DEFECTO = "oscuro";
const CLAVE_TEMA = "tema";

const obtenerTemaInicial = () => {
  if (typeof window === "undefined") {
    return TEMA_POR_DEFECTO;
  }

  try {
    const temaGuardado = localStorage.getItem(CLAVE_TEMA);

    return temaGuardado === "claro" || temaGuardado === "oscuro"
      ? temaGuardado
      : TEMA_POR_DEFECTO;
  } catch {
    return TEMA_POR_DEFECTO;
  }
};

export default function useTema() {
  const [tema, setTema] = useState(obtenerTemaInicial);

  useEffect(() => {
    const esClaro = tema === "claro";

    document.documentElement.classList.toggle(
      "tema-claro",
      esClaro
    );

    document.documentElement.style.colorScheme = tema;

    try {
      localStorage.setItem(CLAVE_TEMA, tema);
    } catch {
      // La aplicación sigue funcionando aunque no haya almacenamiento.
    }
  }, [tema]);

  const alternarTema = () => {
    setTema((actual) =>
      actual === "oscuro" ? "claro" : "oscuro"
    );
  };

  return {
    tema,
    alternarTema,
    esClaro: tema === "claro",
  };
}
