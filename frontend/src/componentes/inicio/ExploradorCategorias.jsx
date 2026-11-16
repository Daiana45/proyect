
import { Link } from "react-router";
import { categorias } from "../../data/categorias";

export default function ExploradorCategorias() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-8">

      {/* Encabezado */}
      <div className="flex items-end justify-between border-b border-borde pb-3 py-14">
        <h2 className="text-xl font-semibold uppercase tracking-widest text-amarillo">
          Explorá nuestras{" "}
          <strong className="font-semibold text-amarillo/45">categorías</strong>
        </h2>

        <Link
          to="/catalogo"
          className="text-xs uppercase font-extralight text-gris-azulado underline decoration-transparent decoration-1 underline-offset-4 transition-colors duration-200 hover:text-rojo hover:decoration-rojo"
        >
          Ver más →
        </Link>
      </div>

      {/* Categorías */}
      <div className="mt-5 flex flex-wrap gap-x-8 gap-y-4">
        {categorias.map((categoria) => (
          <Link
            key={categoria}
            to={`/catalogo?categoria=${encodeURIComponent(categoria)}`}
            className="text-sm text-gris-azulado underline decoration-transparent decoration-1 underline-offset-4 transition-all duration-200 hover:text-rojo hover:decoration-rojo"
          >
            {categoria}
          </Link>
        ))}
      </div>

    </section>
  );
}
