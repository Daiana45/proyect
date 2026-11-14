// Convierte el nombre de un comercio en un texto para la dirección: "Súper Sol" → "super-sol"
export const aSlug = (nombre) =>
  nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, "y")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");