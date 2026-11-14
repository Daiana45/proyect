// BrowserRouter: activa las direcciones (rutas) en toda la app.
// Routes y Route: la lista de "dirección → página".
import { BrowserRouter, Routes, Route } from "react-router";
import Layouts from "../componentes/layouts/Layouts";
import RutaPrivada from "../componentes/auth/RutaPrivada";
import PaginaInicio from "../pages/PaginaInicio";
import PaginaCatalogo from "../pages/PaginaCatalogo";
import PaginaProducto from "../pages/PaginaProducto";
import PaginaTienda from "../pages/PaginaTienda";
import PaginaMapa from "../pages/PaginaMapa";
import PaginaAcceso from "../pages/PaginaAcceso";
import PaginaPerfil from "../pages/PaginaPerfil";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layouts es el marco común (navbar + footer). Las páginas se dibujan adentro, en su <Outlet />. */}
        <Route element={<Layouts />}>
          {/* ---------- PÚBLICAS: las puede ver cualquiera ---------- */}
          <Route path="/" element={<PaginaInicio />} />
          <Route path="/catalogo" element={<PaginaCatalogo />} />
          <Route path="/producto/:id" element={<PaginaProducto />} />
          <Route path="/mapa" element={<PaginaMapa />} />
          <Route path="/tienda/:slug" element={<PaginaTienda />} />
          <Route path="/login" element={<PaginaAcceso modo="login" />} />
          <Route path="/registro" element={<PaginaAcceso modo="registro" />} />

          {/* ---------- PRIVADAS: piden login. Todo lo que ponga acá adentro queda protegido ---------- */}
          <Route element={<RutaPrivada />}>
            {/* Perfil del cliente: una sola página con secciones, cada una con su dirección */}
            <Route path="/perfil" element={<PaginaPerfil seccion="resumen" />} />
            <Route path="/favoritos" element={<PaginaPerfil seccion="favoritos" />} />
            <Route path="/alertas" element={<PaginaPerfil seccion="alertas" />} />
            <Route path="/opiniones" element={<PaginaPerfil seccion="opiniones" />} />
            <Route path="/ajustes" element={<PaginaPerfil seccion="ajustes" />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}