import Hero from "../componentes/inicio/Hero";
import CintaMarca from "../componentes/inicio/CintaMarca";
import ExploradorCategorias from "../componentes/inicio/ExploradorCategorias";
import CarruselProductos from "../componentes/inicio/CarruselProductos";
import SeccionMarca from "../componentes/inicio/SeccionMarca";
import BannerPromo from "../componentes/inicio/BannerPromo";
import BannerProductos from "../componentes/inicio/BannerProductos";
import BannerLugares from "../componentes/inicio/BannerLugares";
import BannerFinal from "../componentes/inicio/BannerFinal";
import { productos } from "../data/productos";

// Fecha de hoy, calculada una vez al cargar el archivo.
const hoy = Date.now();
// Cuántos días hacia atrás cuenta como "novedad". Para cambiarlo, edito este número.
const DIAS_NOVEDAD = 7;

// Ofertas: solo los productos con en_oferta en true.
const ofertas = productos.filter((producto) => producto.en_oferta);
// En cuotas: solo los que tienen el campo cuotas.
const enCuotas = productos.filter((producto) => producto.cuotas);
// Novedades: solo lo cargado en los últimos 7 días, lo más reciente primero.
// Novedades: solo lo cargado en los últimos 7 días (días enteros), lo más reciente primero.
const novedades = productos
  .filter((producto) => Math.floor((hoy - new Date(producto.createdAt)) / 86400000) <= DIAS_NOVEDAD)
  .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  .slice(0, 8);// Destacados: los que más "me gusta" tienen.
const destacados = [...productos].sort((a, b) => b.me_gusta - a.me_gusta).slice(0, 8);

export default function PaginaInicio() {
  return (
    <>
      <Hero />
      <CintaMarca />
      <ExploradorCategorias />

      {/* "ruta" es a dónde lleva el "Ver más →" de cada carrusel (el catálogo ya filtrado) */}
      <CarruselProductos titulo="Ofertas de la semana" productos={ofertas} ruta="/catalogo?oferta=true" />

      {/* Banner con foto del mercado (public/banners/mercado.jpg) */}
      <BannerPromo
        variante="dorado"
        titulo="Comprá más inteligente"
        texto="Compará precios entre comercios cerca tuyo y elegí dónde te conviene."
        boton="Comparar ahora"
        imagen="/banners/mercado.jpg"
      />

      <SeccionMarca />

      {/* Banner rojo con tarjetas de productos en cuotas */}
      <BannerProductos titulo="Productos en cuotas" boton="Ver productos" ruta="/catalogo?cuotas=true" productos={enCuotas} />

      {/* Novedades: el catálogo se abre ordenado por "más nuevos" y con el filtro de los últimos 7 días */}
      <CarruselProductos
        titulo="Últimas novedades"
        productos={novedades}
        ruta={`/catalogo?orden=nuevos&dias=${DIAS_NOVEDAD}`}
      />

      {/* Banner de comercios con la foto real (public/banners/local.jpg) */}
<BannerLugares
  titulo="Los comercios de tu barrio"
  texto="Conocé los locales de la zona y mirá qué venden."
  boton="Ver en el mapa"
  imagen="/banners/local.jpg"
/>

      <CarruselProductos titulo="Productos destacados" productos={destacados} ruta="/catalogo?orden=populares" />

      <BannerFinal />
    </>
  );
}