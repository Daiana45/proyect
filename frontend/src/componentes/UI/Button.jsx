// Los dos estilos de botón que uso en toda la app.
// principal: fondo dorado, para la acción más importante.
// contorno: solo borde, para la acción secundaria.
const estilos = {
  principal: "fondo-dorado text-negro hover:brightness-110",
  contorno: "border border-borde hover:border-blanco",
};

// children: lo que va escrito adentro del botón.
// variante: cuál de los dos estilos uso (por defecto, principal).
// ...resto: cualquier otra cosa que le pase (onClick, type, disabled...) se la entrego al <button>.
export default function Button({ children, variante = "principal", ...resto }) {
  return (
    <button
      className={`cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition ${estilos[variante]}`}
      {...resto}
    >
      {children}
    </button>
  );
}