// Los tipos de mapa que se pueden elegir. Todos son gratuitos y no piden clave.
// filtrarEnOscuro: en el tema oscuro, a los mapas de calles se les invierten los colores para que no encandilen;
// el satélite no, porque es una foto.
export const BASES = {
  calles: {
    nombre: "Calles",
    url: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    maxNativeZoom: 19,
    filtrarEnOscuro: true,
    atribucion: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  },
  esri: {
    nombre: "Calles Esri",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",
    maxNativeZoom: 18,
    filtrarEnOscuro: true,
    atribucion: "Tiles &copy; Esri &mdash; Esri, HERE, Garmin, USGS, &copy; OpenStreetMap contributors, and the GIS User Community",
  },
  satelite: {
    nombre: "Satélite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    maxNativeZoom: 18,
    filtrarEnOscuro: false,
    atribucion: "Tiles &copy; Esri &mdash; Esri, Maxar, Earthstar Geographics, and the GIS User Community",
  },
};

const CLAVE = "spotmarket_mapa_base";

// Lee cuál había elegido la persona (si no hay nada o es inválido, "calles")
export const baseGuardada = () => {
  try {
    const guardada = localStorage.getItem(CLAVE);
    return guardada in BASES ? guardada : "calles";
  } catch {
    return "calles";
  }
};

export const guardarBase = (clave) => {
  try {
    localStorage.setItem(CLAVE, clave);
  } catch {
    // Si el navegador no deja guardar, dura hasta que recargues
  }
};