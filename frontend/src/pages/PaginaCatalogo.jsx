import { useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router";
import { productosCatalogo as productos } from "../data/catalogo";
import { categorias } from "../data/categorias";
import { datosTienda } from "../data/tiendas";
import { aKm } from "../utils/textoDistancia";
import TarjetaResultado from "../componentes/catalogo/TarjetaResultado";
import PanelFiltros from "../componentes/catalogo/PanelFiltros";

// Fecha de hoy, calculada una vez al cargar el archivo (afuera del componente para que no cambie en cada render).
const hoy = Date.now();

// Cómo arranca el estado de los filtros (todo vacío). Lo uso también para "Limpiar todo".
const filtrosIniciales = {
  tipos: [], marcas: [], tiendas: [],
  precioMin: "", precioMax: "",
  radio: null, valoracion: null, descuento: null, actualizado: null,
  abierto: false, soloOfertas: false, soloCuotas: false,
};

function ContenidoCatalogo() {
  // Lo que viene en la dirección: /catalogo?categoria=Hogar&buscar=velas&oferta=true&orden=nuevos&dias=7...
  const [parametros] = useSearchParams();
  const categoria = parametros.get("categoria") ?? "";
  const buscar = (parametros.get("buscar") ?? "").toLowerCase();

  // Los filtros y el orden arrancan con lo que venga en la dirección
  // (?oferta=true, ?cuotas=true, ?marca=Arcor, ?dias=7, ?orden=nuevos...)
  const [filtros, setFiltros] = useState({
    ...filtrosIniciales,
    soloOfertas: parametros.get("oferta") === "true",
    soloCuotas: parametros.get("cuotas") === "true",
    marcas: parametros.get("marca") ? [parametros.get("marca")] : [],
    actualizado: parametros.get("dias") ? Number(parametros.get("dias")) : null,
  });
  const [orden, setOrden] = useState(parametros.get("orden") ?? "menor");
  // En pantallas chicas el panel de filtros se muestra o esconde con un botón
  const [verFiltros, setVerFiltros] = useState(false);

  // Marca o desmarca un valor dentro de una lista (marcas, tiendas, tipos)
  const alternar = (clave, valor) =>
    setFiltros((f) => ({ ...f, [clave]: f[clave].includes(valor) ? f[clave].filter((v) => v !== valor) : [...f[clave], valor] }));
  // Guarda un valor suelto (precio, radio, ofertas...)
  const cambiar = (clave, valor) => setFiltros((f) => ({ ...f, [clave]: valor }));

  // 1) Base: productos de la categoría y la búsqueda (lo que viene de la dirección)
  const base = productos.filter((producto) => {
    const coincideCategoria = !categoria || producto.categorias.some((c) => c.nombre === categoria);
    const texto = `${producto.nombre} ${producto.marca} ${producto.tienda.nombre}`.toLowerCase();
    return coincideCategoria && (!buscar || texto.includes(buscar));
  });

  // 2) Sobre la base aplico los filtros del panel
  const filtrados = base.filter((p) => {
    const { tipos, marcas, tiendas, precioMin, precioMax, radio, valoracion, descuento, actualizado, abierto, soloOfertas, soloCuotas } = filtros;
    const tienda = datosTienda(p.tienda.nombre);
    // Porcentaje de descuento: cuánto bajó el precio respecto del anterior
    const porcentaje = p.precio_anterior ? (1 - p.precio / p.precio_anterior) * 100 : 0;
    // Días enteros desde que se actualizó el precio (0 = hoy, 1 = ayer...). Igual que "hace N días" de la tarjeta.
    const dias = Math.floor((hoy - new Date(p.createdAt)) / 86400000);

    return (
      (!tipos.length || tipos.includes(tienda.tipo)) &&
      (!marcas.length || marcas.includes(p.marca)) &&
      (!tiendas.length || tiendas.includes(p.tienda.nombre)) &&
      (precioMin === "" || p.precio >= Number(precioMin)) &&
      (precioMax === "" || p.precio <= Number(precioMax)) &&
      (!radio || aKm(p.distancia) <= radio) &&
      (!valoracion || tienda.rating >= valoracion) &&
      (!descuento || porcentaje >= descuento) &&
      (!actualizado || dias <= actualizado) &&
      (!abierto || tienda.abierto) &&
      (!soloOfertas || p.en_oferta) &&
      (!soloCuotas || p.cuotas)
    );
  });

  // 3) Ordeno una copia. Si el orden de la dirección no existe, uso "menor".
  const ordenadores = {
    menor: (a, b) => a.precio - b.precio,
    mayor: (a, b) => b.precio - a.precio,
    cerca: (a, b) => aKm(a.distancia) - aKm(b.distancia),
    nuevos: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    populares: (a, b) => b.me_gusta - a.me_gusta,
  };
  const resultados = [...filtrados].sort(ordenadores[orden] ?? ordenadores.menor);

  // Arma las opciones de un filtro (marcas, tiendas, tipos).
  // La lista sale de TODOS los productos, así las opciones son siempre las mismas aunque cambie la categoría.
  // El número (cantidad) cuenta solo los de la base actual: si no hay ninguno, queda en 0.
  const contar = (campo) => {
    const cuenta = {};
    productos.forEach((p) => {
      cuenta[campo(p)] = 0;
    });
    base.forEach((p) => {
      cuenta[campo(p)] += 1;
    });
    return Object.entries(cuenta)
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  };

  // Filtros activos: cada uno con su texto y cómo quitarlo (las etiquetas con ✕)
  const activos = [
    ...filtros.tipos.map((v) => ({ texto: v, quitar: () => alternar("tipos", v) })),
    ...filtros.marcas.map((v) => ({ texto: v, quitar: () => alternar("marcas", v) })),
    ...filtros.tiendas.map((v) => ({ texto: v, quitar: () => alternar("tiendas", v) })),
    ...(filtros.precioMin !== "" ? [{ texto: `Desde $${filtros.precioMin}`, quitar: () => cambiar("precioMin", "") }] : []),
    ...(filtros.precioMax !== "" ? [{ texto: `Hasta $${filtros.precioMax}`, quitar: () => cambiar("precioMax", "") }] : []),
    ...(filtros.radio ? [{ texto: `Hasta ${filtros.radio} km`, quitar: () => cambiar("radio", null) }] : []),
    ...(filtros.valoracion ? [{ texto: `★ ${filtros.valoracion}+`, quitar: () => cambiar("valoracion", null) }] : []),
    ...(filtros.descuento ? [{ texto: `${filtros.descuento}% off o más`, quitar: () => cambiar("descuento", null) }] : []),
    ...(filtros.actualizado ? [{ texto: `Últimos ${filtros.actualizado} días`, quitar: () => cambiar("actualizado", null) }] : []),
    ...(filtros.abierto ? [{ texto: "Abiertos ahora", quitar: () => cambiar("abierto", false) }] : []),
    ...(filtros.soloOfertas ? [{ texto: "Solo ofertas", quitar: () => cambiar("soloOfertas", false) }] : []),
    ...(filtros.soloCuotas ? [{ texto: "En cuotas", quitar: () => cambiar("soloCuotas", false) }] : []),
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Panel de filtros: en pantallas chicas se muestra solo si toco "Filtros" */}
        <aside className={`${verFiltros ? "block" : "hidden"} lg:block`}>
          <PanelFiltros
            categoria={categoria}
            categorias={categorias}
            tipos={contar((p) => datosTienda(p.tienda.nombre).tipo)}
            marcas={contar((p) => p.marca)}
            tiendas={contar((p) => p.tienda.nombre)}
            filtros={filtros}
            alternar={alternar}
            cambiar={cambiar}
          />
        </aside>

        <section>
          {/* Migas de pan */}
          <p className="text-xs text-gris-azulado">
            <Link to="/" className="hover:underline">Inicio</Link> ›{" "}
            <Link to="/catalogo" className="hover:underline">Catálogo</Link>
            {categoria && <span className="text-azul"> › {categoria}</span>}
          </p>

          {/* Cantidad, botón de filtros (solo en pantallas chicas) y orden */}
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-gris-azulado">{resultados.length} resultados</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setVerFiltros(!verFiltros)} className="cursor-pointer rounded-md border border-borde px-3 py-1.5 text-xs lg:hidden">
                Filtros
              </button>
              <select value={orden} onChange={(e) => setOrden(e.target.value)} className="rounded-md border border-borde bg-gris-oscuro px-3 py-1.5 text-xs">
                <option value="menor">Menor precio</option>
                <option value="mayor">Mayor precio</option>
                <option value="cerca">Más cerca</option>
                <option value="nuevos">Más nuevos</option>
                <option value="populares">Más populares</option>
              </select>
            </div>
          </div>

          {/* Filtros activos como etiquetas con ✕ y botón para limpiar todo */}
          {activos.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {activos.map((a) => (
                <button key={a.texto} onClick={a.quitar} className="cursor-pointer rounded-full border border-amarillo px-2.5 py-1 text-[11px] text-amarillo hover:bg-amarillo hover:text-negro">
                  {a.texto} ✕
                </button>
              ))}
              <button onClick={() => setFiltros(filtrosIniciales)} className="cursor-pointer text-[11px] text-gris-azulado underline hover:text-blanco">
                Limpiar todo
              </button>
            </div>
          )}

          <div className="mt-3 flex flex-col gap-3">
            {resultados.map((producto) => (
              <TarjetaResultado key={producto.id} producto={producto} />
            ))}
            {resultados.length === 0 && <p className="text-sm text-gris-azulado">No encontré productos con esos filtros.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

// Envoltorio: le pone como "key" lo que viene después del "?" de la dirección.
// Así, cuando cambia (por ejemplo de "Ofertas" a "Novedades"), la página se arma de cero con los filtros nuevos.
export default function PaginaCatalogo() {
  const { search } = useLocation();
  return <ContenidoCatalogo key={search} />;
}