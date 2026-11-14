// useState me permite guardar información que puede cambiar mientras la persona utiliza el mapa En este componente lo uso para saber qué comercio seleccionó.
import { useEffect, useState } from "react";
// Link me permite navegar a otra página sin recargar toda la aplicación. Lo utilizo para abrir el mapa completo y el perfil de cada comercio.
import { Link } from "react-router";
// Estos componentes permiten mostrar el mapa de Leaflet dentro de React. MapContainer es el contenedor principal del mapa.
// TileLayer carga las imágenes que forman las calles. Marker representa cada ubicación mediante un pin.
import { MapContainer, TileLayer, Marker } from "react-leaflet";
// Leaflet es la librería que se encarga de la lógica del mapa. La utilizo para crear los pines personalizados con divIcon.
import L from "leaflet";
// Esta importación es necesaria para que Leaflet tenga sus estilos originales: tamaños, posiciones, controles y estructura del mapa.
import "leaflet/dist/leaflet.css";
// Importo las ubicaciones de los comercios. Cada comercio tiene sus coordenadas geográficas: latitud y longitud.
import { ubicaciones } from "../../data/ubicaciones";
// Esta función me permite obtener los datos de cada tienda, como el rubro, el tipo de comercio, la valoración y si está abierto.
import { datosTienda } from "../../data/tiendas";
// Esta función transforma el nombre del comercio en un formato adecuado para utilizarlo en una dirección de la aplicación.
import { aSlug } from "../../utils/slug";
// Importo los límites geográficos de Formosa. Los utilizo para evitar que el mapa se desplace fuera del área definida.
import { LIMITES_FORMOSA } from "../../utils/geo";


 //Relaciono cada tipo de comercio con un color. Utilizo códigos estables (PYME, CADENA, etc.) para no depender de cómo venga escrito el nombre desde el backend.
 //Estos colores pertenecen a la presentación del frontend:el backend solamente me informa el tipo de comercio.
const COLORES_TIPO = {
  PYME: "#22c58b",
  CADENA: "#3b82f6",
  MAYORISTA: "#a78bfa",
  KIOSCO: "#f59e0b",
  FERIA: "#f2384f",
};


 // Obtengo el color correspondiente al tipo de comercio.
// Primero normalizo el valor recibido para evitar diferencias  entre mayúsculas, minúsculas o espacios accidentales.
// Si recibo un tipo que todavía no está contemplado, utilizo un color neutro como alternativa.
const obtenerColorTipo = (tipo) => {
  const tipoNormalizado = String(tipo ?? "")
    .trim()
    .toUpperCase();

  return COLORES_TIPO[tipoNormalizado] ?? "#64748b";
};

// Esta es la dirección de los mosaicos de OpenStreetMap.
// Un mapa no es una sola imagen: está formado por muchas imágenes
// pequeñas que se cargan según la zona y el nivel de zoom.
// Leaflet reemplaza {z}, {x} e {y} por los valores correspondientes.
const TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";


// ============================================================
// 5. PREPARACIÓN DE LOS COMERCIOS
// ============================================================

// Recorro el objeto de ubicaciones para obtener cada comercio.
//
// Object.entries() convierte el objeto en una lista de pares:
// [nombre del comercio, datos de ubicación].
//
// Después construyo un nuevo objeto para cada comercio,
// combinando tres fuentes de información:
// 1. El nombre.
// 2. La ubicación (latitud y longitud).
// 3. Los datos adicionales que devuelve datosTienda().
//
// filter() elimina los comercios que no tengan coordenadas válidas.
// Esto evita que Leaflet intente colocar un pin en una posición incorrecta.
//
// Lo preparo fuera del componente porque estos datos no necesitan
// volver a calcularse cada vez que React actualiza la pantalla.
const lugares = Object.entries(ubicaciones)
  .map(([nombre, ubicacion]) => ({
    nombre,
    ...ubicacion,
    ...datosTienda(nombre),
  }))
  .filter(
    (lugar) =>
      Number.isFinite(lugar.lat) &&
      Number.isFinite(lugar.lng)
  );


// ============================================================
// 6. COORDENADAS PARA ENCUADRAR EL MAPA
// ============================================================

// Leaflet necesita recibir las coordenadas de los comercios
// para calcular qué parte del mapa debe mostrar.
//
// Cada posición se representa mediante un arreglo:
// [latitud, longitud].
//
// Con bounds={PUNTOS}, el mapa intenta encuadrar todos los puntos
// dentro del espacio disponible.
const PUNTOS = lugares.map(({ lat, lng }) => [lat, lng]);


// ============================================================
// 7. ESTILOS PROPIOS DEL MAPA
// ============================================================

// Coloco los estilos específicos de este componente acá,
// en lugar de crear otro archivo CSS.
//
// Uso una plantilla de texto porque después puedo insertarla
// directamente dentro del JSX mediante la etiqueta <style>.
//
// Estos estilos no reemplazan Tailwind: complementan las clases
// que utilizo para construir la estructura visual del componente.
const ESTILOS = `
  /* Mantengo la tipografía general dentro del mapa */
  .hero-mapa .leaflet-container {
    font-family: inherit;
  }

  /* Modifico la apariencia de las calles cuando uso el tema oscuro */
  .hero-mapa-oscuro .leaflet-tile-pane {
    filter:
      invert(1)
      hue-rotate(180deg)
      brightness(1.02)
      contrast(.92)
      saturate(.85);
  }

  /* Quito el fondo y el borde predeterminados del contenedor del pin */
  .hero-pin-wrap {
    background: transparent;
    border: 0;
  }

  /* Defino el tamaño y la animación de entrada de cada pin */
  .hero-pin {
    width: 26px;
    height: 40px;
    animation: pin-aparecer .35s ease-out both;
    transform-origin: center bottom;
  }

  /* Ajusto el SVG que dibuja la forma del pin */
  .hero-pin svg {
    display: block;
    filter: drop-shadow(0 2px 2px rgb(0 0 0 / 30%));
    transform-origin: center bottom;
    transition: transform .18s ease;
  }

  /* Agrando ligeramente el pin que está seleccionado */
  .hero-pin-activo svg {
    transform: scale(1.15);
  }

  /* Animación de entrada: el pin aparece desde un poco más arriba */
  @keyframes pin-aparecer {
    from {
      opacity: 0;
      transform: translateY(-7px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Le doy una entrada breve a la ficha del comercio */
  .hero-ficha {
    animation: ficha-aparecer .2s ease-out both;
  }

  @keyframes ficha-aparecer {
    from {
      opacity: 0;
      transform: translateY(5px);
    }

    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Si la persona prefiere reducir el movimiento,
     desactivo las animaciones y transiciones de este componente */
  @media (prefers-reduced-motion: reduce) {
    .hero-pin,
    .hero-ficha {
      animation: none;
    }

    .hero-pin svg {
      transition: none;
    }
  }
`;


// ============================================================
// 8. FUNCIÓN PARA CREAR LOS PINES PERSONALIZADOS
// ============================================================

// Creo una función para no tener que escribir el mismo SVG
// varias veces para cada comercio.
//
// Recibe dos parámetros:
// - lugar: contiene los datos del comercio.
// - seleccionado: indica si ese pin está seleccionado.
//
// El segundo parámetro tiene false como valor predeterminado.
// Por eso, si no le paso nada, crea un pin normal.
const crearIcono = (lugar, seleccionado = false) => {

  // Busco el color que corresponde al tipo de comercio.
const color = obtenerColorTipo(lugar.tipo);
  // L.divIcon me permite crear un marcador personalizado
  // utilizando HTML en lugar del pin predeterminado de Leaflet.
  return L.divIcon({
    // Esta clase permite controlar el contenedor desde el CSS.
    className: "hero-pin-wrap",

    // Dentro de html escribo la estructura visual del marcador.
    // Utilizo un SVG porque puedo controlar su forma, tamaño y colores.
    //
    // La clase hero-pin-activo se agrega solamente cuando el comercio
    // está seleccionado. Así puedo agrandarlo desde CSS.
    html: `
      <div class="hero-pin ${seleccionado ? "hero-pin-activo" : ""}">
        <svg
          width="26"
          height="40"
          viewBox="0 0 25 41"
          aria-hidden="true"
        >
          <path
            d="M12.5 0.75C5.9 0.75 0.75 5.9 0.75 12.5
            c0 9 11.75 27.5 11.75 27.5S24.25 21.5
            24.25 12.5C24.25 5.9 19.1 0.75 12.5 0.75z"
            fill="${color}"
            stroke="#ffffff"
            stroke-width="1.5"
          />
          <circle
            cx="12.5"
            cy="12.5"
            r="4.8"
            fill="#ffffff"
          />
        </svg>
      </div>
    `,

    // iconSize define el tamaño total del marcador.
    iconSize: [26, 40],

    // iconAnchor define el punto del pin que coincide con la coordenada.
    // En este caso utilizo la punta inferior para que el marcador
    // señale exactamente la ubicación del comercio.
    iconAnchor: [13, 39],
  });
};


// ============================================================
// 9. CREACIÓN DE LOS ICONOS
// ============================================================

// Creo dos versiones de cada pin:
// - normal: cuando el comercio no está seleccionado.
// - seleccionado: cuando la persona hace clic en él.
//
// Los guardo en un arreglo para reutilizarlos después.
// Así no necesito crear los SVG nuevamente en cada renderizado.
const iconos = lugares.map((lugar) => ({
  normal: crearIcono(lugar),
  seleccionado: crearIcono(lugar, true),
}));


// ============================================================
// 10. DETECCIÓN DEL TEMA CLARO U OSCURO
// ============================================================

// El Navbar es el encargado de agregar o quitar la clase
// "tema-claro" del elemento html.
//
// Como MapaHero necesita saber cuándo cambia esa clase,
// utilizo un MutationObserver para detectar el cambio.
//
// Este hook devuelve true si está activo el tema claro
// y false si está activo el tema oscuro.
function useTemaClaro() {

  // Consulto el tema actual cuando se inicializa el componente.
  // Uso una función dentro de useState para que esta consulta
  // se realice durante la inicialización y no en cada renderizado.
  const [claro, setClaro] = useState(() =>
    document.documentElement.classList.contains("tema-claro")
  );

  // useEffect me permite ejecutar código relacionado con el DOM
  // después de que React haya mostrado el componente.
  useEffect(() => {

    // Creo un observador que se ejecuta cuando cambia algún atributo
    // del elemento html.
    const observador = new MutationObserver(() => {

      // Vuelvo a comprobar si existe la clase "tema-claro".
      setClaro(
        document.documentElement.classList.contains("tema-claro")
      );
    });

    // Le indico al observador que solamente controle los cambios
    // en el atributo class del elemento html.
    observador.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Cuando el componente se desmonta, desconecto el observador.
    // Esto evita dejar un observador activo que ya no necesitamos.
    return () => observador.disconnect();

  }, []);

  // Devuelvo el estado para poder utilizarlo dentro de MapaHero.
  return claro;
}


// ============================================================
// 11. COMPONENTE PRINCIPAL
// ============================================================

export default function MapaHero() {

  // Obtengo el tema actual para cambiar la apariencia del mapa.
  const claro = useTemaClaro();

  // Guardo el índice del comercio seleccionado.
  //
  // null significa que todavía no se seleccionó ningún comercio.
  // Cuando se selecciona un marcador, guardo su posición dentro
  // del arreglo lugares.
  const [seleccionado, setSeleccionado] = useState(null);

  // Busco los datos completos del comercio seleccionado.
  //
  // Si seleccionado es null, lugar también será null.
  // Si tiene un número, obtengo el comercio correspondiente.
  const lugar =
    seleccionado === null ? null : lugares[seleccionado];


  // ==========================================================
  // 12. CONTROL DE DATOS VACÍOS
  // ==========================================================

  // Antes de mostrar el mapa compruebo que existan comercios
  // con coordenadas válidas.
  //
  // Si no hay ninguno, muestro un mensaje en lugar de intentar
  // crear un mapa sin puntos para mostrar.
  if (lugares.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-borde bg-gris-oscuro px-4 text-center text-sm text-gris-azulado lg:h-80">
        No hay comercios con ubicaciones disponibles.
      </div>
    );
  }


  // ==========================================================
  // 13. ESTRUCTURA VISUAL DEL MAPA
  // ==========================================================

  return (
    <div
      // role region identifica esta parte como una región independiente.
      // aria-label proporciona una descripción para lectores de pantalla.
      role="region"
      aria-label="Mapa de comercios de Formosa Capital"

      // relative permite posicionar elementos encima del mapa.
      // isolate crea un contexto de apilamiento propio.
      // h-64 y lg:h-80 controlan la altura según el tamaño de pantalla.
      // overflow-hidden evita que el mapa se salga de los bordes redondeados.
      // rounded-xl y border utilizan las variables de mi tema de Tailwind.
      //
      // Si el tema está oscuro, agrego hero-mapa-oscuro.
      // Esa clase activa el filtro que definí en ESTILOS.
      className={`hero-mapa relative isolate h-64 w-full overflow-hidden rounded-xl border border-borde bg-gris-oscuro shadow-lg shadow-black/10 lg:h-80 ${
        claro ? "" : "hero-mapa-oscuro"
      }`}
    >

      {/* Inserto los estilos específicos del mapa en este componente */}
      <style>{ESTILOS}</style>


      {/* =====================================================
          14. MAPA DE LEAFLET
      ====================================================== */}

      <MapContainer

        // bounds recibe todas las coordenadas y calcula
        // el encuadre inicial para que entren los comercios.
        bounds={PUNTOS}

        // Agrego un pequeño espacio alrededor de los puntos
        // para evitar que los marcadores queden pegados al borde.
        boundsOptions={{
          paddingTopLeft: [24, 48],
          paddingBottomRight: [24, 48],
        }}

        // Limito el desplazamiento a la zona definida en geo.js.
        maxBounds={LIMITES_FORMOSA}

        // Evito mostrar el control de zoom porque este mapa
        // funciona como una vista previa dentro del Hero.
        zoomControl={false}

        // Desactivo los movimientos para que el mapa no interfiera
        // con el desplazamiento normal de la página.
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        boxZoom={false}
        keyboard={false}

        // Tailwind hace que el mapa ocupe todo el contenedor.
        className="h-full w-full"

        // Defino un color de fondo mientras se cargan las calles.
        // También evito que se vea un fondo incorrecto según el tema.
        style={{
          background: claro ? "#e8eef7" : "#0a1428",
        }}
      >

        {/* =================================================
            15. CAPA DE CALLES
        ================================================== */}

        <TileLayer
          // Cargo los mosaicos de OpenStreetMap.
          url={TILES}

          // Establezco el nivel máximo de zoom permitido.
          maxZoom={19}

          // Muestro la atribución correspondiente al proveedor del mapa.
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />


        {/* =================================================
            16. MARCADORES DE LOS COMERCIOS
        ================================================== */}

        {lugares.map((comercio, indice) => (

          <Marker
            // La clave permite que React identifique cada marcador.
            // Utilizo el nombre porque cada comercio tiene uno propio.
            key={comercio.nombre}

            // Posición geográfica del comercio.
            position={[comercio.lat, comercio.lng]}

            // Si el índice coincide con el seleccionado,
            // utilizo la versión grande del pin.
            // En caso contrario, utilizo el pin normal.
            icon={
              seleccionado === indice
                ? iconos[indice].seleccionado
                : iconos[indice].normal
            }

            // El marcador seleccionado se dibuja por encima
            // de los demás para que no quede oculto.
            zIndexOffset={seleccionado === indice ? 1000 : 0}

            // eventHandlers permite responder a los eventos del marcador.
            // Cuando la persona hace clic, guardo su índice en el estado.
            eventHandlers={{
              click: () => setSeleccionado(indice),
            }}
          />

        ))}
      </MapContainer>


      {/* =====================================================
          17. ACCESO AL MAPA COMPLETO
      ====================================================== */}

      <Link
        // Envío a la persona a la ruta donde puede explorar el mapa.
        to="/mapa"

        // Estas clases son de Tailwind y utilizan los colores
        // que definí en el @theme de index.css.
        //
        // absolute permite ubicar el botón sobre el mapa.
        // right-3 y top-3 lo colocan en la esquina superior derecha.
        // z-[1000] hace que quede por encima de Leaflet.
        className="absolute right-3 top-3 z-[1000] rounded-md border border-borde bg-gris-oscuro/95 px-3 py-2 text-xs font-medium text-blanco shadow-sm transition-colors hover:border-amarillo hover:text-amarillo"
      >
        Explorar mapa ↗
      </Link>


      {/* =====================================================
          18. FICHA DEL COMERCIO SELECCIONADO
      ====================================================== */}

      {/* Solamente muestro esta ficha si existe un comercio seleccionado. */}
      {lugar && (

        <div
          // key hace que React identifique la ficha según el comercio.
          // aria-live informa a los lectores de pantalla cuando cambia.
          key={lugar.nombre}
          aria-live="polite"

          // hero-ficha aplica la animación breve que definí en ESTILOS.
          // absolute permite superponer la ficha sobre el mapa.
          // max-w evita que se salga del contenedor en pantallas pequeñas.
          className="hero-ficha absolute bottom-3 left-3 z-[1000] w-60 max-w-[calc(100%-24px)] rounded-lg border border-borde bg-gris-oscuro/95 p-3 shadow-lg backdrop-blur-sm"
        >

          {/* Encabezado de la ficha */}
          <div className="flex items-start justify-between gap-2">

            <div className="min-w-0">

              {/* Nombre del comercio */}
              <h3 className="truncate text-sm font-semibold text-blanco">
                {lugar.nombre}
              </h3>

              {/* Rubro y tipo de comercio */}
              <p className="mt-1 truncate text-xs text-gris-azulado">
                {lugar.rubro} · {lugar.tipo}
              </p>

            </div>


            {/* Botón para cerrar la información */}
            <button
              type="button"

              // Al hacer clic, vuelvo a null.
              // Así la ficha desaparece porque ya no hay selección.
              onClick={() => setSeleccionado(null)}

              // aria-label describe la acción del botón.
              aria-label="Cerrar información del comercio"

              className="shrink-0 text-lg leading-none text-gris-azulado transition-colors hover:text-blanco"
            >
              ×
            </button>

          </div>


          {/* Información adicional del comercio */}
          <div className="mt-2 flex items-center gap-3 text-xs">

            {/* Valoración del comercio */}
            <span className="text-amarillo">
              ★ {String(lugar.rating).replace(".", ",")}
            </span>

            {/* Estado actual del comercio */}
            <span
              className={
                lugar.abierto ? "text-verde" : "text-rojo"
              }
            >
              {lugar.abierto ? "Abierto" : "Cerrado"}
            </span>

          </div>


          {/* Enlace al perfil individual del comercio */}
          <Link
            // Construyo la dirección usando el nombre convertido en slug.
            to={`/tienda/${aSlug(lugar.nombre)}`}

            className="mt-3 inline-block text-xs font-medium text-amarillo transition-colors hover:underline"
          >
            Ver comercio →
          </Link>

        </div>
      )}


      {/* =====================================================
          19. MENSAJE INICIAL
      ====================================================== */}

      {/* Si todavía no seleccioné ningún comercio,
          muestro una pequeña indicación para orientar a la persona. */}
      {lugar === null && (

        <p
          // pointer-events-none evita que el mensaje bloquee
          // los clics sobre los elementos del mapa.
          className="pointer-events-none absolute bottom-3 left-3 z-[900] rounded-md border border-borde bg-gris-oscuro/95 px-3 py-2 text-xs text-gris-azulado shadow-sm"
        >
          Seleccioná un comercio para ver sus datos
        </p>

      )}

    </div>
  );
}
