// Escribe cuánto pasó desde una fecha: "hace 30 minutos", "hace 3 horas", "hace 2 días".
// "ahora" es la hora actual; se la paso desde afuera para no llamar a Date.now() dentro de un componente.
export function haceCuanto(fecha, ahora) {
  // Minutos enteros que pasaron (Math.max evita números negativos)
  const minutos = Math.max(0, Math.floor((ahora - new Date(fecha)) / 60000));

  if (minutos < 1) return "hace instantes";
  if (minutos < 60) return `hace ${minutos} ${minutos === 1 ? "minuto" : "minutos"}`;

  const horas = Math.floor(minutos / 60);
  if (horas < 24) return `hace ${horas} ${horas === 1 ? "hora" : "horas"}`;

  const dias = Math.floor(horas / 24);
  return `hace ${dias} ${dias === 1 ? "día" : "días"}`;
}