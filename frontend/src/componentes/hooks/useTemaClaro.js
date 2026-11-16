import { useSyncExternalStore } from "react";

// Le avisa a React cuando cambia la clase del <html> (el botón de tema del Navbar le pone o le saca "tema-claro")
const suscribirse = (avisar) => {
  const observador = new MutationObserver(avisar);
  observador.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observador.disconnect();
};

// Lo que React lee cada vez: ¿el <html> tiene la clase del tema claro?
const leerTemaClaro = () => document.documentElement.classList.contains("tema-claro");

// Dice si la página está en tema claro. Sirve para componentes que no pueden leer el tema de otra forma, como el mapa.
export default function useTemaClaro() {
  return useSyncExternalStore(suscribirse, leerTemaClaro);
}