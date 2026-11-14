// Hora actual en milisegundos. Está en un archivo aparte porque React no deja llamar a Date.now() adentro de un componente (no es una función "pura").
export const ahoraMs = () => Date.now();