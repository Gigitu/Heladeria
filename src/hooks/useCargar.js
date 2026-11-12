import { useEffect, useState } from "react";

// Ejecuta una función async (consulta a Supabase) y devuelve { data, loading, error, recargar }.
// IMPORTANTE: la función debe venir envuelta en useCallback para no repetir la consulta en cada render.
export default function useCargar(cargar) {
  const [estado, setEstado] = useState({ data: null, loading: true, error: null });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let activo = true;
    cargar()
      .then((data) => activo && setEstado({ data, loading: false, error: null }))
      .catch((err) => activo && setEstado({ data: null, loading: false, error: err.message }));
    return () => {
      activo = false;
    };
  }, [cargar, version]);

  const recargar = () => setVersion((v) => v + 1);

  return { ...estado, recargar };
}
