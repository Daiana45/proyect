// BrowserRouter: activa las direcciones (rutas) en toda la app.
// Routes y Route: la lista de "dirección → página".
import { BrowserRouter, Routes, Route } from "react-router";
import Layouts from "../componentes/layouts/Layouts";
import PaginaInicio from "../pages/PaginaInicio";
import PaginaCatalogo from "../pages/PaginaCatalogo";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Layouts es el marco común (navbar + footer). Las páginas se dibujan adentro, en su <Outlet />. */}
        <Route element={<Layouts />}>
          {/* "/" es la portada. Por ahora uso mi HomePage vieja, después la cambio por PaginaInicio. */}
          <Route path="/" element={<PaginaInicio />} />
          {/* Provisorio: un texto hasta que armemos la página del catálogo. */}
          <Route path="/catalogo" element={<PaginaCatalogo />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}