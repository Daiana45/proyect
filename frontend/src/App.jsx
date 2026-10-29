import LogoNavbar from "./componentes/LogoNavbar.svg";

export default function App() {
  return (
    <div className="min-h-screen bg-[#0B1220] flex items-center justify-center">
      <img src={LogoNavbar} alt="SpotMarket Logo" className="w-64 h-64" />
    </div>
  );
}