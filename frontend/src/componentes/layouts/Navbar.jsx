import Logo from "../UI/Logo";
import Button from "../UI/Button";

// Acá guardo los enlaces del menú en una lista, así no los escribo uno por uno. Si mañana quiero agregar uno nuevo, solo sumo una línea acá.
const enlaces = [
  { nombre: "Inicio", href: "#inicio" },
  { nombre: "Catalogo", href: "#catalogo" },
  { nombre: "Cómo funciona", href: "#como-funciona" },
  { nombre: "Contacto", href: "#contacto" },
  { nombre: "Mapa", href: "#mapa" },
];

// "activo" es el nombre del enlace de la página donde estoy parado, si no le paso nada, uso "Inicio".
export default function Navbar({ activo = "Inicio" }) {
  return (
    // sticky top-0: la barra se queda pegada arriba cuando bajo con el scroll.
    // z-40: la pongo por encima de lo demás para que nada la tape.
    // bg-negro/80 backdrop-blur: fondo oscuro un poco transparente, con el contenido de atrás desenfocado.
    // border-b border-borde: una línea fina abajo para separarla del contenido.
    <header className="sticky top-0 z-40 border-b border-borde bg-negro/80 backdrop-blur">

      {/* Este contenedor centra todo y le pone un ancho máximo.
          flex justify-between: reparto lo de adentro con espacio entre cada parte. */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-1">

        {/* IZQUIERDA: mi logo */}
        <Logo />

        {/* CENTRO: los enlaces.
            hidden md:flex: en celular los oculto y desde pantalla mediana los muestro. */}
        <ul className="hidden items-center gap-8 md:flex">
          {/* map recorre mi lista y me arma un <li> por cada enlace.
              key le sirve a React para distinguir un elemento de otro. */}
          {enlaces.map((enlace) => (
            <li key={enlace.nombre}>
              <a
                href={enlace.href}
                // Si este enlace es el activo, lo pinto de blanco y le dibujo
                // una línea amarilla abajo. Si no, lo dejo grisáceo y se aclara al pasar el mouse.
                className={`pb-1 text-sm transition ${
                  enlace.nombre === activo
                    ? "border-b-2 border-amarillo text-blanco"
                    : "text-gris-azulado hover:text-blanco"
                }`}
              >
                {enlace.nombre}
              </a>
            </li>
          ))}
        </ul>

        {/* DERECHA: la lupa y mis dos botones */}
        <div className="flex items-center gap-3">

          {/* La lupa es un SVG dibujado a mano: un círculo y una rayita.
              aria-label lo uso para que un lector de pantalla sepa qué es.
              stroke="currentColor" hace que tome el color del texto. */}
          <button aria-label="Buscar" className="cursor-pointer p-2 text-gris-azulado transition hover:text-blanco">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M16.5 16.5L21 21" />
            </svg>
          </button>

          {/* Uso mi componente Button con sus dos variantes. */}
          <Button variante="contorno">Iniciar sesión</Button>
          <Button>Registrarse</Button>
        </div>
      </nav>
    </header>
  );
}