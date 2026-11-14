import { useEffect } from "react";
import { useLocation } from "react-router";

// Cada vez que cambia la página (o los filtros que vienen en la dirección, como ?categoria=),
// vuelvo al principio. Si la dirección trae un # (ancla), dejo que el navegador vaya a ese lugar.
export default function useScrollArriba() {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    if (hash) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname, search, hash]);
}