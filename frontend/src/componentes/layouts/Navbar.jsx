import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { AnimatePresence } from "motion/react";

import Logo from "../UI/Logo";
import MenuCategorias from "../layouts/MenuCategorias";
import PanelBusqueda from "../layouts/PanelBusqueda";
import useTema from "../hooks/useTema";
import useAuth from "../hooks/useAuth";
import useNavegacionFlechas from "../hooks/useNavegacionFlecha";
import useScrollArriba from "../hooks/useScrollArriba";
import { obtenerSugerencias } from "../../utils/sugerencias";

export default function Navbar() {
  const [abierto, setAbierto] = useState(false);
  const [panelBusquedaAbierto, setPanelBusquedaAbierto] = useState(false);
  const [texto, setTexto] = useState("");
  // Cuál sugerencia está marcada con las flechas (-1 = ninguna)
  const [activo, setActivo] = useState(-1);
  const [estaScrolleado, setEstaScrolleado] = useState(false);

  const contenedorRef = useRef(null);
  const inputBusquedaRef = useRef(null);

  const navegar = useNavigate();
  const { tema, alternarTema } = useTema();
  const { usuario, cerrarSesion } = useAuth();

  // Flechas para moverse por todo el sitio (el Navbar está en todas las páginas, por eso lo activo acá)
  useNavegacionFlechas();
  // Al entrar a otra página arranco desde arriba
  useScrollArriba();

  const sugerencias = obtenerSugerencias(texto);

  const esMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
  const atajoTexto = esMac ? "⌘ K" : "Ctrl K";

  const cerrarTodo = () => {
    setAbierto(false);
    setPanelBusquedaAbierto(false);
    setActivo(-1);
  };

  // Cerrar al hacer clic fuera o presionar Escape
  useEffect(() => {
    const manejarClickFuera = (evento) => {
      // El buscador y su panel están marcados con data-busqueda: un clic ahí adentro no cierra las sugerencias.
      // Cualquier otro clic (aunque sea en el navbar o en la página) las cierra.
      if (!evento.target.closest("[data-busqueda]")) {
        setPanelBusquedaAbierto(false);
      }
      // El menú de categorías se cierra si el clic fue fuera de todo el header
      if (contenedorRef.current && !contenedorRef.current.contains(evento.target)) {
        setAbierto(false);
      }
    };

    const manejarEscape = (evento) => {
      if (evento.key === "Escape") {
        cerrarTodo();
        inputBusquedaRef.current?.blur();
      }
    };

    document.addEventListener("pointerdown", manejarClickFuera);
    document.addEventListener("keydown", manejarEscape);

    return () => {
      document.removeEventListener("pointerdown", manejarClickFuera);
      document.removeEventListener("keydown", manejarEscape);
    };
  }, []);

  // Detectar desplazamiento
  useEffect(() => {
    const manejarScroll = () => setEstaScrolleado(window.scrollY > 50);
    manejarScroll();
    window.addEventListener("scroll", manejarScroll, { passive: true });
    return () => window.removeEventListener("scroll", manejarScroll);
  }, []);

  // Cerrar el panel de búsqueda al hacer scroll
  useEffect(() => {
    const manejarScroll = () => {
      if (panelBusquedaAbierto) {
        setPanelBusquedaAbierto(false);
      }
    };

    window.addEventListener("scroll", manejarScroll, { passive: true });
    return () => window.removeEventListener("scroll", manejarScroll);
  }, [panelBusquedaAbierto]);

  // Atajo Ctrl + K / Cmd + K (ALTERNA: abre o cierra)
  useEffect(() => {
    const manejarAtajo = (evento) => {
      if ((evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === "k") {
        evento.preventDefault();
        setPanelBusquedaAbierto((previo) => !previo);
        setAbierto(false);
        setTimeout(() => inputBusquedaRef.current?.focus(), 50);
      }
    };

    document.addEventListener("keydown", manejarAtajo);
    return () => document.removeEventListener("keydown", manejarAtajo);
  }, []);

  const alternarCategorias = () => {
    setAbierto((actual) => !actual);
    setPanelBusquedaAbierto(false);
  };

  const abrirBusqueda = () => {
    setAbierto(false);
    setActivo(-1);
    setPanelBusquedaAbierto(true);
  };

  // Al tocar una sugerencia voy directo al catálogo con esa búsqueda
  const seleccionarSugerencia = (sugerencia) => {
    navegar(`/catalogo?buscar=${encodeURIComponent(sugerencia)}`);
    cerrarTodo();
    setTexto("");
    inputBusquedaRef.current?.blur();
  };

  // La flecha ↖ de cada sugerencia: la pasa al input y sigo escribiendo
  const completarSugerencia = (sugerencia) => {
    setTexto(sugerencia);
    setActivo(-1);
    inputBusquedaRef.current?.focus();
  };

  // Teclas dentro del buscador: ↓ ↑ recorren las sugerencias y Enter busca la marcada
  const manejarTeclasBusqueda = (evento) => {
    if (evento.key === "ArrowDown" || evento.key === "ArrowUp") {
      evento.preventDefault();
      if (!panelBusquedaAbierto) {
        abrirBusqueda();
        return;
      }
      const total = sugerencias.length;
      if (evento.key === "ArrowDown") {
        setActivo((a) => (a + 1) % total);
      } else {
        setActivo((a) => (a <= 0 ? total - 1 : a - 1));
      }
    } else if (evento.key === "Enter" && panelBusquedaAbierto && activo >= 0) {
      evento.preventDefault();
      seleccionarSugerencia(sugerencias[activo]);
    }
  };

  const enviarBusqueda = (evento) => {
    evento.preventDefault();
    const busqueda = texto.trim();

    if (!busqueda) {
      abrirBusqueda();
      inputBusquedaRef.current?.focus();
      return;
    }

    navegar(`/catalogo?buscar=${encodeURIComponent(busqueda)}`);
    cerrarTodo();
    setTexto("");
    inputBusquedaRef.current?.blur();
  };

  const salir = () => {
    cerrarSesion();
    cerrarTodo();
    navegar("/");
  };

  return (
    <header
      ref={contenedorRef}
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ease-out ${
        estaScrolleado
          ? "border-white/10 bg-negro/90 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="relative mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 md:px-8">
        <Link to="/" onClick={cerrarTodo} aria-label="SpotMarket - Inicio" className="shrink-0">
          <Logo />
        </Link>

        <button
          type="button"
          onClick={alternarCategorias}
          aria-expanded={abierto}
          aria-controls="panel-categorias"
          className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition active:scale-95 ${
            abierto ? "border-amarillo text-amarillo" : "border-borde hover:border-gris-azulado"
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
          <span className="hidden text-xs sm:inline">Categorías</span>
        </button>

        <div className="ml-auto flex min-w-0 items-center gap-3">
          {/* data-busqueda: un clic acá adentro no cierra las sugerencias.
              relative: el panel de sugerencias se posiciona justo debajo de este contenedor. */}
          <div data-busqueda className="relative w-36 shrink-0 sm:w-48 md:w-64 lg:w-100">
            <form onSubmit={enviarBusqueda} role="search">
              <div className="relative flex items-center rounded-xl border border-borde bg-gris-oscuro py-2 pl-4 pr-2 transition-colors hover:border-blanco">
                <input
                  ref={inputBusquedaRef}
                  type="search"
                  value={texto}
                  onChange={(evento) => {
                    setTexto(evento.target.value);
                    setActivo(-1);
                  }}
                  onFocus={abrirBusqueda}
                  onKeyDown={manejarTeclasBusqueda}
                  placeholder="Buscar productos o tiendas..."
                  className="min-w-0 flex-1 bg-transparent pr-20 text-xs text-blanco placeholder:text-gris-azulado focus:outline-none"
                />
                <kbd aria-hidden="true" className="pointer-events-none absolute right-9 top-1/2 -translate-y-1/2 rounded border border-borde bg-negro px-1.5 py-0.5 text-[10px] text-gris-azulado">
                  {atajoTexto}
                </kbd>
                <button type="submit" aria-label="Ejecutar búsqueda" className="absolute right-1.5 top-1/2 -translate-y-1/2 cursor-pointer text-rojo transition hover:scale-110">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                </button>
              </div>
            </form>

            {/* Sugerencias: justo debajo del input, con su mismo ancho */}
            <AnimatePresence>
              {panelBusquedaAbierto && (
                <PanelBusqueda
                  lista={sugerencias}
                  activo={activo}
                  setActivo={setActivo}
                  seleccionarSugerencia={seleccionarSugerencia}
                  completar={completarSugerencia}
                  texto={texto}
                />
              )}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={alternarTema}
            aria-label={`Cambiar a tema ${tema === "oscuro" ? "claro" : "oscuro"}`}
            className="shrink-0 cursor-pointer rounded-full p-2 text-gris-azulado transition hover:text-amarillo"
          >
            {tema === "oscuro" ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="5" />
                <path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* Si hay sesión: mi nombre y "Cerrar sesión". Si no: los botones de siempre */}
          {usuario ? (
            <>
              <Link to="/perfil" onClick={cerrarTodo} className="hidden max-w-32 shrink-0 truncate text-xs text-gris-azulado transition hover:text-blanco md:block">
                Hola, {usuario.nombre}
              </Link>
              <button
                type="button"
                onClick={salir}
                className="shrink-0 cursor-pointer rounded-br-2xl border border-borde px-4 py-2 text-xs font-semibold transition hover:border-blanco"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={cerrarTodo} className="hidden shrink-0 rounded-br-2xl border border-borde px-4 py-2 text-xs font-semibold transition hover:border-blanco sm:block">
                Iniciar sesión
              </Link>
              <Link to="/registro" onClick={cerrarTodo} className="shrink-0 rounded-xs fondo-dorado px-4 py-2 text-xs font-semibold text-negro transition hover:brightness-110">
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>

      <AnimatePresence>
        {abierto && <MenuCategorias cerrar={cerrarTodo} />}
      </AnimatePresence>
    </header>
  );
}