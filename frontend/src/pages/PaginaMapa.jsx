import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, GeoJSON, ZoomControl, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { productosCatalogo } from "../data/catalogo";
import { datosTienda } from "../data/tiendas";
import { comercios } from "../data/comercios";
import { ubicaciones } from "../data/ubicaciones";
import { aSlug } from "../utils/slug";
import { CENTRO_FORMOSA, LIMITES_FORMOSA, distanciaKm, formatoDistancia, dentroDeFormosa } from "../utils/geo";
import { esArea, lineasDe, buscarDireccionExacta, nombreDeUbicacion } from "../utils/buscadorLugares";
import useAuth from "../componentes/hooks/useAuth";
import useAccionPrivada from "../componentes/hooks/useAccionPrivada";

const ahoraMs = () => Date.now();

const COLORES_TIPO = {
  Pyme: "#22c58b",
  Cadena: "#3b82f6",
  Mayorista: "#a78bfa",
  Kiosco: "#f59e0b",
  Feria: "#f2384f",
};
const TIPOS = ["Todos", "Pyme", "Cadena", "Mayorista", "Kiosco", "Feria"];

const TILES = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}";
const TILES_SATELITE = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const TILES_CALLES = "https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}";

const RADIOS_ZONA = [100, 200, 300, 500, 1000, 2000];

const MODOS = {
  foot: { texto: "A pie", icono: "🚶", servicio: "routed-foot", kmh: 5 },
  bike: { texto: "En bici", icono: "🚲", servicio: "routed-bike", kmh: 15 },
  car: { texto: "En auto", icono: "🚗", servicio: "routed-car", kmh: 30 },
};

const urlRuta = (servicio, origen, destino) =>
  `https://routing.openstreetmap.de/${servicio}/route/v1/driving/${origen[1]},${origen[0]};${destino[1]},${destino[0]}?overview=full&geometries=geojson`;

const formatoTiempo = (min) => {
  if (min < 60) return `${min} min`;
  const resto = min % 60;
  return `${Math.floor(min / 60)} h${resto ? ` ${resto} min` : ""}`;
};

const dentroDeAnillo = (punto, anillo) => {
  let dentro = false;
  for (let i = 0, j = anillo.length - 1; i < anillo.length; j = i++) {
    const [xi, yi] = anillo[i];
    const [xj, yj] = anillo[j];
    if (yi > punto[1] !== yj > punto[1] && punto[0] < ((xj - xi) * (punto[1] - yi)) / (yj - yi) + xi) {
      dentro = !dentro;
    }
  }
  return dentro;
};

const dentroDeContorno = (lat, lng, geo) => {
  if (geo.type === "Polygon") return dentroDeAnillo([lng, lat], geo.coordinates[0]);
  return geo.coordinates.some((poligono) => dentroDeAnillo([lng, lat], poligono[0]));
};

const distanciaALineasM = (lat, lng, lineas) => {
  const kx = 111320 * Math.cos((lat * Math.PI) / 180);
  const ky = 110540;
  let mejor = Infinity;
  for (const linea of lineas) {
    for (let i = 0; i < linea.length - 1; i++) {
      const ax = (linea[i][0] - lng) * kx;
      const ay = (linea[i][1] - lat) * ky;
      const bx = (linea[i + 1][0] - lng) * kx;
      const by = (linea[i + 1][1] - lat) * ky;
      const dx = bx - ax;
      const dy = by - ay;
      const largo = dx * dx + dy * dy;
      const t = largo === 0 ? 0 : Math.max(0, Math.min(1, -(ax * dx + ay * dy) / largo));
      const d = Math.hypot(ax + t * dx, ay + t * dy);
      if (d < mejor) mejor = d;
    }
  }
  return mejor;
};

const lugares = Object.entries(ubicaciones).map(([nombre, ubicacion]) => {
  const propios = productosCatalogo.filter((p) => p.tienda.nombre === nombre);
  return {
    nombre,
    ...ubicacion,
    ...datosTienda(nombre),
    direccion: comercios.find((c) => c.nombre === nombre)?.direccion,
    productos: propios.length,
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

const ESTILOS = `
.pin-wrap, .usuario-wrap, .cruz-wrap, .lugar-wrap { background: none; border: none; }
.pin-svg { display: block; filter: drop-shadow(0 3px 3px rgba(0,0,0,.45)); transform-origin: 50% 100%; transition: transform .15s ease; }
.pin-activo { transform: scale(1.25); }
.usuario { width: 18px; height: 18px; border-radius: 50%; background: #3b82f6; border: 3px solid #fff; animation: pulso 1.8s infinite; }
@keyframes pulso { 0% { box-shadow: 0 0 0 0 rgba(59,130,246,.7); } 70% { box-shadow: 0 0 0 16px rgba(59,130,246,0); } 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); } }
.lugar { width: 16px; height: 16px; border-radius: 50%; background: #ffc72c; border: 3px solid #050b1a; box-shadow: 0 0 0 2px #ffc72c; }
.cruz { width: 22px; height: 22px; border: 2px solid #f2384f; border-radius: 50%; position: relative; background: rgba(242,56,79,.2); }
.cruz::before, .cruz::after { content: ""; position: absolute; background: #f2384f; }
.cruz::before { left: 50%; top: -6px; bottom: -6px; width: 2px; margin-left: -1px; }
.cruz::after { top: 50%; left: -6px; right: -6px; height: 2px; margin-top: -1px; }
.leaflet-tile { outline: 1px solid transparent; }
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

const iconoLugar = L.divIcon({
  className: "lugar-wrap",
  html: '<div class="lugar"></div>',
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

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

function CapturaClics({ alClic }) {
  useMapEvents({
    click(e) {
      alClic([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function PaginaMapa() {
  const [parametros] = useSearchParams();
  const tiendaParam = parametros.get("tienda");
  const claro = useTemaClaro();

  const { estaLogueado } = useAuth();
  const protegida = useAccionPrivada();
  const paginaActual = useLocation();

  const [mapa, setMapa] = useState(null);
  const marcadores = useRef({});
  const [satelite, setSatelite] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [tipo, setTipo] = useState("Todos");
  const [soloAbiertos, setSoloAbiertos] = useState(false);
  const [radio, setRadio] = useState(0);
  const [seleccionado, setSeleccionado] = useState(tiendaParam);

  const [ubicacion, setUbicacion] = useState(null);
  const [precision, setPrecision] = useState(0);
  const [estadoGPS, setEstadoGPS] = useState("idle");

  const [modoCoordenadas, setModoCoordenadas] = useState(false);
  const [puntoElegido, setPuntoElegido] = useState(null);
  const [copiado, setCopiado] = useState(false);

  // Buscador de direcciones exactas (sin sugerencias)
  const [textoLugar, setTextoLugar] = useState("");
  const [avisoLugar, setAvisoLugar] = useState("");
  const [zona, setZona] = useState(null);
  const [radioZona, setRadioZona] = useState(300);
  const [marcando, setMarcando] = useState(false);
  const peticionLugar = useRef(0);

  const [ruta, setRuta] = useState(null);
  const peticion = useRef(0);

  useEffect(() => {
    if (!mapa || !tiendaParam) return;
    const lugar = lugares.find((l) => l.nombre === tiendaParam);
    if (!lugar) return;
    mapa.setView([lugar.lat, lugar.lng], 17);
    const espera = setTimeout(() => marcadores.current[lugar.nombre]?.openPopup(), 300);
    return () => clearTimeout(espera);
  }, [mapa, tiendaParam]);

 const buscarYIr = async (e) => {
  e.preventDefault();
  const texto = textoLugar.trim();
  if (!texto) return;

  setAvisoLugar("Buscando...");
  const control = new AbortController();
  const resultado = await buscarDireccionExacta(texto, control.signal);

  if (resultado) {
    setZona(resultado);
    setAvisoLugar("");
    mapa?.flyTo(resultado.centro, 16, { duration: 0.8 });
  } else {
    setAvisoLugar("No encontramos ese lugar. Probá con otro nombre o usá 'Marcar un punto en el mapa'.");
  }
};

  const fueraDeFormosa = ubicacion ? !dentroDeFormosa(ubicacion) : false;
  const usandoGPS = estaLogueado && ubicacion !== null && !fueraDeFormosa;
  const referencia = usandoGPS ? ubicacion : CENTRO_FORMOSA;

  const consulta = busqueda.trim().toLowerCase();

  const lineas = zona ? lineasDe(zona.geojson) : null;
  const zonaTipo = !zona ? null : esArea(zona.geojson) ? "area" : lineas ? "linea" : "punto";

  const visibles = lugares
    .map((l) => {
      const metrosZona = !zona
        ? 0
        : zonaTipo === "linea"
          ? distanciaALineasM(l.lat, l.lng, lineas)
          : distanciaKm(zona.centro, [l.lat, l.lng]) * 1000;
      return {
        ...l,
        km: distanciaKm(referencia, [l.lat, l.lng]),
        kmZona: metrosZona / 1000,
        conLo: consulta ? l.listaProductos.find((n) => n.toLowerCase().includes(consulta)) : undefined,
      };
    })
    .filter(
      (l) =>
        (!consulta ||
          `${l.nombre} ${l.rubro} ${l.tipo} ${l.direccion ?? ""}`.toLowerCase().includes(consulta) ||
          l.conLo) &&
        (tipo === "Todos" || l.tipo === tipo) &&
        (!soloAbiertos || l.abierto) &&
        (!zona || (zonaTipo === "area" ? dentroDeContorno(l.lat, l.lng, zona.geojson) : l.kmZona * 1000 <= radioZona)) &&
        (!estaLogueado || !radio || l.km <= radio)
    )
    .sort((a, b) => (zona ? a.kmZona - b.kmZona : estaLogueado ? a.km - b.km : a.nombre.localeCompare(b.nombre)));

  const claveVisibles = visibles.map((l) => l.nombre).join("|");
  useEffect(() => {
    if (!mapa || !consulta) return;
    const puntos = visibles.map((l) => [l.lat, l.lng]);
    if (puntos.length > 0) mapa.flyToBounds(puntos, { padding: [70, 70], maxZoom: 16, duration: 0.8 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claveVisibles, consulta, mapa]);

  const quitarZona = () => {
    peticionLugar.current++;
    setZona(null);
    setAvisoLugar("");
    setTextoLugar("");
    setMarcando(false);
    mapa?.flyTo(CENTRO_FORMOSA, 13, { duration: 0.8 });
  };

  const alternarMarcado = () => {
    setMarcando(!marcando);
    setModoCoordenadas(false);
    setPuntoElegido(null);
  };

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
      aproximado = true;
      const km = distanciaKm(origen, destino) * 1.3;
      rutas = Object.fromEntries(
        Object.entries(MODOS).map(([clave, modo]) => [
          clave,
          { km, min: Math.max(1, Math.round((km / modo.kmh) * 60)), puntos: [origen, destino] },
        ])
      );
    }

    if (id !== peticion.current) return;
    setRuta({ destino: lugar.nombre, desdeVos, modo: "foot", estado: aproximado ? "aproximado" : "ok", rutas, calculadoEn: ahoraMs() });
    mapa?.flyToBounds(rutas.foot.puntos, { padding: [90, 90], maxZoom: 17, duration: 0.8 });
  };

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

  const teclasBuscador = (e) => {
    if (e.key === "Enter" && visibles[0]) {
      e.preventDefault();
      seleccionar(visibles[0]);
    } else if (e.key === "Escape") {
      setBusqueda("");
    }
  };

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

  const manejarClic = (punto) => {
    if (marcando) {
      const id = ++peticionLugar.current;
      const nueva = { id: `punto-${punto[0]}-${punto[1]}`, nombre: "Punto marcado", centro: punto, geojson: null };
      setZona(nueva);
      setTextoLugar("");
      setAvisoLugar("");
      setMarcando(false);
      nombreDeUbicacion(punto).then((nombre) => {
        if (nombre && id === peticionLugar.current) setZona({ ...nueva, nombre });
      });
    } else if (modoCoordenadas) {
      elegirPunto(punto);
    }
  };

  const alternarModoCoordenadas = () => {
    setModoCoordenadas(!modoCoordenadas);
    setMarcando(false);
    setPuntoElegido(null);
    setCopiado(false);
  };

  const botonMapa =
    "cursor-pointer rounded-md border border-borde bg-gris-oscuro/95 px-3 py-2 text-xs font-semibold shadow-lg shadow-black/30 backdrop-blur transition hover:border-amarillo disabled:cursor-wait disabled:opacity-60";
  const kmAlCentro = ubicacion ? distanciaKm(ubicacion, CENTRO_FORMOSA) : 0;

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
      <h1 className="mt-2 font-titulo text-2xl font-normal tracking-tight md:text-3xl">
        Comercios cerca tuyo en <em className="italic text-amarillo">Formosa Capital</em>
      </h1>

      <div className="mt-4 grid gap-4 lg:h-[calc(100vh-12rem)] lg:min-h-140 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="flex max-h-104 min-h-0 flex-col rounded-md border border-borde bg-gris-oscuro lg:max-h-none">
          <div className="overflow-y-auto border-b border-borde p-4">
            <button
              onClick={() => protegida(() => localizar(), "usar tu ubicación")}
              disabled={estadoGPS === "buscando"}
              className="w-full cursor-pointer rounded-sm fondo-dorado px-4 py-2.5 text-xs font-semibold text-negro transition hover:brightness-110 disabled:cursor-wait disabled:opacity-70"
            >
              {estadoGPS === "buscando" ? "Buscando..." : estaLogueado ? "◎ Usar mi ubicación" : "🔒 Usar mi ubicación"}
            </button>

            {!estaLogueado && (
              <p className="mt-2 text-[11px] text-gris-azulado">
                <Link to="/login" state={{ desde: paginaActual, motivo: "ver los comercios más cercanos" }} className="text-azul hover:underline">
                  Iniciá sesión
                </Link>{" "}
                para usar tu ubicación, ordenar por cercanía y filtrar por distancia.
              </p>
            )}

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

            {/* Buscador de direcciones exactas (sin sugerencias) */}
            <form onSubmit={buscarYIr} className="mt-4">
              <label htmlFor="buscar-lugar" className="text-[11px] font-semibold text-gris-azulado">
                Ir a una dirección exacta
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  id="buscar-lugar"
                  value={textoLugar}
                  onChange={(e) => setTextoLugar(e.target.value)}
                  placeholder="Ej: Brandsen 3575"
                  autoComplete="off"
                  className="min-w-0 flex-1 rounded-md border border-borde bg-transparent px-3 py-2 text-xs outline-none focus:border-amarillo"
                />
                <button
                  type="submit"
                  className="shrink-0 cursor-pointer rounded-md border border-borde px-3 py-2 text-xs font-semibold transition hover:border-amarillo"
                >
                  Ir
                </button>
              </div>

              {avisoLugar && (
                <p className={`mt-2 text-[11px] ${avisoLugar === "Buscando..." ? "text-gris-azulado" : "text-naranja"}`}>
                  {avisoLugar}
                </p>
              )}
            </form>

            <button
              type="button"
              onClick={alternarMarcado}
              className={`mt-2 w-full cursor-pointer rounded-md border px-3 py-2 text-xs font-semibold transition ${
                marcando ? "border-amarillo bg-amarillo/10 text-amarillo" : "border-borde hover:border-amarillo"
              }`}
            >
              {marcando ? "Hacé clic en el mapa… (tocá para cancelar)" : "📍 Marcar un punto en el mapa"}
            </button>

            {zona && (
              <div className="mt-3 rounded-md border border-amarillo/50 bg-amarillo/5 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="min-w-0 text-xs">
                    <span className="font-semibold">{zona.nombre}</span>
                    <span className="block text-[11px] text-gris-azulado">
                      {visibles.length} {visibles.length === 1 ? "comercio" : "comercios"}{" "}
                      {zonaTipo === "area"
                        ? "dentro del barrio"
                        : zonaTipo === "linea"
                          ? `a menos de ${formatoDistancia(radioZona / 1000)} de la calle`
                          : `a menos de ${formatoDistancia(radioZona / 1000)}`}
                    </span>
                  </p>
                  <button
                    onClick={quitarZona}
                    aria-label="Quitar zona"
                    className="cursor-pointer px-1 text-xs text-gris-azulado hover:text-blanco"
                  >
                    ✕
                  </button>
                </div>
                {zonaTipo !== "area" && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {RADIOS_ZONA.map((m) => (
                      <button
                        key={m}
                        onClick={() => setRadioZona(m)}
                        className={`cursor-pointer rounded-full border px-2.5 py-0.5 text-[11px] font-semibold transition ${
                          radioZona === m ? "border-amarillo bg-amarillo text-negro" : "border-borde text-gris-azulado hover:border-blanco"
                        }`}
                      >
                        {formatoDistancia(m / 1000)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="relative mt-4">
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
            {zona ? `del más cerca de ${zona.nombre}` : estaLogueado ? "del más cercano al más lejano" : "ordenados por nombre"}
          </p>

          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            {visibles.length === 0 && (
              <p className="py-6 text-center text-xs text-gris-azulado">
                {zona && zonaTipo !== "area"
                  ? "No hay comercios tan cerca. Probá con un radio más grande."
                  : "No hay comercios con esos filtros."}
              </p>
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
                    {l.conLo && <span className="block truncate text-[10px] text-azul">Tiene: {l.conLo}</span>}
                  </span>
                  {zona ? (
                    <span className="shrink-0 text-right text-xs font-bold">{formatoDistancia(l.kmZona)}</span>
                  ) : (
                    estaLogueado && <span className="shrink-0 text-right text-xs font-bold">{formatoDistancia(l.km)}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div
          className={`relative h-[70vh] overflow-hidden rounded-md border border-borde lg:h-full ${
            modoCoordenadas || marcando ? "modo-coordenadas" : ""
          } ${claro || satelite ? "" : "mapa-oscuro"}`}
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
            {satelite ? (
              <>
                <TileLayer key="satelite" url={TILES_SATELITE} maxZoom={19} attribution="Imágenes &copy; Esri" />
                <TileLayer key="calles-satelite" url={TILES_CALLES} maxZoom={19} />
              </>
            ) : (
              <TileLayer key="calles" url={TILES} maxZoom={19} attribution="Tiles &copy; Esri" />
            )}
            <ZoomControl position="bottomright" />
            <CapturaClics alClic={manejarClic} />

            {zona && zonaTipo === "area" && (
              <GeoJSON
                key={zona.id}
                data={zona.geojson}
                style={{ color: "#ffc72c", weight: 2.5, dashArray: "6 6", fillColor: "#ffc72c", fillOpacity: 0.08 }}
              />
            )}
            {zona && zonaTipo === "linea" && (
              <GeoJSON key={zona.id} data={zona.geojson} style={{ color: "#ffc72c", weight: 6, opacity: 0.9 }} />
            )}
            {zona && zonaTipo !== "area" && zonaTipo !== "linea" && (
              <Circle
                center={zona.centro}
                radius={radioZona}
                pathOptions={{ color: "#ffc72c", weight: 2, dashArray: "6 6", fillOpacity: 0.07 }}
              />
            )}
            {zona && zonaTipo !== "linea" && (
              <Marker position={zona.centro} icon={iconoLugar} zIndexOffset={900}>
                <Popup closeButton={false}>
                  <div className="popup-comercio text-xs font-semibold">{zona.nombre}</div>
                </Popup>
              </Marker>
            )}

            {estaLogueado && radio > 0 && (
              <Circle
                center={referencia}
                radius={radio * 1000}
                pathOptions={{ color: "#3b82f6", weight: 1.5, dashArray: "6 6", fillOpacity: 0.05 }}
              />
            )}

            {rutaActual && (
              <>
                <Polyline positions={rutaActual.puntos} pathOptions={{ color: "#050b1a", weight: 9, opacity: 0.55 }} />
                <Polyline
                  positions={rutaActual.puntos}
                  pathOptions={{ color: "#ffc72c", weight: 5, opacity: 1, dashArray: ruta.estado === "aproximado" ? "8 8" : undefined }}
                />
              </>
            )}

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
                    <p className="font-titulo text-base font-medium leading-tight">{l.nombre}</p>
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

            {puntoElegido && <Marker position={puntoElegido} icon={iconoCruz} interactive={false} />}
          </MapContainer>

          {ruta && (
            <div className="absolute left-3 top-3 z-1000 w-72 max-w-[calc(100%-1.5rem)] rounded-md border border-borde bg-gris-oscuro/95 p-3 shadow-lg shadow-black/30 backdrop-blur">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-wide text-gris-azulado">Cómo llegar a</p>
                  <p className="truncate font-titulo text-base font-medium leading-tight">{ruta.destino}</p>
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
            <button onClick={() => setSatelite(!satelite)} aria-pressed={satelite} className={botonMapa}>
              {satelite ? "🗺 Ver mapa" : "🛰 Ver satélite"}
            </button>
            <button
              onClick={alternarModoCoordenadas}
              className={`${botonMapa} ${modoCoordenadas ? "border-rojo! text-rojo" : ""}`}
            >
              {modoCoordenadas ? "✕ Salir de coordenadas" : "📌 Copiar coordenadas"}
            </button>
          </div>

          {marcando && (
            <div className="absolute bottom-3 left-3 z-1000 max-w-xs rounded-md border border-amarillo bg-gris-oscuro/95 p-3 text-xs shadow-lg backdrop-blur">
              <p className="text-gris-azulado">Hacé clic en el mapa donde está tu casa o el lugar que querés. Te muestro los comercios alrededor.</p>
            </div>
          )}

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