// Acá guardo los estilos que quiero que tengan TODOS mis botones, sin importar de qué tipo sean. Lo dejo en una constante para no repetirlo.
//rounded-full: le doy bordes totalmente redondos, forma de píldora.
//px-5 py-2.5: el espacio de adentro, a los costados y arriba/abajo.
//text-sm font-bold: letra chica y gruesa.
//transition: hago que los cambios de color se animen suave.
//cursor-pointer: quiero que aparezca la manito al pasar el mouse.
const estilosBase = "rounded-full px-5 py-2.5 text-sm font-bold transition cursor-pointer";

//Acá armo los tipos de botón que voy a tener.

const variantes = {
  // El botón principal: fondo amarillo y letra oscura.
  // hover:brightness-110 hace que se aclare un poco cuando paso el mouse.
  principal: "bg-amarillo text-negro hover:brightness-110",

  // El botón de contorno: transparente, solo con un borde finito.
  // hover:bg-white/10 le da un fondo blanco muy suave al pasar el mouse.
  contorno: "border border-white/20 text-blanco hover:bg-white/10",
};

// Mi componente Button. Cuando lo use, le puedo pasar estas cosas:
// variante: qué tipo de botón quiero. Si no le digo nada, uso "principal".
// className: estilos extra que quiera sumarle en un lugar puntual.
// children: lo que escribo adentro del botón (el texto).
// ...props: todo lo demás (onClick, type, disabled) se lo paso directo al <button>.
export default function Button({ variante = "principal", className = "", children, ...props }) {
  return (
    // Junto los tres grupos de clases: las base, las de mi variante y las extra.
    // variantes[variante] busca en mi objeto el nombre que le pasé
    // y me devuelve sus clases.
    <button className={`${estilosBase} ${variantes[variante]} ${className}`} {...props}>
      {children}
    </button>
  );
}