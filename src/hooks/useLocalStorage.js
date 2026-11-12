import { useEffect, useState } from "react";

// Igual que useState, pero guarda el valor en localStorage para no perderlo al recargar
export default function useLocalStorage(key, valorInicial) {
  const [valor, setValor] = useState(() => {
    try {
      const guardado = localStorage.getItem(key);
      return guardado !== null ? JSON.parse(guardado) : valorInicial;
    } catch {
      return valorInicial;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(valor));
    } catch {
      /* si localStorage no está disponible, seguimos solo en memoria */
    }
  }, [key, valor]);

  return [valor, setValor];
}
