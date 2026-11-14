import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import { productosCatalogo } from "../data/catalogo";
import { datosTienda } from "../data/tiendas";
import { compararProducto } from "../utils/comparar";
import { haceCuanto } from "../utils/tiempo";
import { aSlug } from "../utils/slug";
import { ahoraMs } from "../utils/ahora";
import useAuth from "../componentes/hooks/useAuth";
import useAccionPrivada from "../componentes/hooks/useAccionPrivada";
import useActividad from "../componentes/hooks/useActividad";

// La hora se calcula una sola vez al cargar el archivo (no dentro del render)
const ahora = ahoraMs();

const formatoPrecio = (n) => `$${Math.round(n).toLocaleString("es-AR")}`;

// El "key" hace que, al pasar de una oferta a otra, la página arranque de cero (puntuación, comentario, etc.)
export default function PaginaProducto() {
  const { id } = useParams();
  return <DetalleProducto key={id} id={id} />;
}

function DetalleProducto({ id }) {
  const navegar = useNavigate();
  // "producto" es la publicación que abrí: un comercio con su precio
  const producto = productosCatalogo.find((p) => String(p.id) === id);

  // Sesión y actividad: favoritos, alertas y opiniones se guardan en el perfil del usuario
  const { estaLogueado } = useAuth();
  const protegida = useAccionPrivada();
  const { esFavorito, alternarFavorito, alerta, guardarAlerta, quitarAlerta, opiniones, agregarOpinion, borrarOpinion } = useActividad();

  const alertaActual = producto ? alerta(producto.id) : undefined;
  const [objetivo, setObjetivo] = useState(alertaActual ? String(alertaActual.objetivo) : "");
  const [alertaGuardada, setAlertaGuardada] = useState(false);

  const [puntuacion, setPuntuacion] = useState(0);
  const [estrellaHover, setEstrellaHover] = useState(0);
  const [texto, setTexto] = useState("");

  // Si el id de la dirección no existe
  if (!producto) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-sm text-gris-azulado">No encontré ese producto.</p>
        <Link to="/catalogo" className="mt-3 inline-block text-xs text-azul hover:underline">Volver al catálogo</Link>
      </div>
    );
  }

  // La comparación: todas las publicaciones de este mismo producto, ordenadas por precio
  const { ofertas, mejor, masCara, masCerca, ahorro } = compararProducto(producto, productosCatalogo);
  const categoria = producto.categorias[0].nombre;
  const unSoloComercio = ofertas.length === 1;

  // Los datos de la oferta que estoy viendo
  const tiendaActual = datosTienda(producto.tienda.nombre);
  const esLaMejor = producto.id === mejor.id;
  const sobrecostoActual = producto.precio - mejor.precio;
  const porcentajeActual = Math.round((sobrecostoActual / mejor.precio) * 100);
  const descuentoActual = producto.precio_anterior ? Math.round((1 - producto.precio / producto.precio_anterior) * 100) : 0;

  const favorito = esFavorito(producto.id);
  const misOpiniones = opiniones.filter((o) => o.productoId === producto.id);

  // Activa la alerta con un precio sugerido (un 10% menos que el mejor precio de hoy) o la quita
  const alternarAlerta = () => {
    if (alertaActual) {
      quitarAlerta(producto.id);
      setObjetivo("");
      return;
    }
    const sugerido = Math.floor((mejor.precio * 0.9) / 10) * 10;
    guardarAlerta(producto.id, sugerido);
    setObjetivo(String(sugerido));
  };

  const guardarObjetivo = () => {
    const numero = Number(objetivo);
    if (numero <= 0) return;
    guardarAlerta(producto.id, numero);
    setAlertaGuardada(true);
  };

  const enviarComentario = () => {
    const limpio = texto.trim();
    if (!limpio) return;
    agregarOpinion({ productoId: producto.id, texto: limpio, puntuacion });
    setTexto("");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Migas de pan */}
      <p className="text-xs text-gris-azulado">
        <Link to="/" className="hover:underline">Inicio</Link> ›{" "}
        <Link to="/catalogo" className="hover:underline">Catálogo</Link> ›{" "}
        <Link to={`/catalogo?categoria=${encodeURIComponent(categoria)}`} className="hover:underline">{categoria}</Link> ›{" "}
        <span className="text-blanco">{producto.nombre}</span>
      </p>

      <div className="mt-5 grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {/* Foto del producto. Si todavía no hay imagen dejo el espacio reservado */}
        <div className="flex aspect-square items-center justify-center overflow-hidden rounded-md border border-borde bg-gris-oscuro">
          {producto.imagen ? (
            <img src={producto.imagen} alt={producto.nombre} className="h-full w-full object-contain p-6" />
          ) : (
            <span className="text-xs text-gris-azulado">Sin foto</span>
          )}
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-amarillo">{producto.marca}</p>
          <h1 className="mt-1 font-titulo text-2xl font-bold leading-tight md:text-3xl">{producto.nombre}</h1>
          <p className="mt-2 text-xs text-gris-azulado">
            {unSoloComercio
              ? "Por ahora lo encontramos en 1 comercio."
              : `Comparado en ${ofertas.length} comercios de tu zona${ahorro > 0 ? ` · hasta ${formatoPrecio(ahorro)} de diferencia` : ""}.`}
          </p>

          {/* La oferta que estoy viendo */}
          <div className={`mt-5 rounded-md border bg-gris-oscuro p-5 ${esLaMejor ? "border-amarillo" : "border-borde"}`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs text-gris-azulado">Estás viendo la oferta de</p>
                {/* Al tocar el comercio se abre su perfil */}
                <Link
                  to={`/tienda/${aSlug(producto.tienda.nombre)}`}
                  className="mt-0.5 block text-lg font-semibold hover:text-amarillo hover:underline"
                >
                  {producto.tienda.nombre}
                </Link>
                <p className="mt-0.5 text-[11px] text-gris-azulado">
                  {tiendaActual.tipo} · ★ {String(tiendaActual.rating).replace(".", ",")} · a {producto.distancia} ·{" "}
                  {tiendaActual.abierto ? "Abierto ahora" : "Cerrado ahora"}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <span className={`text-3xl font-bold ${esLaMejor ? "text-amarillo" : ""}`}>{formatoPrecio(producto.precio)}</span>
                  {descuentoActual > 0 && (
                    <span className="rounded-sm bg-rojo px-1.5 py-0.5 text-[10px] font-bold text-blanco">-{descuentoActual}%</span>
                  )}
                </div>
                {producto.precio_anterior && (
                  <p className="text-xs text-gris-azulado line-through">{formatoPrecio(producto.precio_anterior)}</p>
                )}
                {producto.cuotas && (
                  <p className="mt-1 text-xs font-semibold text-amarillo">
                    {producto.cuotas} cuotas de {formatoPrecio(producto.precio / producto.cuotas)}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-borde pt-4">
              {/* Cómo queda frente al resto */}
              {esLaMejor ? (
                <p className="text-xs font-semibold text-verde">
                  Es el mejor precio{ahorro > 0 ? `: ${formatoPrecio(ahorro)} menos que en ${masCara.tienda.nombre}` : ""}
                </p>
              ) : (
                <p className="text-xs text-gris-azulado">
                  <span className="font-semibold text-rojo">
                    +{formatoPrecio(sobrecostoActual)} (+{porcentajeActual}%)
                  </span>{" "}
                  que en {mejor.tienda.nombre}.{" "}
                  <Link to={`/producto/${mejor.id}`} className="text-azul hover:underline">Ver la mejor oferta →</Link>
                </p>
              )}
              <Link
                to={`/tienda/${aSlug(producto.tienda.nombre)}`}
                className="rounded-sm fondo-dorado px-5 py-2.5 text-xs font-semibold text-negro transition hover:brightness-110"
              >
                Ver comercio
              </Link>
            </div>

            {masCerca.id !== producto.id && ofertas.length > 1 && (
              <p className="mt-3 text-[11px] text-gris-azulado">
                El más cercano es{" "}
                <Link to={`/producto/${masCerca.id}`} className="text-azul hover:underline">{masCerca.tienda.nombre}</Link> (a {masCerca.distancia}).
              </p>
            )}
          </div>

          {/* Acciones. SpotMarket no vende, así que no hay carrito: se guarda, se avisa y se ve en el mapa.
              Favorito y alerta piden sesión: sin sesión te llevan al login y vuelven acá. */}
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
            <button
              onClick={() =>
                protegida(
                  () => alternarFavorito(producto.id),
                  favorito ? "quitar este producto de favoritos" : "guardar este producto en favoritos"
                )
              }
              aria-pressed={favorito}
              className={`cursor-pointer rounded-md border px-4 py-2 transition ${
                favorito ? "border-rojo bg-rojo text-blanco" : "border-rojo/50 text-rojo hover:bg-rojo/10"
              }`}
            >
              {favorito ? "♥ En favoritos" : "♡ Favorito"}
            </button>
            <button
              onClick={() => protegida(alternarAlerta, alertaActual ? "quitar la alerta de precio" : "activar la alerta de precio")}
              aria-pressed={Boolean(alertaActual)}
              className={`cursor-pointer rounded-md border px-4 py-2 transition ${
                alertaActual ? "border-amarillo bg-amarillo text-negro" : "border-amarillo/50 text-amarillo hover:bg-amarillo/10"
              }`}
            >
              {alertaActual ? "🔔 Alerta activada" : "Alerta de precio"}
            </button>
            <Link
              to={`/mapa?tienda=${encodeURIComponent(producto.tienda.nombre)}`}
              className="rounded-md border border-borde px-4 py-2 transition hover:border-blanco"
            >
              Ver en el mapa
            </Link>
          </div>

          {/* Precio objetivo de la alerta */}
          {alertaActual && (
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-md border border-amarillo/40 bg-amarillo/5 p-3 text-xs">
              <span>Avisarme si baja de</span>
              <span className="flex items-center rounded-sm border border-borde px-2">
                <span className="text-gris-azulado">$</span>
                <input
                  type="number"
                  min="1"
                  value={objetivo}
                  onChange={(e) => {
                    setObjetivo(e.target.value);
                    setAlertaGuardada(false);
                  }}
                  className="w-24 bg-transparent px-1 py-1.5 outline-none"
                />
              </span>
              <button onClick={guardarObjetivo} className="cursor-pointer rounded-sm fondo-dorado px-3 py-1.5 font-semibold text-negro transition hover:brightness-110">
                Guardar
              </button>
              {alertaGuardada && <span className="text-verde">✓ Guardada</span>}
              <Link to="/alertas" className="text-azul hover:underline">Ver mis alertas</Link>
            </div>
          )}

          {/* Puntuación: las estrellas piden sesión al hacer clic */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <p className="text-xs text-gris-azulado">Puntuá este producto:</p>
            <div className="flex" onMouseLeave={() => setEstrellaHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => protegida(() => setPuntuacion(n), "puntuar este producto")}
                  onMouseEnter={() => setEstrellaHover(n)}
                  aria-label={`Puntuar con ${n} ${n === 1 ? "estrella" : "estrellas"}`}
                  className={`cursor-pointer text-2xl leading-none transition ${
                    n <= (estrellaHover || puntuacion) ? "text-amarillo" : "text-borde"
                  }`}
                >
                  ★
                </button>
              ))}
            </div>
            {puntuacion > 0 && <span className="text-xs font-semibold text-amarillo">{puntuacion} de 5</span>}
          </div>
        </div>
      </div>

      {/* Opiniones: para escribir un comentario también hace falta tener sesión. Se guardan en tu perfil. */}
      <section className="mt-10">
        <h2 className="font-titulo text-lg font-bold">Opiniones</h2>

        <div className="mt-3 rounded-md border border-borde bg-gris-oscuro p-4">
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            // Si no hay sesión, al hacer clic en la caja te lleva al login
            onFocus={(e) => {
              if (!estaLogueado) {
                e.target.blur();
                protegida(() => {}, "comentar");
              }
            }}
            rows={3}
            placeholder="Contá tu experiencia con este producto..."
            className="w-full resize-none rounded-sm border border-borde bg-transparent p-3 text-xs outline-none focus:border-amarillo"
          />
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => protegida(enviarComentario, "comentar")}
              className="cursor-pointer rounded-sm fondo-dorado px-5 py-2 text-xs font-semibold text-negro transition hover:brightness-110"
            >
              Comentar
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-3">
          {misOpiniones.length === 0 && (
            <p className="text-xs text-gris-azulado">Todavía no hay comentarios. ¡Sé el primero!</p>
          )}
          {misOpiniones.map((o) => (
            <div key={o.id} className="rounded-md border border-borde bg-gris-oscuro p-4">
              <div className="flex items-center justify-between gap-2 text-[11px] text-gris-azulado">
                <span className="font-semibold text-blanco">Vos</span>
                <span className="flex items-center gap-3">
                  {haceCuanto(o.fecha, ahora)}
                  <button onClick={() => borrarOpinion(o.id)} className="cursor-pointer text-rojo hover:underline">Borrar</button>
                </span>
              </div>
              {o.puntuacion > 0 && (
                <p className="mt-1 text-xs text-amarillo">
                  {"★".repeat(o.puntuacion)}
                  <span className="text-borde">{"★".repeat(5 - o.puntuacion)}</span>
                </p>
              )}
              <p className="mt-2 text-xs">{o.texto}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Precios por comercio: salen de las publicaciones reales del catálogo.
          Cada fila abre la página de ESA oferta (ese comercio con su precio). */}
      <section className="mt-10">
        <h2 className="font-titulo text-lg font-bold">Precios por comercio</h2>
        <div className="mt-3 flex flex-col gap-3">
          {ofertas.map((oferta, i) => {
            const tienda = datosTienda(oferta.tienda.nombre);
            const esMejor = i === 0;
            const esMasCerca = oferta.id === masCerca.id && ofertas.length > 1;
            const esActual = oferta.id === producto.id;
            const descuento = oferta.precio_anterior ? Math.round((1 - oferta.precio / oferta.precio_anterior) * 100) : 0;
            // Cuánto más caro es respecto del mejor precio, en pesos y en porcentaje
            const sobrecosto = oferta.precio - mejor.precio;
            const porcentaje = Math.round((sobrecosto / mejor.precio) * 100);

            return (
              <Link key={oferta.id} to={`/producto/${oferta.id}`} className="block rounded-md">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.25, delay: i * 0.05 }}
                  className={`flex flex-wrap items-center justify-between gap-4 rounded-md border bg-gris-oscuro p-4 transition hover:shadow-lg hover:shadow-black/30 ${
                    esActual ? "border-amarillo ring-1 ring-amarillo/40" : "border-borde hover:border-amarillo/50"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* La fila entera es un Link, por eso el comercio navega con useNavigate */}
                      <span
                        role="link"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          navegar(`/tienda/${aSlug(oferta.tienda.nombre)}`);
                        }}
                        className="cursor-pointer text-sm font-semibold hover:text-amarillo hover:underline"
                      >
                        {oferta.tienda.nombre}
                      </span>
                      {esActual && (
                        <span className="rounded-sm border border-amarillo px-1.5 py-0.5 text-[10px] font-bold text-amarillo">ESTÁS VIENDO</span>
                      )}
                      {esMejor && ofertas.length > 1 && (
                        <span className="rounded-sm bg-amarillo px-1.5 py-0.5 text-[10px] font-bold text-negro">MÁS BARATO</span>
                      )}
                      {esMasCerca && (
                        <span className="rounded-sm bg-verde/20 px-1.5 py-0.5 text-[10px] font-bold text-verde">MÁS CERCA</span>
                      )}
                      <span className="rounded-sm bg-blanco/10 px-1.5 py-0.5 text-[10px]">{tienda.tipo}</span>
                      <span className="text-[11px] text-amarillo">★ {String(tienda.rating).replace(".", ",")}</span>
                      {!tienda.abierto && <span className="text-[10px] text-rojo">Cerrado ahora</span>}
                    </div>
                    <p className="mt-1 truncate text-xs text-gris-azulado">{oferta.nombre}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-gris-azulado">
                      <span>a {oferta.distancia}</span>
                      <span>· Actualizado {haceCuanto(oferta.createdAt, ahora)}</span>
                      {oferta.cuotas && (
                        <span className="rounded-sm bg-amarillo/15 px-1.5 py-0.5 font-semibold text-amarillo">
                          {oferta.cuotas} cuotas de {formatoPrecio(oferta.precio / oferta.cuotas)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-5">
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={`text-xl font-bold ${esMejor ? "text-amarillo" : ""}`}>{formatoPrecio(oferta.precio)}</span>
                        {descuento > 0 && (
                          <span className="rounded-sm bg-rojo px-1.5 py-0.5 text-[10px] font-bold text-blanco">-{descuento}%</span>
                        )}
                      </div>
                      {oferta.precio_anterior && (
                        <p className="text-[11px] text-gris-azulado line-through">{formatoPrecio(oferta.precio_anterior)}</p>
                      )}
                      {sobrecosto > 0 && (
                        <p className="text-[11px] font-semibold text-rojo">
                          +{formatoPrecio(sobrecosto)} (+{porcentaje}%)
                        </p>
                      )}
                    </div>
                    {/* Es un span y no un Link porque ya estamos dentro de un enlace (la fila entera) */}
                    <span
                      className={`rounded-sm px-4 py-2 text-xs font-semibold ${
                        esMejor ? "fondo-dorado text-negro" : "border border-borde"
                      }`}
                    >
                      Ver oferta
                    </span>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}