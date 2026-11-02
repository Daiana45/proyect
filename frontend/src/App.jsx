import Navbar from "./componentes/layouts/Navbar";
import Hero from "./componentes/inicio/Hero";

export default function App() {
  return (
    <>
      <Navbar activo="Inicio" />
      <Hero />
    </>
  );
}