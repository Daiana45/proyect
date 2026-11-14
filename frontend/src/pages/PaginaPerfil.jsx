import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { productosCatalogo } from "../data/catalogo";
import { compararProducto } from "../utils/comparar";
import { haceCuanto } from "../utils/tiempo";
import { ahoraMs } from "../utils/ahora";
import useAuth from "../componentes/hooks/useAuth";
import useActividad from "../componentes/hooks/useActividad";
import TarjetaResultado from "../componentes/catalogo/TarjetaResultado";

// La hora se calcula una sola vez al cargar el archivo (no dentro del render)
const ahora = ahoraMs();

const formatoPrecio = (n) => `$${Math.round(n).toLocaleString("es-AR")}`;

// Algunos barrios de Formosa como sugerencia (se puede escribir cualquiera)
const BARRIOS = ["Centro", "Eva Perón", "Liborsi", "San Miguel", "Villa del Carmen", "Guadalupe", "Independencia", "Namqom", "Obrero"];

const buscarProducto = (id) => productosCatalogo.find((p) => p.id === id);

// Compara un producto con el mismo producto en los demás comercios
const comparar = (producto) => compararProducto(producto, productosCatalogo);

// Cómo está una alerta: el mejor precio actual contra el precio objetivo del usuario
const estadoAlerta = (alerta) => {
  const producto = buscarProducto(alerta.id);
  if (!producto) return null;
  const { mejor } = comparar(producto);
  return { producto, mejor, cumplida: mejor.precio <= alerta.objetivo, falta: mejor.precio - alerta.objetivo };
};

const campo = "w-full rounded-md border border-borde bg-transparent px-3 py-2.5 text-sm outline-none focus:border-amarillo";

// Avatar: la foto si hay, si no la inicial del nombre sobre dorado
function Avatar({ usuario, tamano = "h-20 w-20 text-3xl" }) {
  return (
    <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-gris-oscuro fondo-dorado font-titulo font-bold text-negro shadow-md ${tamano}`}>
      {usuario.avatar ? (
        <img src={usuario.avatar} alt="" className="h-full w-full object-cover" />
      ) : (
        (usuario.nombre?.[0] ?? "?").toUpperCase()
      )}
    </div>
  );
}

// Tarjeta de un dato importante del resumen
function Dato({ valor, titulo, detalle, color = "text-blanco", ruta }) {
  const contenido = (
    <div className="h-full rounded-md border border-borde bg-gris-oscuro p-4 transition hover:border-amarillo/50">
      <p className={`font-titulo text-2xl font-bold ${color}`}>{valor}</p>
      <p className="mt-1 text-xs font-semibold">{titulo}</p>
      {detalle && <p className="mt-0.5 text-[11px] text-gris-azulado">{detalle}</p>}
    </div>
  );
  return ruta ? <Link to={ruta}>{contenido}</Link> : contenido;
}

// Mensaje cuando una sección todavía no tiene nada
function Vacio({ texto, boton, ruta }) {
  return (
    <div className="rounded-md border border-dashed border-borde p-8 text-center">
      <p className="text-sm text-gris-azulado">{texto}</p>
      <Link to={ruta} className="mt-4 inline-block rounded-sm fondo-dorado px-5 py-2.5 text-xs font-semibold text-negro transition hover:brightness-110">
        {boton}
      </Link>
    </div>
  );
}

// ---------------------------------------------------------------- RESUMEN
function Resumen({ usuario }) {
  const { favoritos, alertas, opiniones } = useActividad();

  const productosFavoritos = favoritos.map(buscarProducto).filter(Boolean);
  // Lo que se ahorraría comprando cada favorito en el comercio más barato
  const ahorroTotal = productosFavoritos.reduce((suma, p) => suma + Math.max(0, p.precio - comparar(p).mejor.precio), 0);
  const cumplidas = alertas.map(estadoAlerta).filter((e) => e?.cumplida);

  // Barra de "completá tu perfil"
  const pasos = [
    { texto: "Tu nombre", hecho: Boolean(usuario.nombre) },
    { texto: "Tu barrio o zona", hecho: Boolean(usuario.barrio) },
    { texto: "Una foto de perfil", hecho: Boolean(usuario.avatar) },
    { texto: "Tu primer favorito", hecho: favoritos.length > 0 },
    { texto: "Tu primera alerta de precio", hecho: alertas.length > 0 },
  ];
  const porcentaje = Math.round((pasos.filter((p) => p.hecho).length / pasos.length) * 100);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-titulo text-2xl font-bold">Hola, {usuario.nombre}</h1>
        <p className="mt-1 text-xs text-gris-azulado">Esto es lo más importante de tu cuenta.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Dato valor={favoritos.length} titulo="Favoritos" detalle="Productos guardados" color="text-rojo" ruta="/favoritos" />
        <Dato
          valor={alertas.length}
          titulo="Alertas de precio"
          detalle={cumplidas.length > 0 ? `${cumplidas.length} ya en tu precio` : "Te avisamos cuando bajen"}
          color="text-amarillo"
          ruta="/alertas"
        />
        <Dato valor={opiniones.length} titulo="Opiniones" detalle="Comentarios que dejaste" color="text-azul" ruta="/opiniones" />
        <Dato
          valor={formatoPrecio(ahorroTotal)}
          titulo="Ahorro posible"
          detalle="Comprando tus favoritos en el comercio más barato"
          color="text-verde"
        />
      </div>

      {/* Alertas que ya se cumplieron: lo más importante */}
      {cumplidas.length > 0 && (
        <div className="rounded-md border border-verde/50 bg-verde/10 p-4">
          <p className="text-sm font-semibold text-verde">¡Tenés {cumplidas.length === 1 ? "una alerta cumplida" : `${cumplidas.length} alertas cumplidas`}!</p>
          <div className="mt-2 flex flex-col gap-1.5">
            {cumplidas.map(({ producto, mejor }) => (
              <Link key={producto.id} to={`/producto/${mejor.id}`} className="text-xs hover:underline">
                <span className="font-semibold">{producto.nombre}</span> está {formatoPrecio(mejor.precio)} en {mejor.tienda.nombre}
                <span className="text-azul"> · Ver oferta →</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Completar el perfil */}
        <div className="rounded-md border border-borde bg-gris-oscuro p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Completá tu perfil</p>
            <span className="text-xs font-bold text-amarillo">{porcentaje}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-borde">
            <div className="h-full rounded-full fondo-dorado transition-all" style={{ width: `${porcentaje}%` }} />
          </div>
          <ul className="mt-3 flex flex-col gap-1.5 text-xs">
            {pasos.map((p) => (
              <li key={p.texto} className={p.hecho ? "text-verde" : "text-gris-azulado"}>
                {p.hecho ? "✓" : "○"} {p.texto}
              </li>
            ))}
          </ul>
          {porcentaje < 100 && (
            <Link to="/ajustes" className="mt-3 inline-block text-xs text-azul hover:underline">Completar mis datos →</Link>
          )}
        </div>

        {/* Últimos favoritos */}
        <div className="rounded-md border border-borde bg-gris-oscuro p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Últimos favoritos</p>
            <Link to="/favoritos" className="text-xs text-azul hover:underline">Ver todos</Link>
          </div>
          {productosFavoritos.length === 0 ? (
            <p className="mt-3 text-xs text-gris-azulado">Todavía no guardaste ninguno. Tocá "♡ Favorito" en un producto.</p>
          ) : (
            <div className="mt-3 flex flex-col gap-2">
              {productosFavoritos.slice(0, 3).map((p) => (
                <Link key={p.id} to={`/producto/${p.id}`} className="flex items-center justify-between gap-3 rounded-sm border border-borde px-3 py-2 transition hover:border-amarillo/50">
                  <span className="min-w-0">
                    <span className="block truncate text-xs font-semibold">{p.nombre}</span>
                    <span className="block truncate text-[11px] text-gris-azulado">{p.tienda.nombre}</span>
                  </span>
                  <span className="shrink-0 text-sm font-bold">{formatoPrecio(p.precio)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 text-xs font-semibold">
        <Link to="/catalogo" className="rounded-sm fondo-dorado px-5 py-2.5 text-negro transition hover:brightness-110">Explorar el catálogo</Link>
        <Link to="/mapa" className="rounded-sm border border-borde px-5 py-2.5 transition hover:border-blanco">Ver comercios en el mapa</Link>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- FAVORITOS
const ORDENES_FAVORITOS = {
  recientes: () => 0,
  menor: (a, b) => a.producto.precio - b.producto.precio,
  mayor: (a, b) => b.producto.precio - a.producto.precio,
  ahorro: (a, b) => b.ahorro - a.ahorro,
};

function Favoritos() {
  const { favoritos, alternarFavorito } = useActividad();
  const [buscar, setBuscar] = useState("");
  const [orden, setOrden] = useState("recientes");

  const items = favoritos
    .map(buscarProducto)
    .filter(Boolean)
    .map((producto) => {
      const { mejor, ofertas } = comparar(producto);
      return { producto, mejor, ofertas, ahorro: Math.max(0, producto.precio - mejor.precio) };
    });

  const texto = buscar.trim().toLowerCase();
  const visibles = items
    .filter(({ producto }) => `${producto.nombre} ${producto.marca} ${producto.tienda.nombre}`.toLowerCase().includes(texto))
    .sort(ORDENES_FAVORITOS[orden]);

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-titulo text-2xl font-bold">Mis favoritos</h1>
        <p className="mt-1 text-xs text-gris-azulado">
          {items.length} {items.length === 1 ? "producto guardado" : "productos guardados"}
        </p>
      </div>

      {items.length === 0 ? (
        <Vacio texto="Todavía no guardaste favoritos. Tocá el corazón en cualquier producto para tenerlo a mano." boton="Explorar el catálogo" ruta="/catalogo" />
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            <input value={buscar} onChange={(e) => setBuscar(e.target.value)} placeholder="Buscar en mis favoritos..." className={`${campo} min-w-52 flex-1`} />
            <select value={orden} onChange={(e) => setOrden(e.target.value)} className="rounded-md border border-borde bg-gris-oscuro px-3 py-2 text-xs outline-none focus:border-amarillo">
              <option value="recientes">Agregados recientemente</option>
              <option value="menor">Menor precio</option>
              <option value="mayor">Mayor precio</option>
              <option value="ahorro">Mayor ahorro posible</option>
            </select>
          </div>

          {visibles.length === 0 && <p className="py-6 text-center text-xs text-gris-azulado">Ningún favorito coincide con tu búsqueda.</p>}

          <div className="grid gap-4 xl:grid-cols-2">
            {visibles.map(({ producto, mejor, ofertas, ahorro }) => (
              <div key={producto.id}>
                <div className="relative">
                  <TarjetaResultado producto={producto} />
                  {/* Quitar de favoritos */}
                  <button
                    onClick={() => alternarFavorito(producto.id)}
                    aria-label="Quitar de favoritos"
                    title="Quitar de favoritos"
                    className="absolute right-2 top-2 z-10 cursor-pointer rounded-full bg-rojo px-2 py-0.5 text-xs text-blanco shadow transition hover:brightness-110"
                  >
                    ♥
                  </button>
                </div>
                {ofertas.length <= 1 ? (
                  <p className="mt-1.5 px-1 text-[11px] text-gris-azulado">Solo lo encontramos en este comercio.</p>
                ) : ahorro > 0 ? (
                  <p className="mt-1.5 px-1 text-[11px] text-verde">
                    Más barato en{" "}
                    <Link to={`/producto/${mejor.id}`} className="font-semibold underline">{mejor.tienda.nombre}</Link>: {formatoPrecio(mejor.precio)} (ahorrás {formatoPrecio(ahorro)})
                  </p>
                ) : (
                  <p className="mt-1.5 px-1 text-[11px] text-verde">Es el mejor precio que encontramos.</p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- ALERTAS
function FilaAlerta({ alerta }) {
  const { guardarAlerta, quitarAlerta } = useActividad();
  const [texto, setTexto] = useState(String(alerta.objetivo));

  const estado = estadoAlerta(alerta);
  if (!estado) return null;

  const { producto, mejor, cumplida, falta } = estado;
  const nuevo = Number(texto);
  const hayCambio = nuevo > 0 && nuevo !== alerta.objetivo;

  return (
    <div className={`rounded-md border bg-gris-oscuro p-4 ${cumplida ? "border-verde/60" : "border-borde"}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <Link to={`/producto/${mejor.id}`} className="block truncate text-sm font-semibold hover:text-amarillo hover:underline">{producto.nombre}</Link>
          <p className="mt-0.5 text-[11px] text-gris-azulado">
            Mejor precio hoy: <span className="font-semibold text-blanco">{formatoPrecio(mejor.precio)}</span> en {mejor.tienda.nombre}
          </p>
        </div>
        {cumplida ? (
          <span className="rounded-sm bg-verde/20 px-2 py-1 text-[11px] font-bold text-verde">¡Ya está en tu precio!</span>
        ) : (
          <span className="rounded-sm bg-amarillo/15 px-2 py-1 text-[11px] font-bold text-amarillo">Faltan {formatoPrecio(falta)}</span>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-gris-azulado">Avisarme si baja de</span>
        <span className="flex items-center rounded-sm border border-borde px-2">
          <span className="text-gris-azulado">$</span>
          <input type="number" min="1" value={texto} onChange={(e) => setTexto(e.target.value)} className="w-24 bg-transparent px-1 py-1.5 outline-none" />
        </span>
        <button
          onClick={() => guardarAlerta(alerta.id, nuevo)}
          disabled={!hayCambio}
          className="cursor-pointer rounded-sm fondo-dorado px-3 py-1.5 font-semibold text-negro transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Guardar
        </button>
        <button onClick={() => quitarAlerta(alerta.id)} className="cursor-pointer rounded-sm border border-borde px-3 py-1.5 font-semibold text-rojo transition hover:border-rojo">
          Quitar alerta
        </button>
      </div>
    </div>
  );
}

function Alertas() {
  const { alertas } = useActividad();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-titulo text-2xl font-bold">Alertas de precio</h1>
        <p className="mt-1 text-xs text-gris-azulado">Elegís el precio que te gusta y te marcamos cuándo algún comercio llega a él.</p>
      </div>

      {alertas.length === 0 ? (
        <Vacio texto='Todavía no tenés alertas. Entrá a un producto y tocá "Alerta de precio".' boton="Buscar un producto" ruta="/catalogo" />
      ) : (
        <div className="flex flex-col gap-3">
          {alertas.map((a) => (
            <FilaAlerta key={a.id} alerta={a} />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- OPINIONES
function Opiniones() {
  const { opiniones, borrarOpinion } = useActividad();

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-titulo text-2xl font-bold">Mis opiniones</h1>
        <p className="mt-1 text-xs text-gris-azulado">Los comentarios que dejaste en los productos.</p>
      </div>

      {opiniones.length === 0 ? (
        <Vacio texto="Todavía no comentaste ningún producto. Tu experiencia ayuda a otros a elegir mejor." boton="Explorar el catálogo" ruta="/catalogo" />
      ) : (
        <div className="flex flex-col gap-3">
          {opiniones.map((o) => {
            const producto = buscarProducto(o.productoId);
            return (
              <div key={o.id} className="rounded-md border border-borde bg-gris-oscuro p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    {producto ? (
                      <Link to={`/producto/${producto.id}`} className="block truncate text-sm font-semibold hover:text-amarillo hover:underline">{producto.nombre}</Link>
                    ) : (
                      <p className="text-sm font-semibold">Producto que ya no está</p>
                    )}
                    <p className="text-[11px] text-gris-azulado">{haceCuanto(o.fecha, ahora)}</p>
                  </div>
                  <button onClick={() => borrarOpinion(o.id)} className="cursor-pointer text-[11px] text-rojo hover:underline">Borrar</button>
                </div>
                {o.puntuacion > 0 && (
                  <p className="mt-1 text-xs text-amarillo">
                    {"★".repeat(o.puntuacion)}
                    <span className="text-borde">{"★".repeat(5 - o.puntuacion)}</span>
                  </p>
                )}
                <p className="mt-2 text-xs">{o.texto}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- MIS DATOS
function Ajustes({ usuario }) {
  const { actualizarUsuario, cerrarSesion } = useAuth();
  const { vaciarActividad } = useActividad();
  const navegar = useNavigate();

  const [nombre, setNombre] = useState(usuario.nombre ?? "");
  const [barrio, setBarrio] = useState(usuario.barrio ?? "");
  const [avatar, setAvatar] = useState(usuario.avatar ?? "");
  const [error, setError] = useState("");
  const [guardado, setGuardado] = useState(false);
  const [confirmando, setConfirmando] = useState(false);

  const guardar = (e) => {
    e.preventDefault();
    if (nombre.trim().length < 2) {
      setError("Escribí tu nombre.");
      setGuardado(false);
      return;
    }
    setError("");
    actualizarUsuario({ nombre: nombre.trim(), barrio: barrio.trim(), avatar: avatar.trim() });
    setGuardado(true);
  };

  const salir = () => {
    cerrarSesion();
    navegar("/");
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-titulo text-2xl font-bold">Mis datos</h1>
        <p className="mt-1 text-xs text-gris-azulado">Así te ven en tus opiniones y en tu perfil.</p>
      </div>

      <form onSubmit={guardar} className="flex max-w-md flex-col gap-4">
        <label className="text-xs text-gris-azulado">
          Nombre
          <input value={nombre} onChange={(e) => { setNombre(e.target.value); setGuardado(false); }} className={`${campo} mt-1`} />
        </label>
        <label className="text-xs text-gris-azulado">
          Email
          <input value={usuario.email} readOnly className={`${campo} mt-1 cursor-not-allowed opacity-60`} />
        </label>
        <label className="text-xs text-gris-azulado">
          Barrio o zona (Formosa)
          <input list="barrios" value={barrio} onChange={(e) => { setBarrio(e.target.value); setGuardado(false); }} placeholder="Ej: Centro" className={`${campo} mt-1`} />
          <datalist id="barrios">
            {BARRIOS.map((b) => (
              <option key={b} value={b} />
            ))}
          </datalist>
        </label>
        <label className="text-xs text-gris-azulado">
          Foto de perfil (dirección de una imagen, opcional)
          <input value={avatar} onChange={(e) => { setAvatar(e.target.value); setGuardado(false); }} placeholder="https://..." className={`${campo} mt-1`} />
        </label>

        <div className="flex items-center gap-3">
          <Avatar usuario={{ nombre, avatar }} tamano="h-14 w-14 text-xl" />
          <p className="text-[11px] text-gris-azulado">Vista previa de tu foto</p>
        </div>

        {error && <p className="text-xs text-rojo">{error}</p>}
        {guardado && <p className="text-xs text-verde">✓ Cambios guardados.</p>}

        <button type="submit" className="cursor-pointer rounded-sm fondo-dorado px-5 py-2.5 text-sm font-semibold text-negro transition hover:brightness-110 md:w-fit">
          Guardar cambios
        </button>
      </form>

      <div className="max-w-md rounded-md border border-borde p-4">
        <p className="text-sm font-semibold">Tu actividad</p>
        <p className="mt-1 text-[11px] text-gris-azulado">Borra tus favoritos, alertas y opiniones. Esto no se puede deshacer.</p>
        {confirmando ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-rojo">¿Seguro?</span>
            <button
              onClick={() => {
                vaciarActividad();
                setConfirmando(false);
              }}
              className="cursor-pointer rounded-sm bg-rojo px-3 py-1.5 font-semibold text-blanco"
            >
              Sí, borrar todo
            </button>
            <button onClick={() => setConfirmando(false)} className="cursor-pointer rounded-sm border border-borde px-3 py-1.5 font-semibold">Cancelar</button>
          </div>
        ) : (
          <button onClick={() => setConfirmando(true)} className="mt-3 cursor-pointer rounded-sm border border-borde px-3 py-1.5 text-xs font-semibold text-rojo transition hover:border-rojo">
            Vaciar mi actividad
          </button>
        )}
      </div>

      <button onClick={salir} className="w-fit cursor-pointer rounded-sm border border-borde px-5 py-2.5 text-xs font-semibold transition hover:border-blanco">
        Cerrar sesión
      </button>
    </div>
  );
}

// ---------------------------------------------------------------- PÁGINA
// Prop: seccion ("resumen", "favoritos", "alertas", "opiniones" o "ajustes"). Cada una tiene su dirección en el router.
export default function PaginaPerfil({ seccion = "resumen" }) {
  const { usuario, cerrarSesion } = useAuth();
  const { favoritos, alertas, opiniones } = useActividad();
  const navegar = useNavigate();

  if (!usuario) return null;

  const menu = [
    { clave: "resumen", ruta: "/perfil", texto: "Resumen" },
    { clave: "favoritos", ruta: "/favoritos", texto: "Favoritos", cuenta: favoritos.length },
    { clave: "alertas", ruta: "/alertas", texto: "Alertas de precio", cuenta: alertas.length },
    { clave: "opiniones", ruta: "/opiniones", texto: "Mis opiniones", cuenta: opiniones.length },
    { clave: "ajustes", ruta: "/ajustes", texto: "Mis datos" },
  ];

  const miembroDesde = usuario.desde
    ? new Date(usuario.desde).toLocaleDateString("es-AR", { month: "long", year: "numeric" })
    : null;

  const salir = () => {
    cerrarSesion();
    navegar("/");
  };

  return (
    <div className="pb-12">
      {/* Banda de color de arriba */}
      <div className="h-40 w-full bg-linear-to-r from-rojo-oscuro via-rojo/50 to-amarillo/70 md:h-48" />

      <div className="relative z-10 mx-auto -mt-20 max-w-6xl px-4">
        <div className="flex flex-col gap-6 md:flex-row">
          {/* ---------- Menú lateral ---------- */}
          <aside className="h-fit w-full shrink-0 rounded-md border border-borde bg-gris-oscuro p-4 md:w-64">
            <div className="flex flex-col items-center border-b border-borde pb-4 text-center">
              <div className="-mt-12 mb-2">
                <Avatar usuario={usuario} />
              </div>
              <h2 className="max-w-full truncate font-titulo text-lg font-bold">{usuario.nombre}</h2>
              <p className="max-w-full truncate text-xs text-gris-azulado">{usuario.email}</p>
              {usuario.barrio && <p className="mt-1 text-[11px] text-gris-azulado">📍 {usuario.barrio}, Formosa</p>}
              {miembroDesde && <p className="mt-1 text-[10px] text-gris-azulado">Miembro desde {miembroDesde}</p>}
            </div>

            <nav className="mt-3 flex gap-1 overflow-x-auto md:flex-col">
              {menu.map((item) => (
                <Link
                  key={item.clave}
                  to={item.ruta}
                  aria-current={seccion === item.clave ? "page" : undefined}
                  className={`flex shrink-0 items-center justify-between gap-3 rounded-md px-4 py-2 text-sm font-medium transition ${
                    seccion === item.clave ? "fondo-dorado font-bold text-negro" : "text-gris-azulado hover:bg-blanco/5 hover:text-blanco"
                  }`}
                >
                  {item.texto}
                  {item.cuenta > 0 && (
                    <span className={`rounded-full px-2 text-[10px] font-bold ${seccion === item.clave ? "bg-negro/20" : "bg-borde"}`}>{item.cuenta}</span>
                  )}
                </Link>
              ))}
              <button onClick={salir} className="mt-1 shrink-0 cursor-pointer rounded-md px-4 py-2 text-left text-sm font-medium text-rojo transition hover:bg-rojo/10">
                Cerrar sesión
              </button>
            </nav>
          </aside>

          {/* ---------- Contenido de la sección ---------- */}
          <main className="min-w-0 flex-1 rounded-md border border-borde bg-negro/40 p-5 backdrop-blur md:p-7">
            {seccion === "resumen" && <Resumen usuario={usuario} />}
            {seccion === "favoritos" && <Favoritos />}
            {seccion === "alertas" && <Alertas />}
            {seccion === "opiniones" && <Opiniones />}
            {seccion === "ajustes" && <Ajustes usuario={usuario} />}
          </main>
        </div>
      </div>
    </div>
  );
}