import { useState } from "react";
import { Link } from "react-router";
import FiltroGrupo from "./FiltroGrupo";

// Cómo muestro cada tipo de comercio.
const nombresTipo = {
  Cadena: "Cadenas y supermercados",
  Pyme: "Pymes y comercios de barrio",
  Mayorista: "Mayoristas",
  Kiosco: "Kioscos 24 hs",
  Feria: "Ferias y mercados",
};

// Rangos de precio rápidos: al tocar uno se completan el mínimo y el máximo.
const rangosPrecio = [
  { texto: "Hasta $5.000", min: "", max: "5000" },
  { texto: "$5.000 a $15.000", min: "5000", max: "15000" },
  { texto: "$15.000 a $30.000", min: "15000", max: "30000" },
  { texto: "Más de $30.000", min: "30000", max: "" },
];

// Opciones de los grupos de "elegir una sola" (botones de opción). valor null = sin filtro.
const distancias = [{ valor: null, texto: "Cualquiera" }, { valor: 1, texto: "Hasta 1 km" }, { valor: 2, texto: "Hasta 2 km" }, { valor: 3, texto: "Hasta 3 km" }, { valor: 5, texto: "Hasta 5 km" }];
const valoraciones = [{ valor: null, texto: "Todas" }, { valor: 4, texto: "★ 4 o más" }, { valor: 4.5, texto: "★ 4,5 o más" }];
const descuentos = [{ valor: null, texto: "Cualquiera" }, { valor: 10, texto: "10% o más" }, { valor: 20, texto: "20% o más" }, { valor: 30, texto: "30% o más" }];
const actualizaciones = [{ valor: null, texto: "Cualquier fecha" }, { valor: 1, texto: "Hoy y ayer" }, { valor: 7, texto: "Última semana" }, { valor: 30, texto: "Último mes" }];

// Cuántas opciones muestro antes del "Ver más".
const LIMITE = 5;
// Cuántas categorías muestro antes del "Ver más".
const LIMITE_CATEGORIAS = 12;

// Una casilla con su texto y la cantidad de resultados a la derecha.
// Si la cantidad es 0 y no está marcada, la muestro apagada (opacity-40).
function Casilla({ texto, cantidad, marcada, alCambiar }) {
  return (
    <label className={`flex cursor-pointer items-center gap-2 py-1 text-xs ${cantidad === 0 && !marcada ? "opacity-40" : ""}`}>
      <input type="checkbox" checked={marcada} onChange={alCambiar} className="accent-amarillo" />
      <span className="flex-1">{texto}</span>
      <span className="text-gris-azulado">{cantidad}</span>
    </label>
  );
}

// Lista de casillas: muestra las primeras LIMITE y el resto queda detrás de "Ver más".
function ListaCasillas({ opciones, elegidas, alCambiar, etiquetas = {} }) {
  const [todas, setTodas] = useState(false);
  const visibles = todas ? opciones : opciones.slice(0, LIMITE);

  return (
    <>
      {visibles.map((o) => (
        <Casilla key={o.nombre} texto={etiquetas[o.nombre] ?? o.nombre} cantidad={o.cantidad} marcada={elegidas.includes(o.nombre)} alCambiar={() => alCambiar(o.nombre)} />
      ))}
      {opciones.length > LIMITE && (
        <button onClick={() => setTodas(!todas)} className="mt-1 cursor-pointer text-xs text-azul hover:underline">
          {todas ? "Ver menos" : `Ver más (${opciones.length - LIMITE})`}
        </button>
      )}
    </>
  );
}

// Lista de categorías: muestra las primeras LIMITE_CATEGORIAS y el resto queda detrás de "Ver más".
// Si la categoría activa está más abajo, la muestro igual para que no desaparezca.
function ListaCategorias({ categorias, categoria, claseEnlace }) {
  const [todas, setTodas] = useState(false);
  const visibles = todas ? categorias : categorias.filter((nombre, i) => i < LIMITE_CATEGORIAS || nombre === categoria);

  return (
    <ul>
      <li><Link to="/catalogo" className={claseEnlace(!categoria)}>Todas</Link></li>
      {visibles.map((nombre) => (
        <li key={nombre}>
          <Link to={`/catalogo?categoria=${encodeURIComponent(nombre)}`} className={claseEnlace(categoria === nombre)}>{nombre}</Link>
        </li>
      ))}
      {categorias.length > LIMITE_CATEGORIAS && (
        <li>
          <button onClick={() => setTodas(!todas)} className="mt-1 cursor-pointer text-xs text-azul hover:underline">
            {todas ? "Ver menos" : `Ver más (${categorias.length - LIMITE_CATEGORIAS})`}
          </button>
        </li>
      )}
    </ul>
  );
}

// Botones de opción: se puede elegir una sola. "nombre" agrupa los botones entre sí.
function GrupoOpciones({ nombre, opciones, actual, alCambiar }) {
  return opciones.map((o) => (
    <label key={String(o.valor)} className="flex cursor-pointer items-center gap-2 py-1 text-xs">
      <input type="radio" name={nombre} checked={actual === o.valor} onChange={() => alCambiar(o.valor)} className="accent-amarillo" />
      {o.texto}
    </label>
  ));
}

// Columna izquierda con todos los filtros.
// Props: categoria (la activa), categorias, tipos/rubros/marcas/tiendas (opciones con cantidad), filtros (el estado),
// alternar (marca/desmarca en una lista) y cambiar (guarda un valor suelto).
export default function PanelFiltros({ categoria, categorias, tipos, rubros, marcas, tiendas, filtros, alternar, cambiar }) {
  const claseCampo = "w-full rounded-md border border-borde bg-gris-oscuro px-2 py-1.5 text-xs";
  const claseEnlace = (activa) => `block py-1 text-xs ${activa ? "font-semibold text-amarillo" : "hover:text-amarillo"}`;

  return (
    <div>
      {/* Categorías: enlaces, porque la categoría va en la dirección (?categoria=) */}
      <FiltroGrupo titulo="Categoría">
        <ListaCategorias categorias={categorias} categoria={categoria} claseEnlace={claseEnlace} />
      </FiltroGrupo>

      <FiltroGrupo titulo="Tipo de comercio">
        <ListaCasillas opciones={tipos} elegidas={filtros.tipos} alCambiar={(v) => alternar("tipos", v)} etiquetas={nombresTipo} />
      </FiltroGrupo>

      <FiltroGrupo titulo="Rubro">
        <ListaCasillas opciones={rubros} elegidas={filtros.rubros} alCambiar={(v) => alternar("rubros", v)} />
      </FiltroGrupo>

      <FiltroGrupo titulo="Marca">
        <ListaCasillas opciones={marcas} elegidas={filtros.marcas} alCambiar={(v) => alternar("marcas", v)} />
      </FiltroGrupo>

      <FiltroGrupo titulo="Comercio">
        <ListaCasillas opciones={tiendas} elegidas={filtros.tiendas} alCambiar={(v) => alternar("tiendas", v)} />
      </FiltroGrupo>

      {/* Precio: rangos rápidos arriba y campos de mínimo y máximo abajo */}
      <FiltroGrupo titulo="Precio">
        {rangosPrecio.map((r) => (
          <button
            key={r.texto}
            onClick={() => {
              cambiar("precioMin", r.min);
              cambiar("precioMax", r.max);
            }}
            className="block w-full cursor-pointer py-1 text-left text-xs hover:text-amarillo"
          >
            {r.texto}
          </button>
        ))}
        <div className="mt-2 flex items-center gap-2">
          <input type="number" min="0" placeholder="Mínimo" value={filtros.precioMin} onChange={(e) => cambiar("precioMin", e.target.value)} className={claseCampo} />
          <span className="text-gris-azulado">–</span>
          <input type="number" min="0" placeholder="Máximo" value={filtros.precioMax} onChange={(e) => cambiar("precioMax", e.target.value)} className={claseCampo} />
        </div>
      </FiltroGrupo>

      <FiltroGrupo titulo="Distancia">
        <GrupoOpciones nombre="radio" opciones={distancias} actual={filtros.radio} alCambiar={(v) => cambiar("radio", v)} />
      </FiltroGrupo>

      <FiltroGrupo titulo="Valoración del comercio">
        <GrupoOpciones nombre="valoracion" opciones={valoraciones} actual={filtros.valoracion} alCambiar={(v) => cambiar("valoracion", v)} />
      </FiltroGrupo>

      <FiltroGrupo titulo="Descuento">
        <GrupoOpciones nombre="descuento" opciones={descuentos} actual={filtros.descuento} alCambiar={(v) => cambiar("descuento", v)} />
      </FiltroGrupo>

      <FiltroGrupo titulo="Actualización del precio">
        <GrupoOpciones nombre="actualizado" opciones={actualizaciones} actual={filtros.actualizado} alCambiar={(v) => cambiar("actualizado", v)} />
      </FiltroGrupo>

      <FiltroGrupo titulo="Disponibilidad">
        <label className="flex cursor-pointer items-center gap-2 py-1 text-xs">
          <input type="checkbox" checked={filtros.abierto} onChange={(e) => cambiar("abierto", e.target.checked)} className="accent-amarillo" />
          Comercios abiertos ahora
        </label>
      </FiltroGrupo>

      <FiltroGrupo titulo="Promociones">
        <label className="flex cursor-pointer items-center gap-2 py-1 text-xs">
          <input type="checkbox" checked={filtros.soloOfertas} onChange={(e) => cambiar("soloOfertas", e.target.checked)} className="accent-amarillo" />
          Solo ofertas
        </label>
        <label className="flex cursor-pointer items-center gap-2 py-1 text-xs">
          <input type="checkbox" checked={filtros.soloCuotas} onChange={(e) => cambiar("soloCuotas", e.target.checked)} className="accent-amarillo" />
          En cuotas
        </label>
      </FiltroGrupo>
    </div>
  );
}