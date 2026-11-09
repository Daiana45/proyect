import { useEffect, useState } from "react";
import { Link } from "react-router";
// animate: la función de motion para animar un número. La uso para subir suavemente al principio de la página.
import { animate } from "motion/react";
import { categorias } from "../../data/categorias";

// Las columnas de enlaces. Cada una tiene un título y su lista.
// Las rutas con "#" son páginas que todavía no existen: cuando las arme, cambio el "#" por la dirección.
const columnas = [
  {
    titulo: "Para comercios",
    enlaces: [
      { texto: "Registrá tu comercio", ruta: "/registro" },
      { texto: "Subí tus productos", ruta: "/registro" },
      { texto: "Iniciá sesión", ruta: "/login" },
    ],
  },
  {
    titulo: "Ayuda",
    enlaces: [
      { texto: "Preguntas frecuentes", ruta: "#" },
      { texto: "Contacto", ruta: "#" },
      { texto: "Términos y condiciones", ruta: "#" },
    ],
  },
  {
    titulo: "Sobre SpotMarket",
    enlaces: [
      { texto: "Quiénes somos", ruta: "#" },
      { texto: "Política de privacidad", ruta: "#" },
    ],
  },
];

// Iconos de redes, dibujados con líneas simples (sin relleno). Todos usan el color del texto.
const redes = [
  {
    nombre: "Instagram",
    dibujo: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="4.5" />
        <circle cx="12" cy="12" r="3.5" />
        <circle cx="17" cy="7" r="0.6" fill="currentColor" />
      </>
    ),
  },
  {
    nombre: "Facebook",
    dibujo: <path d="M14 8h2.5V4.5H14A3.5 3.5 0 0 0 10.5 8v2H8v3.5h2.5V20H14v-6.5h2.5l.5-3.5H14V8.5A.5.5 0 0 1 14.5 8z" />,
  },
  { nombre: "X", dibujo: <path d="M5 5l14 14M19 5L5 19" /> },
  {
    nombre: "YouTube",
    dibujo: (
      <>
        <rect x="3" y="6" width="18" height="12" rx="3.5" />
        <path d="M10.5 9.5v5l4.5-2.5z" />
      </>
    ),
  },
];

// Estilo de los títulos y de los enlaces, para no repetirlo. Todo en letra chica.
const claseTitulo = "mb-1.5 text-[11px] font-semibold";
const claseEnlace = "text-[10px] text-gris-azulado transition hover:text-blanco";

export default function Footer() {
  // Saco el año de la fecha de hoy, así no tengo que actualizarlo a mano cada enero.
  const anio = new Date().getFullYear();

  // ¿Muestro el botón de volver arriba? Solo cuando ya bajé un poco por la página.
  const [mostrarSubir, setMostrarSubir] = useState(false);

  useEffect(() => {
    const alScrollear = () => setMostrarSubir(window.scrollY > 400);
    window.addEventListener("scroll", alScrollear);
    // Al desmontar el componente, dejo de escuchar el scroll.
    return () => window.removeEventListener("scroll", alScrollear);
  }, []);

  // Subo suavemente: animo el número "scrollY" de donde estoy hasta 0.
  const subir = () => {
    animate(window.scrollY, 0, {
      duration: 0.6,
      ease: "easeInOut",
      onUpdate: (valor) => window.scrollTo(0, valor),
    });
  };

  return (
    // mt-10: poco espacio con lo de arriba.
    <footer className="mt-8 border-t border-borde bg-gris-oscuro">

      {/* Parte de arriba: 5 columnas en pantallas grandes, 2 en medianas y 1 en celular.
          py-6 y gap-6: poco espacio, así el footer queda bajo. */}
      <div className="mx-auto grid max-w-7xl gap-4 px-6 py-4 sm:grid-cols-2 lg:grid-cols-5">

        {/* Columna 1: redes sociales, cada una en un cuadradito con borde. */}
        <div>
          <h3 className={claseTitulo}>Seguinos en</h3>
          <div className="flex flex-wrap gap-1">
            {redes.map((red) => (
              <a
                key={red.nombre}
                href="#"
                aria-label={red.nombre}
                className="flex h-6 w-6 items-center justify-center rounded-md border border-borde text-gris-azulado transition hover:border-amarillo hover:text-amarillo"
              >
                <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  {red.dibujo}
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Columna 2: las categorías, que salen de mis datos. Cada una lleva al catálogo filtrado. */}
        <div>
          <h3 className={claseTitulo}>Categorías</h3>
          <ul className="flex flex-col gap-1">
            {categorias.slice(0, 5).map((categoria) => (
              <li key={categoria}>
                <Link to={`/catalogo?categoria=${encodeURIComponent(categoria)}`} className={claseEnlace}>
                  {categoria}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Columnas 3, 4 y 5: las armo recorriendo la lista "columnas" de arriba. */}
        {columnas.map((columna) => (
          <div key={columna.titulo}>
            <h3 className={claseTitulo}>{columna.titulo}</h3>
            <ul className="flex flex-col gap-1.5">
              {columna.enlaces.map((enlace) => (
                <li key={enlace.texto}>
                  <Link to={enlace.ruta} className={claseEnlace}>
                    {enlace.texto}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Franja de abajo: el texto legal, en letra bien chica. */}
      <div className="border-t border-borde">
        <p className="mx-auto max-w-7xl px-6 py-3 text-[10px] leading-relaxed text-gris-azulado">
          © {anio} SpotMarket. Todos los derechos reservados. Los precios y la disponibilidad los informa cada comercio y pueden cambiar sin aviso.
        </p>
      </div>

      {/* Botón redondo rojo para volver arriba. fixed: queda flotando abajo a la derecha.
          Solo existe cuando "mostrarSubir" es true. */}
      {mostrarSubir && (
        <button
          onClick={subir}
          aria-label="Volver arriba"
          className="fixed bottom-5 right-5 z-40 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-rojo text-blanco shadow-lg transition hover:brightness-110"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
        </button>
      )}
    </footer>
  );
}