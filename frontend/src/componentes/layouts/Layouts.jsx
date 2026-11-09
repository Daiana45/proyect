// Outlet: el hueco donde React Router dibuja la página que corresponde a la dirección.
import { Outlet } from "react-router";
import Navbar from "./Navbar";
import Footer from "./Footer";

// Marco común de todas las páginas: navbar arriba, la página en el medio y footer abajo.
export default function Layouts() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}