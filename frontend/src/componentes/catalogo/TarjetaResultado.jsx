import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { haceCuanto } from "../../utils/tiempo";
import { datosTienda } from "../../data/tiendas";
import { aSlug } from "../../utils/slug";

// La hora se calcula una sola vez al cargar el módulo (no dentro del render)
const ahora = Date.now();

const formatoPrecio = (n) => `$${Math.round(n).toLocaleString("es-AR")}`;

// Estrellas: lleno las que corresponden a la valoración del comercio (de 5)
function Estrellas({ valor }) {
  return (
    <span className="flex items-center gap-1 text-[10px]">
      <span aria-hidden className="tracking-tighter text-amarillo">
        {"★".repeat(Math.round(valor))}
        <span className="text-borde">{"★".repeat(5 - Math.round(valor))}</span>
      </span>
      <span className="font-semibold text-blanco">{String(valor).replace(".", ",")}</span>
    </span>
  );
}

// Card de un resultado del catálogo. Al tocarla se abre la página del producto.
// Si toco el nombre del comercio, se abre el perfil de la tienda. Prop: producto
export default function TarjetaResultado({ producto }) {
  const tienda = datosTienda(producto.tienda.nombre);
  // La card entera es un Link, y un enlace dentro de otro no se puede: por eso el comercio navega con useNavigate
  const navegar = useNavigate();

  return (
    <Link to={`/producto/${producto.id}`} className="block rounded-md">
      <motion.article
        whileHover={{ y: -2 }}
        transition={{ duration: 0.15 }}
        className="flex gap-4 rounded-md border border-borde bg-gris-oscuro p-3 transition hover:border-amarillo/50 hover:shadow-lg hover:shadow-black/30"
      >
        {/* Foto del producto. Si todavía no hay imagen dejo el espacio reservado */}
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-sm bg-negro">
          {producto.imagen ? (
            <img src={producto.imagen} alt={producto.nombre} className="h-full w-full object-cover" />
          ) : (
            <span aria-hidden className="text-[10px] text-gris-azulado">Sin foto</span>
          )}
        </div>

        {/* Datos */}
        <div className="flex min-w-0 flex-1 flex-col justify-between">
          <div>
            <h3 className="truncate text-sm font-semibold">{producto.nombre}</h3>
            <p className="mt-0.5 text-[11px] text-gris-azulado">
              <span
                role="link"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navegar(`/tienda/${aSlug(producto.tienda.nombre)}`);
                }}
                className="cursor-pointer text-azul hover:underline"
              >
                {producto.tienda.nombre}
              </span>{" "}
              · a {producto.distancia}
            </p>
            <div className="mt-1">
              <Estrellas valor={tienda.rating} />
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10px]">
            <span
              className={`rounded-sm px-1.5 py-0.5 ${
                tienda.tipo === "Pyme" ? "bg-verde/15 text-verde" : "bg-azul/15 text-azul"
              }`}
            >
              {tienda.tipo}
            </span>
            <span className="text-gris-azulado">Actualizado {haceCuanto(producto.createdAt, ahora)}</span>
            {producto.en_oferta && (
              <span className="rounded-sm bg-rojo px-1.5 py-0.5 font-semibold text-blanco">Oferta</span>
            )}
            {producto.cuotas && (
              <span className="rounded-sm bg-amarillo/15 px-1.5 py-0.5 font-semibold text-amarillo">
                {producto.cuotas} cuotas de {formatoPrecio(producto.precio / producto.cuotas)}
              </span>
            )}
          </div>
        </div>

        {/* Precio */}
        <div className="flex shrink-0 flex-col items-end justify-center text-right">
          <span className="text-lg font-bold">{formatoPrecio(producto.precio)}</span>
          {producto.precio_anterior && (
            <span className="text-[11px] text-rojo line-through">{formatoPrecio(producto.precio_anterior)}</span>
          )}
        </div>
      </motion.article>
    </Link>
  );
}