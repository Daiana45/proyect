import { useState } from "react";
import { Link, useParams } from "react-router";
import { productosCatalogo } from "../data/catalogo";
import { tiendas, datosTienda } from "../data/tiendas";
import { comercios } from "../data/comercios";
import { aSlug } from "../utils/slug";
import { useSesion } from "../componentes/hooks/useSesion";
import ModalRegistro from "../componentes/UI/ModalRegistro";
import TarjetaResultado from "../componentes/catalogo/TarjetaResultado";

// Porcentaje de descuento de un producto (0 si no tiene precio anterior)
const porcentajeDe = (p) => (p.precio_anterior ? (1 - p.precio / p.precio_anterior) * 100 : 0);

// Todos los nombres de comercios que conozco: los de tiendas.js y los que aparecen en el catálogo
const nombresConocidos = [...new Set([...Object.keys(tiendas), ...productosCatalogo.map((p) => p.tienda.nombre)])];

const ordenadores = {
  descuento: (a, b) => porcentajeDe(b) - porcentajeDe(a),
  menor: (a, b) => a.precio - b.precio,
  mayor: (a, b) => b.precio - a.precio,
  nuevos: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
};

export default function PaginaTienda() {
  const { slug } = useParams();
  const { logueado } = useSesion();

  const [pestana, setPestana] = useState("productos");
  const [buscar, setBuscar] = useState("");
  const [categoria, setCategoria] = useState("");
  const [orden, setOrden] = useState("descuento");
  const [precioMin, setPrecioMin] = useState("");
  const [precioMax, setPrecioMax] = useState("");
  const [soloDescuento, setSoloDescuento] = useState(false);

  // Reseñas de la tienda (por ahora solo en memoria; con el backend se guardan de verdad)
  const [motivoModal, setMotivoModal] = useState(null);
  const [puntuacion, setPuntuacion] = useState(0);
  const [estrellaHover, setEstrellaHover] = useState(0);
  const [textoResena, setTextoResena] = useState("");
  const [resenas, setResenas] = useState([]);

  // Busco el comercio por la dirección (/tienda/super-sol → "Súper Sol")
  const nombre = nombresConocidos.find((n) => aSlug(n) === slug);

  if (!nombre) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-sm text-gris-azulado">No encontré esa tienda.</p>
        <Link to="/catalogo" className="mt-3 inline-block text-xs text-azul hover:underline">Volver al catálogo</Link>
      </div>
    );
  }

  const tienda = datosTienda(nombre);
  const direccion = comercios.find((c) => c.nombre === nombre)?.direccion;
  const productosTienda = productosCatalogo.filter((p) => p.tienda.nombre === nombre);
  const categoriasTienda = [...new Set(productosTienda.map((p) => p.categorias[0].nombre))].sort();

  // Aplico los filtros y el orden de la barra
  const visibles = productosTienda
    .filter((p) => {
      const texto = `${p.nombre} ${p.marca}`.toLowerCase();
      return (
        (!buscar || texto.includes(buscar.toLowerCase())) &&
        (!categoria || p.categorias[0].nombre === categoria) &&
        (precioMin === "" || p.precio >= Number(precioMin)) &&
        (precioMax === "" || p.precio <= Number(precioMax)) &&
        (!soloDescuento || p.en_oferta)
      );
    })
    .sort(ordenadores[orden]);

  const conSesion = (motivo, accion) => {
    if (!logueado) {
      setMotivoModal(motivo);
      return;
    }
    accion();
  };

  const enviarResena = () => {
    const limpio = textoResena.trim();
    if (!limpio || puntuacion === 0) return;
    setResenas([{ id: Date.now(), usuario: "Vos", texto: limpio, puntuacion }, ...resenas]);
    setTextoResena("");
    setPuntuacion(0);
  };

  const campo = "rounded-sm border border-borde bg-transparent px-3 py-2 text-xs outline-none focus:border-amarillo";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {motivoModal && <ModalRegistro motivo={motivoModal} alCerrar={() => setMotivoModal(null)} />}

      {/* Migas de pan */}
      <p className="text-xs text-gris-azulado">
        <Link to="/" className="hover:underline">Inicio</Link> ›{" "}
        <Link to="/catalogo" className="hover:underline">Catálogo</Link> ›{" "}
        <span className="text-blanco">{nombre}</span>
      </p>

      {/* Cabecera del perfil */}
      <div className="mt-5 flex flex-wrap items-center gap-5 rounded-md border border-borde bg-gris-oscuro p-6">
        {/* Logo provisorio: la inicial del comercio. Cuando haya logo real, va un <img> */}
        <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full fondo-dorado font-titulo text-4xl font-bold text-negro">
          {nombre[0]}
        </div>
        <div className="min-w-0">
          <h1 className="font-titulo text-2xl font-bold md:text-3xl">{nombre}</h1>
          <p className="mt-1 text-xs text-gris-azulado">
            {productosTienda.length} {productosTienda.length === 1 ? "producto" : "productos"} · {tienda.rubro}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
            <span className="text-amarillo">★ {String(tienda.rating).replace(".", ",")}</span>
            <span className={`rounded-sm px-1.5 py-0.5 ${tienda.tipo === "Pyme" ? "bg-verde/15 text-verde" : "bg-azul/15 text-azul"}`}>
              {tienda.tipo}
            </span>
            <span className={tienda.abierto ? "text-verde" : "text-rojo"}>{tienda.abierto ? "Abierto ahora" : "Cerrado ahora"}</span>
            {direccion && <span className="text-gris-azulado">· {direccion}</span>}
          </div>
          <Link to={`/mapa?tienda=${encodeURIComponent(nombre)}`} className="mt-2 inline-block text-xs text-azul hover:underline">Ver en el mapa →</Link>
        </div>
      </div>

      {/* Pestañas */}
      <div className="mt-6 flex gap-6 border-b border-borde text-sm font-semibold">
        <button
          onClick={() => setPestana("productos")}
          className={`cursor-pointer border-b-2 pb-2 transition ${pestana === "productos" ? "border-amarillo text-amarillo" : "border-transparent text-gris-azulado hover:text-blanco"}`}
        >
          Productos <span className="text-xs font-normal text-gris-azulado">{productosTienda.length}</span>
        </button>
        <button
          onClick={() => setPestana("resenas")}
          className={`cursor-pointer border-b-2 pb-2 transition ${pestana === "resenas" ? "border-amarillo text-amarillo" : "border-transparent text-gris-azulado hover:text-blanco"}`}
        >
          Reseñas <span className="text-xs font-normal text-gris-azulado">{resenas.length}</span>
        </button>
      </div>

      {/* PRODUCTOS */}
      {pestana === "productos" && (
        <div className="mt-5">
          <div className="rounded-md border border-borde bg-gris-oscuro p-4">
            <div className="flex flex-wrap gap-3">
              <input
                value={buscar}
                onChange={(e) => setBuscar(e.target.value)}
                placeholder={`Buscar en ${nombre}...`}
                className={`${campo} min-w-52 flex-1`}
              />
              <select value={categoria} onChange={(e) => setCategoria(e.target.value)} className={`${campo} bg-gris-oscuro`}>
                <option value="">Todas las categorías</option>
                {categoriasTienda.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select value={orden} onChange={(e) => setOrden(e.target.value)} className={`${campo} bg-gris-oscuro`}>
                <option value="descuento">Mayor descuento</option>
                <option value="menor">Menor precio</option>
                <option value="mayor">Mayor precio</option>
                <option value="nuevos">Más nuevos</option>
              </select>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs">
              <input type="number" min="0" value={precioMin} onChange={(e) => setPrecioMin(e.target.value)} placeholder="Precio mín." className={`${campo} w-28`} />
              <span className="text-gris-azulado">–</span>
              <input type="number" min="0" value={precioMax} onChange={(e) => setPrecioMax(e.target.value)} placeholder="Precio máx." className={`${campo} w-28`} />
              <label className="flex cursor-pointer items-center gap-2">
                <input type="checkbox" checked={soloDescuento} onChange={(e) => setSoloDescuento(e.target.checked)} className="accent-amarillo" />
                Solo con descuento
              </label>
            </div>
          </div>

          <p className="mt-4 text-xs text-gris-azulado">
            {visibles.length} {visibles.length === 1 ? "producto" : "productos"}
          </p>

          {visibles.length === 0 ? (
            <p className="mt-6 text-center text-sm text-gris-azulado">No hay productos con esos filtros.</p>
          ) : (
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              {visibles.map((p) => (
                <TarjetaResultado key={p.id} producto={p} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* RESEÑAS: para dejar una también hace falta tener sesión */}
      {pestana === "resenas" && (
        <div className="mt-5">
          <div className="rounded-md border border-borde bg-gris-oscuro p-4">
            <p className="text-sm font-semibold">Dejá tu reseña de {nombre}</p>
            <div className="mt-2 flex" onMouseLeave={() => setEstrellaHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => conSesion("puntuar este comercio", () => setPuntuacion(n))}
                  onMouseEnter={() => setEstrellaHover(n)}
                  aria-label={`Puntuar con ${n} ${n === 1 ? "estrella" : "estrellas"}`}
                  className={`cursor-pointer text-2xl leading-none transition ${n <= (estrellaHover || puntuacion) ? "text-amarillo" : "text-borde"}`}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={textoResena}
              onChange={(e) => setTextoResena(e.target.value)}
              onFocus={(e) => {
                if (!logueado) {
                  e.target.blur();
                  setMotivoModal("dejar una reseña");
                }
              }}
              rows={3}
              placeholder="Contá cómo fue tu experiencia con este comercio..."
              className={`${campo} mt-3 w-full resize-none`}
            />
            <div className="mt-2 flex justify-end">
              <button
                onClick={() => conSesion("dejar una reseña", enviarResena)}
                className="cursor-pointer rounded-sm fondo-dorado px-5 py-2 text-xs font-semibold text-negro transition hover:brightness-110"
              >
                Publicar reseña
              </button>
            </div>
          </div>

          <div className="mt-3 flex flex-col gap-3">
            {resenas.length === 0 && <p className="text-xs text-gris-azulado">Todavía no hay reseñas. ¡Sé el primero!</p>}
            {resenas.map((r) => (
              <div key={r.id} className="rounded-md border border-borde bg-gris-oscuro p-4">
                <p className="text-xs font-semibold">{r.usuario}</p>
                <p className="mt-1 text-xs text-amarillo">
                  {"★".repeat(r.puntuacion)}
                  <span className="text-borde">{"★".repeat(5 - r.puntuacion)}</span>
                </p>
                <p className="mt-2 text-xs">{r.texto}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}