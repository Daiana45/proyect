// Importo el icono del logo (el pin con los anillos y las calles de fondo).
import logoNavbar from "../../assets/logos/LogoNavbar.svg";

// Logo del navbar: el icono + el nombre.
export default function Logo() {
  return (
    // gap-1: el espacio entre el icono y el nombre.
    <div className="flex items-center gap-1">
      {/* h-15 w-15: tamaño del icono (60px). shrink-0: nunca se achica ni se estira. alt vacío: el nombre ya está escrito al lado. */}
      <img src={logoNavbar} alt="" className="h-11 w-11 shrink-0" />

    {/* font-marca: mi fuente del logo (Lobster, una script gruesa estilo cartel).
    text-2xl: tamaño del nombre. Sin negrita: Lobster ya es gruesa y tiene un solo grosor.
    "Spot" en blanco y "Market" en dorado. */}
<span className="font-marca text-xl">
  Spot<span className="text-amarillo">Market</span>
</span>
    </div>
  );
}