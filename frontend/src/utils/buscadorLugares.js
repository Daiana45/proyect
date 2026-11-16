import L from "leaflet";
import { CENTRO_FORMOSA, LIMITES_FORMOSA, dentroDeFormosa } from "./geo";

// Quita de en medio los nombres de "recinto" cuando el usuario no los pidió.
// Ejemplo: buscó "terminal de omnibus" y OSM dice "Plaza Terminal de Omnibus"
// -> mostramos "Terminal de Omnibus". Pero si buscó "plaza san martin",
// conservamos "Plaza San Martín" porque ahí sí quiso ese tipo de lugar.
const sinAcentos = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const PREFIJOS_RECINTO = [
  "plaza", "parque", "estacion", "terminal", "avenida", "pasaje",
];

function limpiarNombre(nombre, busqueda) {
  const limpio = nombre.trim();
  const partes = limpio.split(" ");
  if (partes.length < 2) return limpio;

  const primera = sinAcentos(partes[0]);
  const resto = partes.slice(1).join(" ");
  const busquedaLimpia = sinAcentos(busqueda);

  // Si el usuario buscó ese tipo de recinto, lo dejamos tal cual
  if (busquedaLimpia.includes(primera)) return limpio;

  // Si el prefijo es un recinto y el resto coincide con la búsqueda, lo sacamos
  if (PREFIJOS_RECINTO.includes(primera)) {
    const restoLimpio = sinAcentos(resto);
    if (restoLimpio.includes(busquedaLimpia) || busquedaLimpia.includes(restoLimpio)) {
      return resto;
    }
  }

  return limpio;
}

// =====================================================================
// MOTOR 1: ESRI para direcciones exactas (Calle + Número)
// =====================================================================
async function buscarDireccionConEsri(texto, senal) {
  const direccionCompleta = `${texto}, Formosa, Argentina`;
  const url =
    `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates` +
    `?SingleLine=${encodeURIComponent(direccionCompleta)}` +
    `&maxLocations=3&outFields=Addr_type,Match_addr,Score&f=json`;

  const respuesta = await fetch(url, { signal: senal });
  if (!respuesta.ok) return null;
  const datos = await respuesta.json();
  if (!datos.candidates || datos.candidates.length === 0) return null;

  const tiposPrecisos = ["PointAddress", "StreetAddress", "Building"];
  const candidato = datos.candidates.find((c) =>
    tiposPrecisos.includes(c.attributes.Addr_type) && (c.attributes.Score || 0) >= 70
  );
  if (!candidato) return null;

  const { x: lng, y: lat } = candidato.location;
  const centro = [lat, lng];
  if (!dentroDeFormosa(centro)) return null;

  return {
    id: `esri-${candidato.address}`,
    nombre: candidato.address.replace(", Formosa, Argentina", ""),
    detalle: "Dirección exacta",
    centro,
    osm: null,
    geojson: null,
    fuente: "esri",
    esExacto: true,
  };
}

// =====================================================================
// MOTOR 2: OPENSTREETMAP (Photon) para LUGARES
// =====================================================================
async function buscarLugarConOSM(texto, senal) {
  const limites = L.latLngBounds(LIMITES_FORMOSA);
  const caja = `${limites.getWest()},${limites.getSouth()},${limites.getEast()},${limites.getNorth()}`;
  const url =
    `https://photon.komoot.io/api/?q=${encodeURIComponent(texto)}&limit=10&bbox=${caja}` +
    `&lat=${CENTRO_FORMOSA[0]}&lon=${CENTRO_FORMOSA[1]}&zoom=13`;

  const respuesta = await fetch(url, { signal: senal });
  if (!respuesta.ok) return [];
  const datos = await respuesta.json();

  const tiposLugar = ["amenity", "tourism", "leisure", "historic"];
  const valoresLugar = [
    "hospital", "clinic", "pharmacy", "bus_station", "school", "university",
    "place_of_worship", "police", "fire_station", "bank", "post_office",
    "park", "garden", "playground", "sports_centre", "stadium",
    "artwork", "monument", "memorial", "museum", "library", "theatre",
    "hotel", "hostel", "restaurant", "cafe", "fast_food",
  ];

  return datos.features
    .map((f) => {
      const p = f.properties;
      const [lng, lat] = f.geometry.coordinates;
      return {
        id: `${p.osm_type}${p.osm_id}`,
        nombre: limpiarNombre(p.name || "Lugar sin nombre", texto),
        detalle: [p.district || p.locality, "Formosa"].filter(Boolean).join(" · "),
        centro: [lat, lng],
        osm: p.osm_type && p.osm_id ? `${p.osm_type}${p.osm_id}` : null,
        geojson: null,
        fuente: "osm",
        esExacto: false,
        osmKey: p.osm_key,
        osmValue: p.osm_value,
      };
    })
    .filter((l) => l.nombre !== "Lugar sin nombre")
    .filter((l) => tiposLugar.includes(l.osmKey) || valoresLugar.includes(l.osmValue))
    .filter((l) => dentroDeFormosa(l.centro));
}

// =====================================================================
// FUNCIÓN PRINCIPAL
// =====================================================================
export async function buscarDireccionExacta(texto, senal) {
  const limpio = texto.trim();
  if (limpio.length < 3) return null;

  const tieneNumero = /\d/.test(limpio);

  if (tieneNumero) {
    try {
      const dir = await buscarDireccionConEsri(limpio, senal);
      if (dir) return dir;
    } catch (error) {
      if (error.name === "AbortError") throw error;
    }
  }

  try {
    const lugares = await buscarLugarConOSM(limpio, senal);
    if (lugares.length > 0) return lugares[0];
  } catch (error) {
    if (error.name === "AbortError") throw error;
  }

  if (!tieneNumero) {
    try {
      const dir = await buscarDireccionConEsri(limpio, senal);
      if (dir) return dir;
    } catch (error) {
      if (error.name === "AbortError") throw error;
    }
  }

  return null;
}

// =====================================================================
// FUNCIONES AUXILIARES
// =====================================================================
export const esArea = (geo) => geo && (geo.type === "Polygon" || geo.type === "MultiPolygon");

export const lineasDe = (geo) => {
  if (geo?.type === "LineString") return [geo.coordinates];
  if (geo?.type === "MultiLineString") return geo.coordinates;
  return null;
};

export async function trazadoDe(lugar) {
  if (!lugar) return null;
  if (!lugar.osm) return null;
  try {
    const respuesta = await fetch(
      `https://nominatim.openstreetmap.org/lookup?osm_ids=${lugar.osm}&format=jsonv2&polygon_geojson=1`
    );
    if (!respuesta.ok) return null;
    const [resultado] = await respuesta.json();
    const geo = resultado?.geojson;
    return esArea(geo) || lineasDe(geo) ? geo : null;
  } catch {
    return null;
  }
}

export async function nombreDeUbicacion(punto) {
  try {
    const url = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/reverseGeocode?location=${punto[1]},${punto[0]}&f=json`;
    const respuesta = await fetch(url);
    const datos = await respuesta.json();
    const a = datos.address ?? {};
    const partes = [a.AddrStr, a.Neighborhood, a.City].filter(Boolean);
    return partes.join(" · ") || "Punto marcado en el mapa";
  } catch {
    return "Punto marcado en el mapa";
  }
}