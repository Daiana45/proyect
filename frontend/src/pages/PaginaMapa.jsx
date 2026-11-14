import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, ZoomControl, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { productosCatalogo } from "../data/catalogo";
import { datosTienda } from "../data/tiendas";
import { comercios } from "../data/comercios";
import { ubicaciones } from "../data/ubicaciones";
import { aSlug } from "../utils/slug";
import { CENTRO_FORMOSA, LIMITES_FORMOSA, distanciaKm, formatoDistancia, dentroDeFormosa } from "../utils/geo";
import useAuth from "../componentes/hooks/useAuth";
import useAccionPrivada from "../componentes/hooks/useAccionPrivada";

// Color del pin según el tipo de comercio
const COLORES_TIPO = {
  Pyme: "#22c58b",
  Cadena: "#3b82f6",
  Mayorista: "#a78bfa",
  Kiosco: "#f59e0b",
  Feria: "#f2384f",
};
const TIPOS = ["Todos", "Pyme", "Cadena", "Mayorista", "Kiosco", "Feria"];

// Mapa de calles de OpenStreetMap. No pide clave. Para el tema oscuro le aplico un filtro de CSS (ver ESTILOS).
const TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

// Formas de llegar. "servicio" es el servidor de rutas de OpenStreetMap para cada una.
// "kmh" es la velocidad que uso solo si no hay internet y tengo que estimar el tiempo en línea recta.
const MODOS = {
  foot: { texto: "A pie", icono: "🚶", servicio: "routed-foot", kmh: 5 },
  bike: { texto: "En bici", icono: "🚲", servicio: "routed-bike", kmh: 15 },
  car: { texto: "En auto", icono: "🚗", servicio: "routed-car", kmh: 30 },
};

// Dirección del servicio de rutas. Ojo: en este servidor la palabra "driving" va siempre, para los tres modos.
const urlRuta = (servicio, origen, destino) =>
  `https://routing.openstreetmap.de/${servicio}/route/v1/driving/${origen[1]},${origen[0]};${destino[1]},${destino[0]}?overview=full&geometries=geojson`;

// 75 min -> "1 h 15 min"
const formatoTiempo = (min) => {
  if (min < 60) return `${min} min`;
  const resto = min % 60;
  return `${Math.floor(min / 60)} h${resto ? ` ${resto} min` : ""}`;
};

// Hora actual en milisegundos. Está afuera del componente porque React no deja llamar a Date.now() adentro (no es una función "pura").
const ahoraMs = () => Date.now();

// Una lista armada una sola vez: cada comercio con su ubicación, sus datos y los productos que vende
const lugares = Object.entries(ubicaciones).map(([nombre, ubicacion]) => {
  const propios = productosCatalogo.filter((p) => p.tienda.nombre === nombre);
  return {
    nombre,
    ...ubicacion,
    ...datosTienda(nombre),
    direccion: comercios.find((c) => c.nombre === nombre)?.direccion,
    productos: propios.length,
    // Los nombres de lo que vende, sin repetir: sirven para que la búsqueda encuentre "yerba" y te diga dónde hay
    listaProductos: [...new Set(propios.map((p) => p.nombre))],
  };
});

const MENSAJES_GPS = {
  buscando: "Buscando tu ubicación…",
  denegado: "No diste permiso de ubicación. Habilitalo desde el candado de la barra de direcciones y probá de nuevo.",
  tiempo: "Tardó demasiado en encontrar tu ubicación. Probá de nuevo, mejor al aire libre o con el GPS activado.",
  error: "No pudimos obtener tu ubicación.",
  "no-soportado": "Tu navegador no soporta geolocalización.",
};

// Estilos de los pines, la ventanita (popup) y la animación del punto azul
const ESTILOS = `
.pin-wrap, .usuario-wrap, .cruz-wrap { background: none; border: none; }
.pin-svg { display: block; filter: drop-shadow(0 3px 3px rgba(0,0,0,.45)); transform-origin: 50% 100%; transition: transform .15s ease; }
.pin-activo { transform: scale(1.25); }
.usuario { width: 18px; height: 18px; border-radius: 50%; background: #3b82f6; border: 3px solid #fff; animation: pulso 1.8s infinite; }
@keyframes pulso { 0% { box-shadow: 0 0 0 0 rgba(59,130,246,.7); } 70% { box-shadow: 0 0 0 16px rgba(59,130,246,0); } 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); } }
.cruz { width: 22px; height: 22px; border: 2px solid #f2384f; border-radius: 50%; position: relative; background: rgba(242,56,79,.2); }
.cruz::before, .cruz::after { content: ""; position: absolute; background: #f2384f; }
.cruz::before { left: 50%; top: -6px; bottom: -6px; width: 2px; margin-left: -1px; }
.cruz::after { top: 50%; left: -6px; right: -6px; height: 2px; margin-top: -1px; }
.mapa-oscuro .leaflet-tile-pane { filter: invert(1) hue-rotate(180deg) brightness(0.9) contrast(0.95) saturate(0.7); }
.leaflet-container { font-family: inherit; }
.leaflet-popup-content-wrapper { background: var(--color-gris-oscuro); color: var(--color-blanco); border: 1px solid var(--color-borde); border-radius: 8px; box-shadow: 0 10px 30px rgba(0,0,0,.45); }
.leaflet-popup-tip { background: var(--color-gris-oscuro); }
.leaflet-popup-content { margin: 14px 16px; }
.popup-comercio a { text-decoration: none; }
.popup-btn { display: block; width: 100%; text-align: center; padding: 8px 10px; border-radius: 4px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; }
.popup-btn-oro { background-image: linear-gradient(135deg, #ffe08a, #ffc72c 50%, #d99200); color: #050b1a !important; }
.popup-btn-borde { border: 1px solid var(--color-borde); background: transparent; color: var(--color-blanco) !important; }
.modo-coordenadas .leaflet-container, .modo-coordenadas .leaflet-interactive { cursor: crosshair !important; }
`;

// Pin clásico en forma de gota, del color del tipo de comercio. "activo" lo agranda y le pone borde dorado
const iconoComercio = (color, activo) =>
  L.divIcon({
    className: "pin-wrap",
    html: `<svg class="pin-svg ${activo ? "pin-activo" : ""}" width="30" height="49" viewBox="0 0 25 41" aria-hidden="true">
      <path d="M12.5 0.75C5.9 0.75 0.75 5.9 0.75 12.5c0 9 11.75 27.5 11.75 27.5S24.25 21.5 24.25 12.5C24.25 5.9 19.1 0.75 12.5 0.75z" fill="${color}" stroke="${activo ? "#ffc72c" : "#ffffff"}" stroke-width="1.5"/>
      <circle cx="12.5" cy="12.5" r="4.8" fill="#ffffff"/>
    </svg>`,
    iconSize: [30, 49],
    iconAnchor: [15, 48],
    popupAnchor: [0, -44],
  });

const iconoUsuario = L.divIcon({
  className: "usuario-wrap",
  html: '<div class="usuario"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const iconoCruz = L.divIcon({
  className: "cruz-wrap",
  html: '<div class="cruz"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

// Detecta si la página está en tema claro (el Navbar le pone la clase "tema-claro" al <html>)
function useTemaClaro() {
  const [claro, setClaro] = useState(() => document.documentElement.classList.contains("tema-claro"));
  useEffect(() => {
    const observador = new MutationObserver(() =>
      setClaro(document.documentElement.classList.contains("tema-claro"))
    );
    observador.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observador.disconnect();
  }, []);
  return claro;
}

// Escucha los clics del mapa, pero solo cuando está activo el modo "Copiar coordenadas"
function CapturaClics({ activo, alElegir }) {
  useMapEvents({
    click(e) {
      if (activo) alElegir([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function PaginaMapa() {
  const [parametros] = useSearchParams();
  const tiendaParam = parametros.get("tienda"); // /mapa?tienda=Súper Sol abre ese comercio
  const claro = useTemaClaro();

  // PÚBLICO: ver el mapa, los comercios, buscar y filtrar por tipo.
  // PRIVADO (pide login): usar tu ubicación, ordenar por cercanía, filtrar por distancia y "Cómo llegar".
  const { estaLogueado } = useAuth();
  const protegida = useAccionPrivada();
  const paginaActual = useLocation();

  const [mapa, setMapa] = useState(null);
  const marcadores = useRef({});

  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState("Todos");
  const [soloAbiertos, setSoloAbiertos] = useState(false);
  const [radio, setRadio] = useState(0); // 0 = sin límite
  const [seleccionado, setSeleccionado] = useState(tiendaParam);

  const [ubicacion, setUbicacion] = useState(null);
  const [precision, setPrecision] = useState(0);
  const [estadoGPS, setEstadoGPS] = useState("idle");

  const [modoCoordenadas, setModoCoordenadas] = useState(false);
  const [puntoElegido, setPuntoElegido] = useState(null);
  const [copiado, setCopiado] = useState(false);

  // La ruta que se está mostrando (null = ninguna). Guarda el destino, el modo elegido y las rutas de cada modo.
  const [ruta, setRuta] = useState(null);
  // Cuenta las peticiones: si toco "Cómo llegar" en otro comercio mientras calcula, descarto la respuesta vieja
  const peticion = useRef(0);

  // Si llegué desde "Ver en el mapa" de un comercio, lo muestro abierto apenas carga el mapa
  useEffect(() => {
    if (!mapa || !tiendaParam) return;
    const lugar = lugares.find((l) => l.nombre === tiendaParam);
    if (!lugar) return;
    mapa.setView([lugar.lat, lugar.lng], 17);
    const espera = setTimeout(() => marcadores.current[lugar.nombre]?.openPopup(), 300);
    return () => clearTimeout(espera);
  }, [mapa, tiendaParam]);

  // Punto desde el que mido las distancias: tu ubicación si estás logueado y en Formosa Capital, si no el centro
  const fueraDeFormosa = ubicacion ? !dentroDeFormosa(ubicacion) : false;
  const usandoGPS = estaLogueado && ubicacion !== null && !fueraDeFormosa;
  const referencia = usandoGPS ? ubicacion : CENTRO_FORMOSA;

  // Lo que escribió, sin espacios de más y en minúsculas, para comparar
  const consulta = busqueda.trim().toLowerCase();

  const visibles = lugares
    .map((l) => ({
      ...l,
      km: distanciaKm(referencia, [l.lat, l.lng]),
      // Un producto que vende este comercio y coincide con la búsqueda (para avisarle "Tiene: ...")
      conLo: consulta ? l.listaProductos.find((n) => n.toLowerCase().includes(consulta)) : undefined,
    }))
    .filter(
      (l) =>
        (!consulta ||
          `${l.nombre} ${l.rubro} ${l.tipo} ${l.direccion ?? ""}`.toLowerCase().includes(consulta) ||
          l.conLo) &&
        (tipo === "Todos" || l.tipo === tipo) &&
        (!soloAbiertos || l.abierto) &&
        // El filtro de distancia solo funciona con sesión
        (!estaLogueado || !radio || l.km <= radio)
    )
    // Sin sesión: orden alfabético. Con sesión: del más cercano al más lejano.
    .sort((a, b) => (estaLogueado ? a.km - b.km : a.nombre.localeCompare(b.nombre)));

  // Cuando busco algo, el mapa se acerca solo para mostrar todos los resultados.
  // claveVisibles cambia solo cuando cambia QUÉ comercios se ven (así no se mueve en cada render).
  const claveVisibles = visibles.map((l) => l.nombre).join("|");
  useEffect(() => {
    if (!mapa || !consulta) return;
    const puntos = visibles.map((l) => [l.lat, l.lng]);
    if (puntos.length > 0) mapa.flyToBounds(puntos, { padding: [70, 70], maxZoom: 16, duration: 0.8 });
    // visibles se arma en cada render; la clave de arriba ya avisa cuando de verdad cambia
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claveVisibles, consulta, mapa]);

  // Pide tu ubicación al navegador. "despues" (opcional) se llama al terminar, con el punto o con null si falló.
  const localizar = (despues) => {
    const avisar = typeof despues === "function" ? despues : null;
    if (!("geolocation" in navigator)) {
      setEstadoGPS("no-soportado");
      avisar?.(null);
      return;
    }
    setEstadoGPS("buscando");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const punto = [pos.coords.latitude, pos.coords.longitude];
        setUbicacion(punto);
        setPrecision(pos.coords.accuracy);
        setEstadoGPS("ok");
        if (!avisar && dentroDeFormosa(punto)) mapa?.flyTo(punto, 15, { duration: 1 });
        avisar?.(punto);
      },
      (error) => {
        setEstadoGPS(error.code === 1 ? "denegado" : error.code === 3 ? "tiempo" : "error");
        avisar?.(null);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 }
    );
  };

  const seleccionar = (lugar) => {
    setSeleccionado(lugar.nombre);
    mapa?.flyTo([lugar.lat, lugar.lng], 17, { duration: 0.8 });
    setTimeout(() => marcadores.current[lugar.nombre]?.openPopup(), 850);
  };

  // Calcula las rutas a pie, en bici y en auto desde "origen" hasta el comercio y las muestra en el mapa
  const trazar = async (lugar, origen, desdeVos) => {
    const id = ++peticion.current;
    const destino = [lugar.lat, lugar.lng];
    setRuta({ destino: lugar.nombre, desdeVos, modo: "foot", estado: "cargando", rutas: {}, calculadoEn: 0 });
    mapa?.closePopup();

    let rutas;
    let aproximado = false;
    try {
      const resultados = await Promise.all(
        Object.entries(MODOS).map(async ([clave, modo]) => {
          const respuesta = await fetch(urlRuta(modo.servicio, origen, destino));
          if (!respuesta.ok) throw new Error("sin ruta");
          const r = (await respuesta.json()).routes[0];
          return [
            clave,
            {
              km: r.distance / 1000,
              min: Math.max(1, Math.round(r.duration / 60)),
              puntos: r.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
            },
          ];
        })
      );
      rutas = Object.fromEntries(resultados);
    } catch {
      // Sin internet o sin servicio: estimo en línea recta (un 30% más para parecerse a las calles reales)
      aproximado = true;
      const km = distanciaKm(origen, destino) * 1.3;
      rutas = Object.fromEntries(
        Object.entries(MODOS).map(([clave, modo]) => [
          clave,
          { km, min: Math.max(1, Math.round((km / modo.kmh) * 60)), puntos: [origen, destino] },
        ])
      );
    }

    if (id !== peticion.current) return; // llegó tarde: ya pedí otra ruta
    setRuta({ destino: lugar.nombre, desdeVos, modo: "foot", estado: aproximado ? "aproximado" : "ok", rutas, calculadoEn: ahoraMs() });
    mapa?.flyToBounds(rutas.foot.puntos, { padding: [90, 90], maxZoom: 17, duration: 0.8 });
  };

  // Botón "Cómo llegar" de la ficha (privado): si no tengo tu ubicación la pido primero
  const comoLlegar = (lugar) => {
    setSeleccionado(lugar.nombre);
    const desde = (punto) => {
      const enFormosa = punto !== null && dentroDeFormosa(punto);
      trazar(lugar, enFormosa ? punto : CENTRO_FORMOSA, enFormosa);
    };
    if (ubicacion) desde(ubicacion);
    else localizar(desde);
  };

  const elegirModo = (modo) => {
    if (!ruta || ruta.estado === "cargando") return;
    setRuta({ ...ruta, modo });
    mapa?.flyToBounds(ruta.rutas[modo].puntos, { padding: [90, 90], maxZoom: 17, duration: 0.6 });
  };

  const quitarRuta = () => {
    peticion.current++;
    setRuta(null);
  };

  // Teclas dentro del buscador: Enter abre el primer resultado y Escape borra lo escrito
  const teclasBuscador = (e) => {
    if (e.key === "Enter" && visibles[0]) {
      e.preventDefault();
      seleccionar(visibles[0]);
    } else if (e.key === "Escape") {
      setBusqueda("");
    }
  };

  // Modo "Copiar coordenadas": al hacer clic en el mapa copio "lat, lng" al portapapeles
  const elegirPunto = async (punto) => {
    setPuntoElegido(punto);
    setCopiado(false);
    try {
      await navigator.clipboard.writeText(`${punto[0].toFixed(6)}, ${punto[1].toFixed(6)}`);
      setCopiado(true);
    } catch {
      setCopiado(false);
    }
  };

  const alternarModoCoordenadas = () => {
    setModoCoordenadas(!modoCoordenadas);
    setPuntoElegido(null);
    setCopiado(false);
  };

  const botonMapa =
    "cursor-pointer rounded-md border border-borde bg-gris-oscuro/95 px-3 py-2 text-xs font-semibold shadow-lg shadow-black/30 backdrop-blur transition hover:border-amarillo disabled:cursor-wait disabled:opacity-60";
  const kmAlCentro = ubicacion ? distanciaKm(ubicacion, CENTRO_FORMOSA) : 0;

  // Datos de la ruta elegida para mostrar en el panel
  const rutaActual = ruta?.rutas[ruta.modo];
  const horaLlegada =
    rutaActual && ruta.calculadoEn
      ? new Date(ruta.calculadoEn + rutaActual.min * 60000).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
      : null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <style>{ESTILOS}</style>

      <p className="text-xs text-gris-azulado">
        <Link to="/" className="hover:underline">Inicio</Link> › <span className="text-blanco">Mapa</span>
      </p>
      <h1 className="mt-2 font-titulo text-2xl font-bold md:text-3xl">Comercios cerca tuyo en Formosa Capital</h1>

      <div className="mt-4 grid gap-4 lg:h-[calc(100vh-12rem)] lg:min-h-140 lg:grid-cols-[360px_minmax(0,1fr)]">
        {/* ---------- PANEL IZQUIERDO ---------- */}
        <aside className="flex max-h-104 min-h-0 flex-col rounded-md border border-borde bg-gris-oscuro lg:max-h-none">
          <div className="border-b border-borde p-4">
            {/* Privado: sin sesión te manda a iniciar sesión y vuelve acá */}
            <button
              onClick={() => protegida(() => localizar(), "usar tu ubicación")}
              disabled={estadoGPS === "buscando"}
              className="w-full cursor-pointer rounded-sm fondo-dorado px-4 py-2.5 text-xs font-semibold text-negro transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
            >
              {estadoGPS === "buscando" ? "Buscando..." : estaLogueado ? "◎ Usar mi ubicación" : "🔒 Usar mi ubicación"}
            </button>

            {/* Aviso para quien no inició sesión */}
            {!estaLogueado && (
              <p className="mt-2 text-[11px] text-gris-azulado">
                <Link to="/login" state={{ desde: paginaActual, motivo: "ver los comercios más cercanos" }} className="text-azul hover:underline">
                  Iniciá sesión
                </Link>{" "}
                para usar tu ubicación, ordenar por cercanía y filtrar por distancia.
              </p>
            )}

            {/* Estado de la geolocalización */}
            {estaLogueado && estadoGPS === "ok" && !fueraDeFormosa && (
              <p className="mt-2 text-[11px] text-verde">
                Ubicación encontrada (precisión ±{Math.round(precision)} m). Las distancias salen desde donde estás.
              </p>
            )}
            {estaLogueado && estadoGPS === "ok" && fueraDeFormosa && (
              <p className="mt-2 text-[11px] text-naranja">
                Parecés estar a {formatoDistancia(kmAlCentro)} del centro de Formosa, fuera de la ciudad. Medimos las distancias desde el centro.
              </p>
            )}
            {estaLogueado && MENSAJES_GPS[estadoGPS] && <p className="mt-2 text-[11px] text-gris-azulado">{MENSAJES_GPS[estadoGPS]}</p>}

            {/* Buscador con lupa y botón para borrar */}
            <div className="relative mt-3">
              <svg
                viewBox="0 0 24 24"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gris-azulado"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyDown={teclasBuscador}
                placeholder="Buscar comercio, rubro o producto..."
                className="w-full rounded-md border border-borde bg-transparent py-2 pl-9 pr-8 text-xs outline-none focus:border-amarillo"
              />
              {busqueda && (
                <button
                  onClick={() => setBusqueda("")}
                  aria-label="Borrar búsqueda"
                  className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer px-1 text-xs text-gris-azulado hover:text-blanco"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {TIPOS.map((t) => (
                <button
                  key={t}
                  onClick={() => setTipo(t)}
                  className={`cursor-pointer rounded-full border px-3 py-1 text-[11px] font-semibold transition ${
                    tipo === t ? "border-amarillo bg-amarillo text-negro" : "border-borde text-gris-azulado hover:border-blanco hover:text-blanco"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 text-xs">
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={soloAbiertos} onChange={(e) => setSoloAbiertos(e.target.checked)} className="accent-amarillo" />
                Abiertos ahora
              </label>
              {/* Distancia: privada. Sin sesión el selector queda bloqueado */}
              <select
                value={estaLogueado ? radio : 0}
                onChange={(e) => setRadio(Number(e.target.value))}
                disabled={!estaLogueado}
                title={estaLogueado ? undefined : "Iniciá sesión para filtrar por distancia"}
                className="rounded-sm border border-borde bg-gris-oscuro px-2 py-1.5 text-xs outline-none focus:border-amarillo disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value={0}>{estaLogueado ? "Cualquier distancia" : "🔒 Distancia"}</option>
                <option value={1}>Hasta 1 km</option>
                <option value={2}>Hasta 2 km</option>
                <option value={3}>Hasta 3 km</option>
                <option value={5}>Hasta 5 km</option>
              </select>
            </div>

            {/* Leyenda de colores */}
            <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-gris-azulado">
              {Object.entries(COLORES_TIPO).map(([nombre, color]) => (
                <span key={nombre} className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full" style={{ background: color }} />
                  {nombre}
                </span>
              ))}
            </div>
          </div>

          <p className="px-4 pt-3 text-[11px] text-gris-azulado">
            {visibles.length} {visibles.length === 1 ? "comercio" : "comercios"} ·{" "}
            {estaLogueado ? "del más cercano al más lejano" : "ordenados por nombre"}
          </p>

          {/* Lista de comercios */}
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {visibles.length === 0 && (
              <p className="py-6 text-center text-xs text-gris-azulado">No hay comercios con esos filtros.</p>
            )}
            <div className="flex flex-col gap-2">
              {visibles.map((l) => (
                <button
                  key={l.nombre}
                  onClick={() => seleccionar(l)}
                  className={`flex w-full cursor-pointer items-center gap-3 rounded-md border p-3 text-left transition hover:border-amarillo/60 ${
                    seleccionado === l.nombre ? "border-amarillo bg-amarillo/5" : "border-borde"
                  }`}
                >
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                    style={{ background: COLORES_TIPO[l.tipo] ?? "#3b82f6", color: "#050b1a" }}
                  >
                    {l.nombre[0]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{l.nombre}</span>
                    <span className="block truncate text-[11px] text-gris-azulado">
                      {l.rubro} · <span className="text-amarillo">★ {String(l.rating).replace(".", ",")}</span>
                    </span>
                    <span className={`text-[10px] font-semibold ${l.abierto ? "text-verde" : "text-rojo"}`}>
                      {l.abierto ? "Abierto ahora" : "Cerrado ahora"}
                    </span>
                    {/* Si encontré este comercio por un producto, aviso cuál */}
                    {l.conLo && <span className="block truncate text-[10px] text-azul">Tiene: {l.conLo}</span>}
                  </span>
                  {/* La distancia solo se muestra con sesión */}
                  {estaLogueado && <span className="shrink-0 text-right text-xs font-bold">{formatoDistancia(l.km)}</span>}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* ---------- MAPA ---------- */}
        <div
          className={`relative isolate h-[70vh] overflow-hidden rounded-md border border-borde lg:h-full ${
            modoCoordenadas ? "modo-coordenadas" : ""
          } ${claro ? "" : "mapa-oscuro"}`}
        >
          <MapContainer
            ref={setMapa}
            center={CENTRO_FORMOSA}
            zoom={13}
            minZoom={12}
            maxZoom={19}
            maxBounds={LIMITES_FORMOSA}
            maxBoundsViscosity={1}
            zoomControl={false}
            className="h-full w-full"
            style={{ background: claro ? "#e8eef7" : "#0a1428" }}
          >
            <TileLayer
              url={TILES}
              maxZoom={19}
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <ZoomControl position="bottomright" />
            <CapturaClics activo={modoCoordenadas} alElegir={elegirPunto} />

            {/* Círculo del radio elegido */}
            {estaLogueado && radio > 0 && (
              <Circle
                center={referencia}
                radius={radio * 1000}
                pathOptions={{ color: "#ffc72c", weight: 1.5, dashArray: "6 6", fillOpacity: 0.05 }}
              />
            )}

            {/* La ruta: una línea oscura más gruesa abajo y la dorada arriba, para que se vea sobre cualquier fondo */}
            {rutaActual && (
              <>
                <Polyline positions={rutaActual.puntos} pathOptions={{ color: "#050b1a", weight: 9, opacity: 0.55 }} />
                <Polyline
                  positions={rutaActual.puntos}
                  pathOptions={{ color: "#ffc72c", weight: 5, opacity: 1, dashArray: ruta.estado === "aproximado" ? "8 8" : undefined }}
                />
              </>
            )}

            {/* Tu ubicación y su margen de error */}
            {usandoGPS && (
              <>
                <Circle center={ubicacion} radius={precision} pathOptions={{ color: "#3b82f6", weight: 1, fillOpacity: 0.12 }} />
                <Marker position={ubicacion} icon={iconoUsuario} zIndexOffset={1000}>
                  <Popup closeButton={false}>
                    <div className="popup-comercio text-xs font-semibold">Estás acá</div>
                  </Popup>
                </Marker>
              </>
            )}

            {/* Un pin por comercio */}
            {visibles.map((l) => (
              <Marker
                key={l.nombre}
                position={[l.lat, l.lng]}
                icon={iconoComercio(COLORES_TIPO[l.tipo] ?? "#3b82f6", seleccionado === l.nombre)}
                ref={(marcador) => {
                  marcadores.current[l.nombre] = marcador;
                }}
                eventHandlers={{ click: () => setSeleccionado(l.nombre) }}
              >
                <Popup closeButton={false} minWidth={230} maxWidth={260}>
                  <div className="popup-comercio">
                    <p className="font-titulo text-base font-bold leading-tight">{l.nombre}</p>
                    <p className="mt-0.5 text-[11px]" style={{ opacity: 0.7 }}>
                      {l.rubro} · {l.tipo}
                    </p>
                    <p className="mt-2 text-[11px]">
                      <span style={{ color: "#d99a00", fontWeight: 700 }}>★ {String(l.rating).replace(".", ",")}</span> ·{" "}
                      <span style={{ color: l.abierto ? "#22c58b" : "#f2384f", fontWeight: 600 }}>
                        {l.abierto ? "Abierto ahora" : "Cerrado ahora"}
                      </span>
                    </p>
                    {l.direccion && <p className="mt-1 text-[11px]">{l.direccion}</p>}
                    <p className="mt-1 text-[11px]" style={{ opacity: 0.7 }}>
                      {estaLogueado && <>A {formatoDistancia(l.km)} de {usandoGPS ? "vos" : "el centro"} · </>}
                      {l.productos} {l.productos === 1 ? "producto" : "productos"}
                    </p>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Link to={`/tienda/${aSlug(l.nombre)}`} className="popup-btn popup-btn-oro">
                        Ver perfil
                      </Link>
                      {/* Privado: la ruta necesita tu ubicación, así que pide sesión */}
                      <button
                        type="button"
                        onClick={() => protegida(() => comoLlegar(l), "ver cómo llegar")}
                        className="popup-btn popup-btn-borde"
                      >
                        {estaLogueado ? "Cómo llegar" : "🔒 Cómo llegar"}
                      </button>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Punto elegido en el modo "Copiar coordenadas" */}
            {puntoElegido && <Marker position={puntoElegido} icon={iconoCruz} interactive={false} />}
          </MapContainer>

          {/* Panel de la ruta: tiempos por modo, distancia y hora de llegada */}
          {ruta && (
            <div className="absolute left-3 top-3 z-1000 w-72 max-w-[calc(100%-1.5rem)] rounded-md border border-borde bg-gris-oscuro/95 p-3 shadow-lg shadow-black/30 backdrop-blur">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-gris-azulado">Cómo llegar a</p>
                  <p className="truncate font-titulo text-base font-bold leading-tight">{ruta.destino}</p>
                </div>
                <button
                  onClick={quitarRuta}
                  aria-label="Cerrar ruta"
                  className="cursor-pointer px-1 text-sm text-gris-azulado hover:text-blanco"
                >
                  ✕
                </button>
              </div>

              {ruta.estado === "cargando" && <p className="mt-3 text-xs text-gris-azulado">Calculando la ruta…</p>}

              {ruta.estado !== "cargando" && (
                <>
                  {/* Un botón por forma de viajar, con su tiempo */}
                  <div className="mt-3 grid grid-cols-3 gap-1.5">
                    {Object.entries(MODOS).map(([clave, modo]) => (
                      <button
                        key={clave}
                        onClick={() => elegirModo(clave)}
                        aria-pressed={ruta.modo === clave}
                        className={`cursor-pointer rounded-md border px-1 py-2 text-center transition ${
                          ruta.modo === clave ? "border-amarillo bg-amarillo/10" : "border-borde hover:border-blanco"
                        }`}
                      >
                        <span className="block text-base leading-none">{modo.icono}</span>
                        <span className="mt-1 block text-[11px] font-semibold">{formatoTiempo(ruta.rutas[clave].min)}</span>
                      </button>
                    ))}
                  </div>

                  {/* La ruta elegida */}
                  <p className="mt-3 text-2xl font-bold text-amarillo">{formatoTiempo(rutaActual.min)}</p>
                  <p className="text-xs text-gris-azulado">
                    {formatoDistancia(rutaActual.km)} · {MODOS[ruta.modo].texto.toLowerCase()}
                    {horaLlegada && <> · llegás a las {horaLlegada}</>}
                  </p>
                  <p className="mt-2 text-[10px] text-gris-azulado">
                    {ruta.desdeVos ? "Desde tu ubicación." : "Desde el centro de Formosa (no pudimos ubicarte en la ciudad)."}
                    {ruta.estado === "aproximado" && " Tiempo estimado en línea recta: no pudimos calcular las calles."}
                  </p>
                </>
              )}
            </div>
          )}

          {/* Botones sobre el mapa */}
          <div className="absolute right-3 top-3 z-1000 flex flex-col items-end gap-2">
            <button
              onClick={() => protegida(() => localizar(), "usar tu ubicación")}
              disabled={estadoGPS === "buscando"}
              className={botonMapa}
            >
              {estaLogueado ? "◎ Mi ubicación" : "🔒 Mi ubicación"}
            </button>
            <button onClick={() => mapa?.flyTo(CENTRO_FORMOSA, 14, { duration: 0.8 })} className={botonMapa}>
              ⌂ Centro de Formosa
            </button>
            <button
              onClick={alternarModoCoordenadas}
              className={`${botonMapa} ${modoCoordenadas ? "border-rojo! text-rojo" : ""}`}
            >
              {modoCoordenadas ? "✕ Salir de coordenadas" : "📌 Copiar coordenadas"}
            </button>
          </div>

          {/* Ayuda y resultado del modo "Copiar coordenadas" */}
          {modoCoordenadas && (
            <div className="absolute bottom-3 left-3 z-1000 max-w-xs rounded-md border border-rojo bg-gris-oscuro/95 p-3 text-xs shadow-lg backdrop-blur">
              {puntoElegido ? (
                <>
                  <p className="font-mono text-sm font-bold">
                    {puntoElegido[0].toFixed(6)}, {puntoElegido[1].toFixed(6)}
                  </p>
                  <p className={`mt-1 ${copiado ? "text-verde" : "text-gris-azulado"}`}>
                    {copiado
                      ? "Copiadas. Pegalas en ubicaciones.js (lat y lng)."
                      : "No pude copiarlas solo: seleccioná el texto y copialo."}
                  </p>
                </>
              ) : (
                <p className="text-gris-azulado">Hacé clic en el lugar exacto del comercio y te copio sus coordenadas.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}