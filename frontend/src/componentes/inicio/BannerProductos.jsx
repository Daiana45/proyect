import { Link } from "react-router";
import { motion } from "motion/react";

// Color del hueco de la foto según la categoría (igual idea que en TarjetaProducto).
// Si la categoría no está acá, usa el dorado de reserva.
const degradados = {
  Alimentos: "from-verde/40",
  Hogar: "from-naranja/40",
  Deportes: "from-azul/40",
  Mascotas: "from-violeta/40",
  Limpieza: "from-azul/40",
};

// Banner rojo: promo a la izquierda y tarjetas de producto a la derecha.
// Props: titulo, boton, ruta, imagen (fondo opcional de la izquierda) y productos (uso los primeros 4).
export default function BannerProductos({ titulo, boton = "Ver productos", ruta = "/catalogo", imagen, productos }) {
  return (
    <section className="relative my-10 overflow-hidden bg-rojo text-blanco">
      {/* Imagen de fondo de la izquierda (opcional) */}
      {imagen && <img src={imagen} alt="" className="absolute inset-y-0 left-0 h-full w-1/2 object-cover" />}

      {/* Sombra oscura de izquierda a derecha: da contraste al texto */}
      <div className="absolute inset-0 bg-linear-to-r from-rojo-oscuro via-rojo-oscuro/60 to-rojo" />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-25 px-4 py-10 lg:flex-row">
        {/* Título + botón animado */}
        <div className="w-full shrink-0 lg:w-64">
          <h2 className="text-3xl font-black uppercase leading-none">{titulo}</h2>

          <Link to={ruta} className="group relative mt-5 inline-flex items-center gap-2 overflow-hidden border border-blanco px-5 py-2 text-xs font-semibold uppercase tracking-wide">
            {/* Relleno blanco que entra deslizando desde la izquierda */}
            <span className="absolute inset-0 -translate-x-full bg-blanco transition-transform duration-300 group-hover:translate-x-0" />
            <span className="relative transition-colors duration-300 group-hover:text-rojo-oscuro">{boton}</span>
            <span className="relative transition duration-300 group-hover:translate-x-1 group-hover:text-rojo-oscuro">→</span>
          </Link>
        </div>

        {/* Tarjetas. La cuarta solo se ve en pantallas grandes */}
        <div className="flex gap-10">
          {productos.slice(0, 4).map((producto, i) => {
            // Uso la primera categoría del producto para elegir el color de la foto
            const categoria = producto.categorias?.[0]?.nombre;

            return (
              // group: me deja agrandar la foto cuando paso el mouse por toda la tarjeta
              <motion.article
                key={producto.id}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className={`group w-48 shrink-0 ${i === 3 ? "hidden xl:block" : ""}`}
              >
                {/* Foto: mismo formato que en los carruseles. overflow-hidden recorta el zoom */}
                <div className="aspect-4/5 overflow-hidden rounded-md">
                  <div className={`h-full w-full bg-linear-to-br ${degradados[categoria] ?? "from-amarillo/40"} to-negro/40 transition duration-300 group-hover:scale-105`} />
                </div>

                {/* Nombre y tienda */}
                <h3 className="mt-2 text-xs font-semibold">{producto.nombre}</h3>
                <p className="text-[10px] text-blanco/70">{producto.tienda.nombre}</p>
                {/* Cuotas: solo si el producto las tiene. Divido el precio por la cantidad de cuotas */}
{producto.cuotas && (
  <p className="mt-0.5 text-[10px] text-blanco/80">
    {producto.cuotas} cuotas de ${Math.round(producto.precio / producto.cuotas).toLocaleString("es-AR")}
  </p>
)}

                {/* Precio, y el anterior tachado solo si es oferta */}
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-sm font-bold">${producto.precio.toLocaleString("es-AR")}</span>
                  {producto.en_oferta && producto.precio_anterior && (
                    <span className="text-[10px] text-blanco/60 line-through">${producto.precio_anterior.toLocaleString("es-AR")}</span>
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}