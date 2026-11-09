import { Link } from "react-router";

// Color de fondo de cada variante (el lado del texto).
const colores = {
  dorado: "bg-amarillo text-negro",
  rojo: "bg-rojo text-blanco",
};

// Botón de cada variante. En el dorado es oscuro; en el rojo, blanco.
const botones = {
  dorado: "bg-negro text-blanco hover:bg-blanco hover:text-negro",
  rojo: "bg-blanco text-negro hover:bg-negro hover:text-blanco",
};

// Banner a todo el ancho: foto real a la izquierda con corte en diagonal, texto a la derecha.
// Props: variante, titulo, texto, boton, ruta e imagen (foto real, va en public/banners/).
export default function BannerPromo({ variante = "rojo", titulo, texto, boton = "Ver más", ruta = "/catalogo", imagen = "izquierda" }) {
  return (
    <section className={`relative my-10 flex h-64 items-center overflow-hidden ${colores[variante]}`}>
      {/* Foto: ocupa el 58% de la izquierda. El clipPath hace el corte en diagonal en el borde derecho.
          Si quiero más o menos diagonal, cambio el 88% (más bajo = más inclinado). */}
      {imagen && (
        <img
          src={imagen}
          alt=""
          className="absolute inset-y-0 left-0 hidden h-full w-[58%] object-cover md:block"
          style={{ clipPath: "polygon(0 0, 100% 0, 88% 100%, 0 100%)" }}
        />
      )}

      {/* Texto: si hay foto va a la derecha (42%); si no, queda a la izquierda */}
      <div className={`relative w-full px-6 ${imagen ? "md:ml-auto md:w-[42%] md:pr-12" : "mx-auto max-w-7xl"}`}>
        <h2 className="text-3xl font-semibold leading-tight">{titulo}</h2>
        <p className="mt-2 max-w-sm text-sm opacity-90">{texto}</p>

        <Link to={ruta} className={`mt-5 inline-block rounded-md px-5 py-2 text-sm transition ${botones[variante]}`}>
          {boton}
        </Link>
      </div>
    </section>
  );
}