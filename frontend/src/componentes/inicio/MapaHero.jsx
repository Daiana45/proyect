
import { useSyncExternalStore } from "react";
import { Link } from "react-router";
import { MapContainer, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { CENTRO_FORMOSA } from "../../utils/geo";

// Detecta si la página está en tema claro u oscuro.
const suscribirseAlTema = (avisar) => {
  const observador = new MutationObserver(avisar);

  observador.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  return () => observador.disconnect();
};

const leerTemaClaro = () =>
  document.documentElement.classList.contains("tema-claro");

const useTemaClaro = () =>
  useSyncExternalStore(
    suscribirseAlTema,
    leerTemaClaro,
    () => false
  );

// Mini mapa de Formosa Capital.
export default function MapaHero() {
  const claro = useTemaClaro();

  return (
    <div
      role="region"
      aria-label="Mapa de Formosa Capital"
      className="hero-mapa relative isolate h-64 w-full overflow-hidden rounded-lg border border-borde bg-gris-oscuro lg:h-80"
    >
     <MapContainer
  center={CENTRO_FORMOSA}
  zoom={14}
        minZoom={12}
  maxZoom={19}
  zoomControl={true}
  dragging={true}
  scrollWheelZoom={true}
  doubleClickZoom={true}
  touchZoom={true}
  keyboard={true}
  className="h-full w-full"
  style={{
    background: claro ? "#e8eef7" : "#0a1428",
  }}
>
  <TileLayer
  url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
    maxZoom={19}
          attribution="Tiles &copy; Esri"
  />
</MapContainer>

      <Link
        to="/mapa"
        className="absolute right-3 top-3 z-1000 rounded-md bg-amarillo px-3 py-1.5 text-xs font-semibold text-negro transition hover:brightness-110"
      >
        Ver mapa completo
      </Link>
    </div>
  );
}
