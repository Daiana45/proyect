import { Link } from "react-router";

// Color del degradado de la foto según la categoría (mientras no haya foto real).
// Los colores de categoría solo se usan acá, en lo que es de categorías.
const degradados = {
  Deportes: "from-azul/35",
  Hogar: "from-violeta/35",
  Alimentos: "from-verde/35",
  Mascotas: "from-naranja/35",
  Bebidas: "from-azul/35",
  Panadería: "from-naranja/35",
  "Frutas y Verduras": "from-verde/35",
  Limpieza: "from-azul/35",
  Ferretería: "from-violeta/35",
  Librería: "from-violeta/35",
  Farmacia: "from-verde/35",
  Otros: "from-azul/35",
};

const formatoPrecio = (n) => `$${Math.round(n).toLocaleString("es-AR")}`;

// Card de producto para los carruseles de la página de inicio.
// Al tocarla abre la página del producto. Prop: producto
export default function TarjetaProducto({ producto }) {
  const categoria = producto.categorias?.[0]?.nombre;

  return (
    <Link to={`/producto/${producto.id}`} className="block w-36 shrink-0 snap-start rounded-sm">
      <article>
        {/* Foto más baja que antes (4/3). Si todavía no hay imagen, un degradado de la categoría */}
        <div
          className={`relative aspect-6/8 overflow-hidden rounded-sm bg-linear-to-br to-negro ${
            degradados[categoria] ?? "from-azul/35"
          }`}
        >
          {producto.imagen && <img src={producto.imagen} alt={producto.nombre} className="h-full w-full object-cover" />}
          {producto.en_oferta && (
            <span className="absolute left-1.5 top-1.5 rounded-sm bg-rojo px-1.5 py-0.5 text-[10px] font-semibold text-blanco">
              Oferta
            </span>
          )}
        </div>

        <h3 className="mt-2 truncate text-xs font-semibold">{producto.nombre}</h3>
        <p className="truncate text-[11px] text-azul">{producto.tienda.nombre}</p>

        <p className="mt-1 flex items-baseline gap-1.5">
          {producto.precio_anterior && (
            <span className="text-[10px] text-rojo line-through">{formatoPrecio(producto.precio_anterior)}</span>
          )}
          <span className="text-sm font-bold">{formatoPrecio(producto.precio)}</span>
        </p>

        <div className="mt-1 flex items-center justify-between text-[10px] text-azul">
          <span>{producto.distancia}</span>
          <span>♥ {producto.me_gusta}</span>
        </div>
      </article>
    </Link>
  );
}