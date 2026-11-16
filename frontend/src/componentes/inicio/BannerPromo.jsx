import { Link } from "react-router";

// Colores sólidos (igual que tus otros banners: amarillo y rojo)
const variantes = {
  dorado: {
    fondo: "bg-amarillo",
    texto: "text-[#1f1500]",
    suave: "text-[#1f1500]/75",
    boton: "bg-[#050b1a] text-[#f4f7ff] hover:bg-[#1b2a4a]",
    // Filtro para la imagen: la oscurece un poco para que no sea blanco puro
    filtroImagen: "brightness-90 contrast-120",
  },
  rojo: {
    fondo: "bg-linear-to-r from-rojo-oscuro to-rojo",
    texto: "text-[#f4f7ff]",
    suave: "text-[#f4f7ff]/80",
    boton: "bg-[#f4f7ff] text-[#050b1a] hover:bg-white",
    filtroImagen: "brightness-95 contrast-105",
  },
};

export default function BannerPromo({
  variante = "dorado",
  titulo,
  texto,
  boton,
  imagen,
  ruta = "/catalogo",
  etiqueta,
}) {
  const estilo = variantes[variante] ?? variantes.dorado;

  const palabras = titulo.trim().split(" ");
  const ultima = palabras.pop() || "";
  const resto = palabras.join(" ");

  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <div className={`relative overflow-hidden rounded-md ${estilo.fondo} ${estilo.texto}`}>

        {/* Imagen con clip-path diagonal (como tu banner amarillo original) */}
        {imagen && (
          <div className="h-44  md:absolute md:inset-y-0 md:left-0 md:h-auto md:w-[50%] md:[clip-path:polygon(0_0,100%_0,90%_100%,0_100%)]">
            <img
              src={imagen}
              alt=""
              className={`h-full w-full object-cover ${estilo.filtroImagen}`}
            />
          </div>
        )}

        {/* Texto con la línea de costado que pediste */}
        <div className="relative flex flex-col items-start gap-3 px-8 py-8 md:ml-auto md:min-h-60 md:w-[42%] md:justify-center md:px-12 md:py-8">
          {etiqueta && (
            <span className="text-[11px] font-semibold uppercase tracking-widest opacity-70">
              {etiqueta}
            </span>
          )}

          {/* Línea de costado: regla vertical dorada/roja */}
          <div className="absolute left-0 top-1/2 h-16 w-1 -translate-y-1/2 bg-current opacity-30 md:left-6" />

          <h2 className="font-titulo text-3xl font-normal leading-tight md:text-4xl">
            {resto} <em className="italic">{ultima}</em>
          </h2>

          <p className={`max-w-sm text-sm leading-relaxed ${estilo.suave}`}>
            {texto}
          </p>

          <Link
            to={ruta}
            className={`mt-1 rounded-sm px-5 py-2.5 text-xs font-semibold transition-colors ${estilo.boton}`}
          >
            {boton} →
          </Link>
        </div>
      </div>
    </section>
  );
}