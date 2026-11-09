// useState: para que React se acuerde de cosas (si algo está abierto, lo que escribo...).
// useEffect: para ejecutar código "por fuera" del dibujo (acá, escuchar el teclado y el mouse).
// useRef: para guardar una referencia directa a un elemento de la página.
import { useEffect, useRef, useState } from "react";
// Link: un enlace que cambia de página sin recargar todo.
// useNavigate: una función para mandar a la persona a otra página desde el código.
import { Link, useNavigate } from "react-router";
// motion: me deja animar. AnimatePresence: me deja animar también cuando algo DESAPARECE.
import { AnimatePresence, motion } from "motion/react";
import Logo from "../UI/Logo";
// El menú grande de categorías (está en su propio archivo, MenuCategorias.jsx).
// Los datos de las categorías, grupos e ítems los edito en data/menuCategorias.js.
import MenuCategorias from "./MenuCategorias";

export default function Navbar() {
  // ---------- ESTADOS (lo que React tiene que recordar) ----------

  // ¿El panel de categorías está abierto? Empieza cerrado (false).
  const [abierto, setAbierto] = useState(false);

  // ¿La barra de búsqueda está desplegada? Empieza escondida.
  const [buscando, setBuscando] = useState(false);

  // Lo que la persona escribió en el buscador. Empieza vacío.
  const [texto, setTexto] = useState("");

  // ---------- REFERENCIAS Y HERRAMIENTAS ----------

  // Referencia a todo el <header>. La uso para saber si un clic fue adentro o afuera del navbar.
  const contenedor = useRef(null);

  // Función para ir a otra página desde el código (la uso al enviar la búsqueda).
  const navegar = useNavigate();

  // ---------- CERRAR CON ESCAPE O CLIC AFUERA ----------

  // Este efecto se ejecuta cada vez que cambia "abierto" o "buscando".
  useEffect(() => {
    // Si no hay nada abierto, no hace falta escuchar nada. Salgo.
    if (!abierto && !buscando) return;

    // Cierro el panel y el buscador a la vez.
    const cerrarTodo = () => {
      setAbierto(false);
      setBuscando(false);
    };

    // Si hice clic en algo que NO está dentro del navbar, cierro todo.
    const cerrarAfuera = (evento) => {
      if (contenedor.current && !contenedor.current.contains(evento.target)) cerrarTodo();
    };

    // Si apreté la tecla Escape, cierro todo.
    const cerrarConEscape = (evento) => {
      if (evento.key === "Escape") cerrarTodo();
    };

    // Empiezo a escuchar el mouse y el teclado en toda la página.
    document.addEventListener("mousedown", cerrarAfuera);
    document.addEventListener("keydown", cerrarConEscape);

    // Esto se ejecuta cuando el efecto termina: dejo de escuchar para no acumular basura.
    return () => {
      document.removeEventListener("mousedown", cerrarAfuera);
      document.removeEventListener("keydown", cerrarConEscape);
    };
  }, [abierto, buscando]);

  // ---------- FUNCIONES DE LOS BOTONES ----------

  // Cierra solo el panel de categorías (lo uso al hacer clic en un enlace del panel).
  const cerrar = () => setAbierto(false);

  // Botón "Categorías": abre el panel si estaba cerrado, o lo cierra si estaba abierto.
  // Además escondo el buscador, así nunca hay dos cosas abiertas a la vez.
  const alternarPanel = () => {
    setAbierto(!abierto);
    setBuscando(false);
  };

  // Botón de la lupa: lo mismo pero al revés. Abre/cierra el buscador y cierra el panel.
  const alternarBuscador = () => {
    setBuscando(!buscando);
    setAbierto(false);
  };

  // Se ejecuta cuando envío el buscador (Enter).
  const enviarBusqueda = (evento) => {
    // Un formulario por defecto recarga la página. Con esto lo evito.
    evento.preventDefault();
    // Voy al catálogo y le paso lo escrito en la dirección: /catalogo?buscar=zapatillas
    // encodeURIComponent protege los espacios y símbolos raros para que no rompan la dirección.
    navegar(`/catalogo?buscar=${encodeURIComponent(texto)}`);
    // Cierro el buscador y limpio lo escrito.
    setBuscando(false);
    setTexto("");
  };

  // ---------- LO QUE SE DIBUJA ----------

  return (
    // sticky top-0: el navbar se queda pegado arriba al bajar por la página.
    // z-50: lo pongo por encima de todo lo demás.
    // border-b border-borde: línea fina abajo.
    // bg-negro/90 backdrop-blur: fondo casi opaco con un leve desenfoque de lo que pasa por detrás.
    <header ref={contenedor} className="sticky top-0 z-50 border-b border-borde bg-negro/90 backdrop-blur">

      {/* Barra principal.
          h-13: alto del navbar. max-w-7xl mx-auto: ancho máximo y centrado.
          gap-4: espacio entre los elementos. px-6: espacio a los costados. */}
      <div className="relative mx-auto flex h-13 max-w-7xl items-center gap-4 px-6">

        {/* Logo: al tocarlo voy a Inicio. */}
        <Link to="/" onClick={cerrar}><Logo /></Link>

        {/* BOTÓN CATEGORÍAS.
            ml-4: separación con el logo (para más espacio, subo el número: ml-6, ml-8...).
            aria-expanded: le avisa a lectores de pantalla si está abierto.
            Si está abierto → borde y texto dorados. Si no → borde normal. */}
        <button
          onClick={alternarPanel}
          aria-expanded={abierto}
          className={`ml-4 flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition ${
            abierto ? "border-amarillo text-amarillo" : "border-borde hover:border-gris-azulado"
          }`}
        >
          {/* El icono de tres rayitas (hamburguesa), dibujado con 3 líneas. */}
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
          Categorías
        </button>

        {/* LADO DERECHO: buscador, lupa y botones de sesión.
            ml-auto: empuja todo este grupo hasta el borde derecho. */}
        <div className="ml-auto flex items-center gap-3">

          {/* BARRA DE BÚSQUEDA.
              AnimatePresence permite que también se anime al desaparecer.
              Solo existe cuando "buscando" es true. */}
          <AnimatePresence>
            {buscando && (
              <motion.form
                onSubmit={enviarBusqueda}
                initial={{ width: 0, opacity: 0 }}
                // 42vw: el 42% del ancho de la pantalla, o sea casi la mitad del navbar.
                animate={{ width: "42vw", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                // max-w-120: en pantallas muy grandes no pasa de 480px.
                className="max-w-120 overflow-hidden"
              >
                {/* Es el mismo diseño del buscador que tenía en el Hero:
                    caja con borde y fondo oscuro, poco espacio adentro y esquinas redondeadas. */}
                <div className="flex items-center gap-2 rounded-xl border border-borde bg-gris-oscuro py-2 pl-4 pr-2">
                  <input
                    autoFocus
                    type="text"
                    value={texto}
                    onChange={(evento) => setTexto(evento.target.value)}
                    placeholder="Buscar productos, comercios o categorías..."
                    // min-w-0: deja que el input se achique si falta lugar, sin empujar el botón.
                    className="min-w-0 flex-1 bg-transparent text-sm text-blanco placeholder:text-gris-azulado focus:outline-none"
                  />
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* LUPA: abre y cierra el buscador. Si está abierto, se pinta de rojo. */}
          <button
            onClick={alternarBuscador}
            aria-label="Buscar"
            className={`cursor-pointer transition hover:text-rojo ${buscando ? "text-rojo" : "text-gris-azulado"}`}
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {/* El círculo de la lupa y su palito. */}
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
          </button>

          {/* Iniciar sesión: hidden sm:block → en celular se esconde para que entre todo.
              Todavía no existe la página /login. */}
          <Link to="/login" className="hidden rounded-full border border-borde px-4 py-2 text-sm font-semibold transition hover:border-blanco sm:block">
            Iniciar sesión
          </Link>

          {/* Registrarse: fondo-dorado es mi clase del degradado dorado (está en index.css).
              Todavía no existe la página /registro. */}
          <Link to="/registro" className="fondo-dorado rounded-full px-4 py-2 text-sm font-semibold text-negro transition hover:brightness-110">
            Registrarse
          </Link>
        </div>
      </div>

      {/* MENÚ DE CATEGORÍAS: va afuera de la barra, directamente dentro del header, para ocupar el ancho completo.
          AnimatePresence hace que también se anime al cerrarse.
          El contenido del menú está en MenuCategorias.jsx. */}
      <AnimatePresence>
        {abierto && <MenuCategorias cerrar={cerrar} />}
      </AnimatePresence>
    </header>
  );
}