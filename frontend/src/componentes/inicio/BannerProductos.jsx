import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { aSlug } from "../../utils/slug";

// Color de la foto vacía según la categoría (mientras no haya foto real)
const degradados = {
  Deportes: "from-azul/50",
  Hogar: "from-violeta/50",
  Alimentos: "from-verde/50",
  Mascotas: "from-naranja/50",
  Bebidas: "from-azul/50",
  Panadería: "from-naranja/50",
  "Frutas y Verduras": "from-verde/50",
  Limpieza: "from-azul/50",
  Ferretería: "from-violeta/50",
  Librería: "from-violeta/50",
  Farmacia: "from-verde/50",
  Otros: "from-violeta/50",
};

const formatoPrecio = (n) => `$${Math.round(n).toLocaleString("es-AR")}`;

// Banner rojo con título, botón y las cards de 4 productos.
// Props: titulo, ruta (a dónde lleva el botón), productos (la lista), imagen (opcional, foto de fondo a la izquierda)
export default function BannerProductos({ titulo = "Productos en cuotas", ruta = "/catalogo", productos = [], imagen }) {
  // La card entera es un Link, y un enlace dentro de otro no se puede: por eso el comercio navega con useNavigate
  const navegar = useNavigate();
  // Muestro solo 4. El cuarto se esconde en pantallas que no son muy anchas.
  const mostrados = productos.slice(0, 4);

  return (
    <section className="mx-auto my-10 max-w-7xl px-4">
      <div className="relative overflow-hidden rounded-md bg-linear-to-r from-rojo-oscuro to-rojo">
        {/* Foto de fondo opcional, tapada por el degradado oscuro para que el título se lea */}
        {imagen && (
          <>
            <img src={imagen} alt="" className="absolute inset-y-0 left-0 hidden h-full w-1/2 object-cover md:block" />
            <div className="absolute inset-y-0 left-0 hidden w-1/2 bg-linear-to-r from-rojo-oscuro via-rojo-oscuro/80 to-transparent md:block" />
          </>
        )}

        <div className="relative flex flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:gap-10 md:px-10">
          {/* Título y botón */}
          <div className="shrink-0 md:w-56">
            <h2 className="text-3xl font-extrabold uppercase leading-none tracking-tight text-blanco">{titulo}</h2>

            {/* Botón con borde: el relleno blanco se desliza al pasar el mouse y la flecha se mueve */}
            <Link
              to={ruta}
              className="group relative mt-5 inline-flex items-center gap-2 overflow-hidden border border-blanco px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-blanco"
            >
              <span className="absolute inset-0 -translate-x-full bg-blanco transition-transform duration-300 group-hover:translate-x-0" />
              <span className="relative transition-colors duration-300 group-hover:text-rojo">Ver productos</span>
              <span aria-hidden className="relative transition duration-300 group-hover:translate-x-1 group-hover:text-rojo">→</span>
            </Link>
          </div>

          {/* Las cards: cada una abre la página del producto */}
          <div className="grid flex-1 grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
            {mostrados.map((producto, i) => {
              const categoria = producto.categorias?.[0]?.nombre;
              return (
                <Link
                  key={producto.id}
                  to={`/producto/${producto.id}`}
                  className={`block rounded-sm ${i === 2 ? "hidden md:block" : ""} ${i === 3 ? "hidden xl:block" : ""}`}
                >
                  <motion.article whileHover={{ y: -4 }} transition={{ duration: 0.15 }}>
                    {/* Foto. Si todavía no hay imagen, un degradado de la categoría */}
                    <div className={`aspect-4/5 overflow-hidden rounded-sm bg-linear-to-br to-rojo-oscuro/70 ${degradados[categoria] ?? "from-violeta/50"}`}>
                      {producto.imagen && <img src={producto.imagen} alt={producto.nombre} className="h-full w-full object-cover" />}
                    </div>

                    <h3 className="mt-2.5 truncate text-sm font-semibold text-blanco">{producto.nombre}</h3>
                    {/* Al tocar el comercio se abre su perfil */}
                    <p
                      role="link"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navegar(`/tienda/${aSlug(producto.tienda.nombre)}`);
                      }}
                      className="cursor-pointer truncate text-xs text-blanco/70 hover:text-blanco hover:underline"
                    >
                      {producto.tienda.nombre}
                    </p>
                    {producto.cuotas && (
                      <p className="mt-0.5 text-xs text-blanco/90">
                        {producto.cuotas} cuotas de {formatoPrecio(producto.precio / producto.cuotas)}
                      </p>
                    )}
                    <p className="mt-1 flex items-baseline gap-2">
                      <span className="text-base font-bold text-blanco">{formatoPrecio(producto.precio)}</span>
                      {producto.precio_anterior && (
                        <span className="text-[11px] text-blanco/60 line-through">{formatoPrecio(producto.precio_anterior)}</span>
                      )}
                    </p>
                  </motion.article>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}