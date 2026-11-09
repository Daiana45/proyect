import AppRouter from "./router/AppRouter";

// App solo entrega el control al router: él decide qué página se ve según la dirección.
export default function App() {
  return <AppRouter />;
}