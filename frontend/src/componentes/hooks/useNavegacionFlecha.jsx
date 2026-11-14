import { useEffect } from "react";

// Todo lo que se puede enfocar con el teclado
const SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), summary, [tabindex]';

// Qué flecha va hacia dónde
const DIRECCIONES = { ArrowUp: "arriba", ArrowDown: "abajo", ArrowLeft: "izquierda", ArrowRight: "derecha" };

// ¿El elemento se ve? (si está oculto con display:none no tiene tamaño)
function estaVisible(el) {
  const r = el.getBoundingClientRect();
  if (r.width === 0 || r.height === 0) return false;
  const estilo = getComputedStyle(el);
  return estilo.visibility !== "hidden" && estilo.display !== "none";
}

// Lista de elementos a los que se puede llegar con flechas (se saltan los que tienen tabindex negativo)
function candidatos() {
  return [...document.querySelectorAll(SELECTOR)].filter((el) => el.tabIndex >= 0 && estaVisible(el));
}

// Navegación con flechas por todo el sitio: desde el elemento enfocado voy al más cercano en esa dirección.
// Respeta los campos que ya usan las flechas (texto, números, listas desplegables, radios).
export default function useNavegacionFlechas() {
  useEffect(() => {
    const manejar = (evento) => {
      const direccion = DIRECCIONES[evento.key];
      // Si otro componente ya manejó la tecla (por ejemplo las sugerencias de búsqueda), no hago nada
      if (!direccion || evento.defaultPrevented || evento.altKey || evento.ctrlKey || evento.metaKey || evento.shiftKey) return;

      const actual = document.activeElement;

      // Sin nada enfocado: arriba y abajo siguen haciendo scroll; izquierda y derecha enfocan el primer elemento visible en pantalla
      if (!actual || actual === document.body) {
        if (direccion === "izquierda" || direccion === "derecha") {
          const primero = candidatos().find((el) => {
            const r = el.getBoundingClientRect();
            return r.top >= 0 && r.bottom <= window.innerHeight;
          });
          if (primero) {
            evento.preventDefault();
            primero.focus();
          }
        }
        return;
      }

      // Campos que usan las flechas por su cuenta: los dejo tranquilos
      const etiqueta = actual.tagName;
      if (etiqueta === "SELECT" || etiqueta === "TEXTAREA") return;
      if (etiqueta === "INPUT" && !["checkbox", "button", "submit"].includes(actual.type)) return;

      const a = actual.getBoundingClientRect();
      const ax = a.left + a.width / 2;
      const ay = a.top + a.height / 2;

      let mejor = null;
      let mejorPuntaje = Infinity;

      for (const el of candidatos()) {
        if (el === actual || actual.contains(el) || el.contains(actual)) continue;
        const r = el.getBoundingClientRect();
        const dx = r.left + r.width / 2 - ax;
        const dy = r.top + r.height / 2 - ay;

        // Distancia principal (en la dirección de la flecha) y desvío lateral
        let principal;
        let lateral;
        if (direccion === "derecha") { principal = dx; lateral = Math.abs(dy); }
        else if (direccion === "izquierda") { principal = -dx; lateral = Math.abs(dy); }
        else if (direccion === "abajo") { principal = dy; lateral = Math.abs(dx); }
        else { principal = -dy; lateral = Math.abs(dx); }

        // Tiene que estar realmente en esa dirección
        if (principal <= 4) continue;

        // El desvío lateral pesa el doble: prefiero el de la misma fila/columna aunque esté un poco más lejos
        const puntaje = principal + lateral * 2;
        if (puntaje < mejorPuntaje) {
          mejorPuntaje = puntaje;
          mejor = el;
        }
      }

      if (mejor) {
        evento.preventDefault();
        mejor.focus({ preventScroll: true });
        mejor.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
      }
    };

    document.addEventListener("keydown", manejar);
    return () => document.removeEventListener("keydown", manejar);
  }, []);
}