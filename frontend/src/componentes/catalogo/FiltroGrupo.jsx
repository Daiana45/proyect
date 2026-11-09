// Un grupo de filtros que se pliega y despliega (como en Carrefour).
// Uso <details>, que ya trae el abrir/cerrar sin escribir código. "open" lo deja abierto al empezar.
export default function FiltroGrupo({ titulo, children, abierto = true }) {
  return (
    <details open={abierto} className="group border-b border-borde py-3">
      <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-semibold uppercase tracking-wide">
        {titulo}
        {/* La flecha gira cuando el grupo está abierto (group-open) */}
        <span className="text-gris-azulado transition group-open:rotate-90">›</span>
      </summary>
      <div className="mt-2">{children}</div>
    </details>
  );
}