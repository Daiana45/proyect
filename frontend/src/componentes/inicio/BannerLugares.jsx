import { Link } from "react-router";
import { comercios } from "../../data/comercios";

// Banner de comercios: fondo dorado, texto a la izquierda y a la derecha una foto real (o, sin foto, la ciudad en grande).
// Props: titulo, texto, boton, ruta, ciudad (palabra grande si no hay foto) e imagen (foto real, va en public/banners/).
export default function BannerLugares({ titulo, texto, boton = "Ver en el mapa", ruta = "/catalogo", ciudad = "Formosa", imagen }) {
  return (
    <section className="relative my-10 overflow-hidden bg-amarillo text-negro">
      {imagen ? (
        // Con foto: ocupa el 42% de la derecha, con corte en diagonal en el borde izquierdo
        <img
          src={imagen}
          alt=""
          className="absolute inset-y-0 right-0 hidden h-full w-[42%] object-cover md:block"
          style={{ clipPath: "polygon(12% 0, 100% 0, 100% 100%, 0 100%)" }}
        />
      ) : (
        // Sin foto: la ciudad en letras huecas, completa y pegada a la derecha
        <span
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 right-8 hidden select-none font-titulo text-[8rem] font-black uppercase leading-[0.8] text-transparent md:block"
          style={{ WebkitTextStroke: "2px rgba(5,11,26,0.25)" }}
        >
          {ciudad}
        </span>
      )}

      {/* Texto: el max-w evita que pise la foto o la palabra de la derecha */}
      <div className="relative mx-auto max-w-7xl px-4 py-12">
        <div className="max-w-lg">
          <h2 className="text-3xl font-semibold leading-tight">{titulo}</h2>
          <p className="mt-2 text-sm">{texto}</p>

          {/* Cinco comercios como etiquetas. Al pasar el mouse se vuelven rojas */}
          <div className="mt-5 flex flex-wrap gap-2">
            {comercios.slice(0, 5).map((comercio) => (
              <Link
                key={comercio.id}
                to={`/catalogo?buscar=${encodeURIComponent(comercio.nombre)}`}
                className="rounded-full bg-negro px-3 py-1 text-xs text-blanco transition hover:bg-rojo"
              >
                {comercio.nombre}
              </Link>
            ))}
          </div>

          {/* Botón de contorno oscuro: el relleno negro entra deslizando (group-hover) */}
          <Link to={ruta} className="group relative mt-6 inline-flex items-center gap-2 overflow-hidden border border-negro px-5 py-2 text-xs font-semibold uppercase tracking-wide">
            <span className="absolute inset-0 -translate-x-full bg-negro transition-transform duration-300 group-hover:translate-x-0" />
            <span className="relative transition-colors duration-300 group-hover:text-amarillo">{boton}</span>
            <span className="relative transition duration-300 group-hover:translate-x-1 group-hover:text-amarillo">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}