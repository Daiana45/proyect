import { useRef, useState } from "react";
import { Link } from "react-router";
import { MapContainer, TileLayer, Marker, Tooltip, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { ubicaciones } from "../data/ubicaciones";
import { datosTienda } from "../data/tiendas";
import { CENTRO_FORMOSA, LIMITES_FORMOSA, dentroDeFormosa } from "../utils/geo";
import { ahoraMs } from "../utils/ahora";

// Herramienta para vos (solo en desarrollo): ubicás cada comercio en su lugar real del mapa de Formosa.
// Al terminar copiás el archivo ubicaciones.js ya armado y reemplazás el de src/data.

const COLORES_TIPO = {
  Pyme: "#22c58b",
  Cadena: "#3b82f6",
  Mayorista: "#a78bfa",
  Kiosco: "#f59e0b",
  Feria: "#f2384f",
};

const TILES = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
// Acá se guarda lo que vas ubicando, para no perderlo si recargás la página
const CLAVE = "spotmarket_editor_ubicaciones";
const NOMBRES = Object.keys(ubicaciones);

// Coordenadas pegadas desde Google Maps, por ejemplo: -26.196550, -58.201234
const COORDENADAS = /^\s*(-?\d{1,2}\.\d+)\s*[,;]?\s*(-?\d{1,3}\.\d+)\s*$/;

const ESTILOS = `.ed-pin-wrap { background: none; border: none; }`;

// Los iconos se guardan en una memoria para no volver a crearlos en cada vuelta (así los pines no parpadean)
const cacheIconos = new Map();
const icono = (color, estado) => {
  const clave = `${color}-${estado}`;
  if (!cacheIconos.has(clave)) {
    const activo = estado === "activo";
    cacheIconos.set(
      clave,
      L.divIcon({
        className: "ed-pin-wrap",
        html: `<svg width="30" height="49" viewBox="0 0 25 41" style="display:block;opacity:${estado === "pendiente" ? 0.6 : 1};transform:scale(${activo ? 1.25 : 1});transform-origin:50% 100%;filter:drop-shadow(0 2px 2px rgba(0,0,0,.4))" aria-hidden="true">
          <path d="M12.5 0.75C5.9 0.75 0.75 5.9 0.75 12.5c0 9 11.75 27.5 11.75 27.5S24.25 21.5 24.25 12.5C24.25 5.9 19.1 0.75 12.5 0.75z" fill="${color}" stroke="${activo ? "#ffc72c" : "#ffffff"}" stroke-width="${activo ? 2.5 : 1.5}"/>
          <circle cx="12.5" cy="12.5" r="4.8" fill="#ffffff"/>
        </svg>`,
        iconSize: [30, 49],
        iconAnchor: [15, 48],
      })
    );
  }
  return cacheIconos.get(clave);
};

// OpenStreetMap pide no hacer más de una consulta por segundo
let ultimaConsulta = 0;
const esperarTurno = async () => {
  const falta = ultimaConsulta + 1100 - ahoraMs();
  if (falta > 0) await new Promise((resolver) => setTimeout(resolver, falta));
  ultimaConsulta = ahoraMs();
};

// Arma "Calle 123, Barrio" con lo que devuelve OpenStreetMap
const componerDireccion = (dato) => {
  const a = dato.address ?? {};
  const calle = a.road ? `${a.road}${a.house_number ? ` ${a.house_number}` : ""}` : "";
  const barrio = a.suburb ?? a.neighbourhood ?? a.quarter ?? a.city_district ?? "";
  return [calle, barrio].filter(Boolean).join(", ") || (dato.display_name ?? "").split(",").slice(0, 2).join(",").trim();
};

// Pregunta qué calle hay en un punto del mapa
const direccionDe = async (lat, lng) => {
  await esperarTurno();
  const respuesta = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=18&addressdetails=1&accept-language=es&lat=${lat}&lon=${lng}`
  );
  if (!respuesta.ok) throw new Error("sin respuesta");
  return componerDireccion(await respuesta.json());
};

// Guarda todo en el navegador (si se puede) y devuelve lo mismo que recibió
const guardar = (siguiente) => {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(siguiente));
  } catch {
    // Si el navegador no deja guardar, dura hasta que recargues
  }
  return siguiente;
};

// Punto de partida: lo que guardé antes o, si no hay nada, lo de ubicaciones.js
// "manual" es true cuando escribiste la dirección a mano: esa no se sobreescribe al mover el pin.
const inicial = () => {
  let guardado = {};
  try {
    guardado = JSON.parse(localStorage.getItem(CLAVE)) ?? {};
  } catch {
    // Si no se puede leer, arranco de cero
  }
  return Object.fromEntries(
    NOMBRES.map((n) => [
      n,
      guardado[n] ?? { lat: ubicaciones[n].lat, lng: ubicaciones[n].lng, direccion: ubicaciones[n].direccion ?? "", listo: false, manual: false },
    ])
  );
};

// Escucha los clics del mapa
function CapturaClics({ alClic }) {
  useMapEvents({
    click(e) {
      alClic(e.latlng);
    },
  });
  return null;
}

export default function PaginaEditorUbicaciones() {
  const [mapa, setMapa] = useState(null);
  const [pos, setPos] = useState(inicial);
  const [seleccionado, setSeleccionado] = useState(null);
  const [aviso, setAviso] = useState("");
  const [buscandoDireccion, setBuscandoDireccion] = useState(null);
  const [consulta, setConsulta] = useState("");
  const [resultados, setResultados] = useState([]);
  const [buscandoLugar, setBuscandoLugar] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [reiniciando, setReiniciando] = useState(false);
  // Cuenta los pedidos de dirección de cada comercio: si llega una respuesta vieja, la descarto
  const pedidos = useRef({});

  // Cambia datos de un comercio y lo guarda
  const cambiar = (nombre, cambios) => {
    setPos((anterior) => guardar({ ...anterior, [nombre]: { ...anterior[nombre], ...cambios } }));
  };

  // Completa la dirección que averiguó OpenStreetMap, salvo que la hayas escrito vos a mano
  const completarDireccion = (nombre, direccion) => {
    setPos((anterior) => (anterior[nombre].manual ? anterior : guardar({ ...anterior, [nombre]: { ...anterior[nombre], direccion } })));
  };

  // Pone un comercio en un punto. Si no sé su dirección, la pido a OpenStreetMap.
  const colocar = async (nombre, punto, direccionConocida) => {
    const lat = Number(punto.lat.toFixed(6));
    const lng = Number(punto.lng.toFixed(6));
    if (direccionConocida !== undefined) {
      cambiar(nombre, { lat, lng, listo: true, direccion: direccionConocida, manual: false });
      return;
    }
    cambiar(nombre, { lat, lng, listo: true });

    const id = (pedidos.current[nombre] = (pedidos.current[nombre] ?? 0) + 1);
    setBuscandoDireccion(nombre);
    setAviso("");
    try {
      const direccion = await direccionDe(lat, lng);
      if (id === pedidos.current[nombre]) completarDireccion(nombre, direccion);
    } catch {
      setAviso("No pude averiguar la dirección (¿sin internet?). Podés escribirla a mano.");
    } finally {
      setBuscandoDireccion((actual) => (actual === nombre ? null : actual));
    }
  };

  const elegir = (nombre) => {
    setSeleccionado(nombre);
    setAviso("");
    mapa?.flyTo([pos[nombre].lat, pos[nombre].lng], 17, { duration: 0.6 });
  };

  const alClicMapa = (punto) => {
    if (!seleccionado) {
      setAviso("Primero elegí un comercio de la lista y después hacé clic en el mapa.");
      return;
    }
    colocar(seleccionado, punto);
  };

  // Busca una dirección o un lugar de Formosa por su nombre, o va a unas coordenadas pegadas
  const buscar = async (e) => {
    e.preventDefault();
    if (!consulta.trim()) return;
    setAviso("");

    // Si lo que escribió son coordenadas (por ejemplo copiadas de Google Maps), voy directo a ese punto
    const coordenadas = consulta.match(COORDENADAS);
    if (coordenadas) {
      const punto = { lat: Number(coordenadas[1]), lng: Number(coordenadas[2]) };
      setResultados([]);
      if (!dentroDeFormosa([punto.lat, punto.lng])) {
        setAviso("Esas coordenadas quedan fuera de Formosa Capital. Revisá que primero vaya la latitud (-26...) y después la longitud (-58...).");
        return;
      }
      if (!seleccionado) {
        setAviso("Primero elegí un comercio de la lista y después pegá las coordenadas.");
        return;
      }
      colocar(seleccionado, punto);
      mapa?.flyTo([punto.lat, punto.lng], 18, { duration: 0.6 });
      return;
    }

    setBuscandoLugar(true);
    try {
      await esperarTurno();
      const [[sur, oeste], [norte, este]] = LIMITES_FORMOSA;
      const respuesta = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=6&countrycodes=ar&accept-language=es&viewbox=${oeste},${norte},${este},${sur}&bounded=1&q=${encodeURIComponent(`${consulta}, Formosa`)}`
      );
      if (!respuesta.ok) throw new Error("sin respuesta");
      const datos = await respuesta.json();
      setResultados(datos);
      if (datos.length === 0) setAviso("No encontré ese lugar en Formosa Capital. Probá con otra calle o escribilo de otra forma.");
    } catch {
      setAviso("No pude buscar (¿sin internet?).");
    } finally {
      setBuscandoLugar(false);
    }
  };

  const usarResultado = (resultado) => {
    if (!seleccionado) {
      setAviso("Primero elegí un comercio de la lista y después tocá el resultado.");
      return;
    }
    const punto = { lat: Number(resultado.lat), lng: Number(resultado.lon) };
    colocar(seleccionado, punto, componerDireccion(resultado));
    mapa?.flyTo([punto.lat, punto.lng], 18, { duration: 0.6 });
  };

  const ubicados = NOMBRES.filter((n) => pos[n].listo).length;

  // El archivo ubicaciones.js ya armado, para copiar y pegar
  const textoArchivo = [
    "// Ubicación de cada comercio en Formosa Capital (latitud, longitud y dirección).",
    "// Generado con la página /editor-ubicaciones: cada punto se colocó a mano sobre el mapa.",
    "export const ubicaciones = {",
    ...NOMBRES.map((n) => {
      const p = pos[n];
      const direccion = p.direccion.trim();
      return `  ${JSON.stringify(n)}: { lat: ${p.lat}, lng: ${p.lng}${direccion ? `, direccion: ${JSON.stringify(direccion)}` : ""} },`;
    }),
    "};",
    "",
  ].join("\n");

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(textoArchivo);
      setCopiado(true);
    } catch {
      setCopiado(false);
      setAviso("No pude copiar solo: abrí 'Ver el archivo', seleccioná todo y copialo.");
    }
  };

  const reiniciar = () => {
    try {
      localStorage.removeItem(CLAVE);
    } catch {
      // Sin almacenamiento no hay nada que borrar
    }
    setPos(inicial());
    setSeleccionado(null);
    setReiniciando(false);
    setResultados([]);
  };

  const campo = "w-full rounded-md border border-borde bg-transparent px-3 py-2 text-xs outline-none focus:border-amarillo";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <style>{ESTILOS}</style>

      <p className="text-xs text-gris-azulado">
        <Link to="/mapa" className="hover:underline">Mapa</Link> › <span className="text-blanco">Editor de ubicaciones</span>
      </p>
      <h1 className="mt-2 font-titulo text-2xl font-bold md:text-3xl">Editor de ubicaciones</h1>
      <p className="mt-1 max-w-3xl text-xs text-gris-azulado">
        Herramienta solo para desarrollo. Elegí un comercio de la lista y, o hacés clic en el mapa donde está, o arrastrás su pin, o buscás su dirección,
        o pegás las coordenadas de Google Maps. Cuando termines, copiá el archivo y pegalo en <span className="font-mono">src/data/ubicaciones.js</span>.
      </p>

      <div className="mt-4 grid gap-4 lg:h-[calc(100vh-13rem)] lg:min-h-140 lg:grid-cols-[400px_minmax(0,1fr)]">
        {/* ---------- PANEL ---------- */}
        <aside className="flex max-h-120 min-h-0 flex-col rounded-md border border-borde bg-gris-oscuro lg:max-h-none">
          <div className="border-b border-borde p-4">
            {/* Buscar una dirección, un lugar o unas coordenadas */}
            <form onSubmit={buscar} className="flex gap-2">
              <input
                value={consulta}
                onChange={(e) => setConsulta(e.target.value)}
                placeholder="Dirección o coordenadas (ej: -26.1965, -58.2012)"
                className={campo}
              />
              <button
                type="submit"
                disabled={buscandoLugar}
                className="shrink-0 cursor-pointer rounded-md fondo-dorado px-3 text-xs font-semibold text-negro disabled:cursor-wait disabled:opacity-60"
              >
                {buscandoLugar ? "..." : "Buscar"}
              </button>
            </form>

            {resultados.length > 0 && (
              <div className="mt-2 flex max-h-40 flex-col gap-1 overflow-y-auto">
                {resultados.map((r) => (
                  <button
                    key={r.place_id}
                    onClick={() => usarResultado(r)}
                    className="cursor-pointer rounded-sm border border-borde px-2 py-1.5 text-left text-[11px] transition hover:border-amarillo"
                  >
                    {r.display_name}
                  </button>
                ))}
              </div>
            )}

            {aviso && <p className="mt-2 text-[11px] text-naranja">{aviso}</p>}
          </div>

          {/* Progreso y archivo */}
          <div className="border-b border-borde p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold">
                {ubicados} de {NOMBRES.length} ubicados
              </span>
              <span className="text-gris-azulado">Los "provisorios" siguen con coordenadas de ejemplo</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-borde">
              <div className="h-full rounded-full fondo-dorado transition-all" style={{ width: `${(ubicados / NOMBRES.length) * 100}%` }} />
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
              <button onClick={copiar} className="cursor-pointer rounded-md fondo-dorado px-3 py-2 text-negro transition hover:brightness-110">
                Copiar ubicaciones.js
              </button>
              {copiado && <span className="text-verde">✓ Copiado</span>}
              {reiniciando ? (
                <span className="flex items-center gap-2">
                  <span className="text-rojo">¿Borrar todo?</span>
                  <button onClick={reiniciar} className="cursor-pointer rounded-md bg-rojo px-2 py-1.5 text-blanco">Sí</button>
                  <button onClick={() => setReiniciando(false)} className="cursor-pointer rounded-md border border-borde px-2 py-1.5">No</button>
                </span>
              ) : (
                <button onClick={() => setReiniciando(true)} className="cursor-pointer rounded-md border border-borde px-3 py-2 text-gris-azulado transition hover:border-rojo hover:text-rojo">
                  Empezar de cero
                </button>
              )}
            </div>

            <details className="mt-3">
              <summary className="cursor-pointer text-[11px] text-azul">Ver el archivo</summary>
              <textarea readOnly value={textoArchivo} rows={8} className={`${campo} mt-2 font-mono text-[10px]`} />
            </details>
          </div>

          {/* Lista de comercios */}
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <div className="flex flex-col gap-2">
              {NOMBRES.map((nombre) => {
                const p = pos[nombre];
                const tienda = datosTienda(nombre);
                const activo = nombre === seleccionado;
                return (
                  <div key={nombre} className={`rounded-md border p-3 ${activo ? "border-amarillo bg-amarillo/5" : "border-borde"}`}>
                    <button onClick={() => elegir(nombre)} className="flex w-full cursor-pointer items-center gap-2 text-left">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: COLORES_TIPO[tienda.tipo] ?? "#3b82f6" }} />
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold">{nombre}</span>
                      <span className={`shrink-0 text-[11px] font-semibold ${p.listo ? "text-verde" : "text-naranja"}`}>
                        {p.listo ? "✓ Ubicado" : "Provisorio"}
                      </span>
                    </button>

                    {activo && (
                      <div className="mt-3">
                        <p className="text-[11px] text-gris-azulado">Hacé clic en el mapa donde está el comercio, arrastrá su pin o pegá coordenadas arriba.</p>
                        <p className="mt-1 font-mono text-[11px]">
                          {p.lat}, {p.lng}
                        </p>

                        {/* Para comparar el mismo punto exacto en otros mapas */}
                        <p className="mt-1 flex flex-wrap gap-x-3 text-[11px]">
                          <a
                            href={`https://www.google.com/maps?q=${p.lat},${p.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-azul hover:underline"
                          >
                            Ver este punto en Google Maps
                          </a>
                          <a
                            href={`https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lng}#map=18/${p.lat}/${p.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-azul hover:underline"
                          >
                            en OpenStreetMap
                          </a>
                        </p>

                        <label className="mt-2 block text-[11px] text-gris-azulado">
                          Dirección{" "}
                          {buscandoDireccion === nombre && <span className="text-amarillo">(buscando...)</span>}
                          {p.manual && <span className="text-verde">(escrita a mano: no se cambia sola)</span>}
                          <input
                            value={p.direccion}
                            onChange={(e) => cambiar(nombre, { direccion: e.target.value, manual: e.target.value.trim() !== "" })}
                            placeholder="Se completa sola con la calle de OpenStreetMap. Podés escribirla como quieras."
                            className={`${campo} mt-1`}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* ---------- MAPA ---------- */}
        <div className="relative isolate h-[70vh] overflow-hidden rounded-md border border-borde lg:h-full">
          <MapContainer
            ref={setMapa}
            center={CENTRO_FORMOSA}
            zoom={14}
            minZoom={12}
            maxZoom={19}
            maxBounds={LIMITES_FORMOSA}
            maxBoundsViscosity={1}
            className="h-full w-full"
          >
            <TileLayer url={TILES} maxZoom={19} attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' />
            <CapturaClics alClic={alClicMapa} />

            {NOMBRES.map((nombre) => {
              const p = pos[nombre];
              const color = COLORES_TIPO[datosTienda(nombre).tipo] ?? "#3b82f6";
              const estado = nombre === seleccionado ? "activo" : p.listo ? "listo" : "pendiente";
              return (
                <Marker
                  key={nombre}
                  position={[p.lat, p.lng]}
                  icon={icono(color, estado)}
                  draggable
                  zIndexOffset={estado === "activo" ? 1000 : 0}
                  eventHandlers={{
                    click: () => elegir(nombre),
                    dragend: (e) => {
                      const { lat, lng } = e.target.getLatLng();
                      setSeleccionado(nombre);
                      colocar(nombre, { lat, lng });
                    },
                  }}
                >
                  <Tooltip key={estado === "activo" ? "fijo" : "normal"} direction="top" offset={[0, -42]} permanent={estado === "activo"}>
                    {nombre}
                  </Tooltip>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>
    </div>
  );
}