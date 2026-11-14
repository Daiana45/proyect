// Centro aproximado de Formosa Capital (lat, lng)
export const CENTRO_FORMOSA = [-26.1775, -58.1781];

// Límites aproximados de Formosa Capital: [[sur, oeste], [norte, este]]
// El mapa no deja salir de este rectángulo.
export const LIMITES_FORMOSA = [
  [-26.27, -58.3],
  [-26.09, -58.14],
];

const aRadianes = (grados) => (grados * Math.PI) / 180;

// Distancia real entre dos puntos de la Tierra en km (fórmula de Haversine)
export function distanciaKm([lat1, lng1], [lat2, lng2]) {
  const radioTierra = 6371;
  const dLat = aRadianes(lat2 - lat1);
  const dLng = aRadianes(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(aRadianes(lat1)) * Math.cos(aRadianes(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * radioTierra * Math.asin(Math.sqrt(a));
}

// 0,85 km → "850 m" · 1,24 km → "1,2 km"
export const formatoDistancia = (km) =>
  km < 1
    ? `${Math.round(km * 100) * 10} m`
    : `${km.toLocaleString("es-AR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`;

// ¿El punto está dentro de Formosa Capital?
export const dentroDeFormosa = ([lat, lng]) => {
  const [[sur, oeste], [norte, este]] = LIMITES_FORMOSA;
  return lat >= sur && lat <= norte && lng >= oeste && lng <= este;
};