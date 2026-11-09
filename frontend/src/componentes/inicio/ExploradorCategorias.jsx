import { Link } from "react-router";
import { categorias } from "../../data/categorias";

// Explorador de categorías: un título, una línea que lo separa y debajo los nombres como enlaces de texto.
// Cada uno lleva al catálogo ya filtrado por esa categoría.
export default function ExploradorCategorias() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-8">

      {/* Encabezado: el título a la izquierda y "Ver más" a la derecha, los dos sobre la misma línea.
          justify-between: uno en cada punta. items-end: alineados por abajo.
          border-b: la línea que los separa de los nombres. */}
      <div className="flex items-end justify-between border-b border-borde pb-3">
        {/* Título en letra liviana, con la última palabra en negrita. */}
        <h2 className="text-xl font-light uppercase">
          Explorá nuestras <strong className="font-bold">categorías</strong>
        </h2>

        {/* "Ver más" lleva al catálogo completo. El subrayado dorado aparece al pasar el mouse. */}
        <Link
          to="/catalogo"
          className="text-xs text-gris-azulado underline decoration-transparent decoration-2 underline-offset-4 transition hover:decoration-rojo"
        >
          Ver más →
        </Link>
      </div>

      {/* Los nombres. flex-wrap: si no entran en una fila, pasan a la siguiente. */}
      <div className="mt-4 flex flex-wrap gap-x-8 gap-y-3">
        {categorias.map((categoria) => (
          <Link
            key={categoria}
            // encodeURIComponent protege los espacios y símbolos raros de la dirección.
            to={`/catalogo?categoria=${encodeURIComponent(categoria)}`}
            // El subrayado empieza transparente y al pasar el mouse se pone dorado.
            className="text-sm underline decoration-transparent decoration-2 underline-offset-4 transition hover:decoration-amarillo"
          >
            {categoria}
          </Link>
        ))}
      </div>
    </section>
  );
}