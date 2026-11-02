import logoFull from "../../assets/logos/logo-mark.svg";

// Componente reutilizable. Recibe "className" para que quien lo use pueda agregarle estilos extra (por ejemplo, otro tamaño de texto). Si no le pasan nada, className vale "" (texto vacío).
export default function Logo({ className = "" }) {
  return (
    // inline-flex: pone el ícono y el texto en la misma fila. items-center: los centra verticalmente. gap-1: separación entre ellos.${className}: acá se agregan los estilos que vengan de afuera.
    <span className={`inline-flex items-center gap-1 font-marca text-sm tracking-wide ${className}`}>
        <img src={logoFull} alt="Logo SpotMarket" className="h-14 w-auto" />
      {/* "Spot" en blanco (el color heredado) y "Market" en amarillo. */}
      <span className="font-normal">Spot<span className="font-black text-amarillo">Market</span></span>
    </span>
  );
}
