export function aKm(texto) {
  const numero = parseFloat(texto.replace(",", "."));
  return texto.includes("km") ? numero : numero / 1000;
}