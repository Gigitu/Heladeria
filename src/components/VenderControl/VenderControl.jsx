import { useState } from "react";

// Selector de cantidad + botón "Vender"
// onVender(cantidad) debe ser async; mientras corre, el botón se desactiva
export default function VenderControl({ onVender, maximo }) {
  const [cantidad, setCantidad] = useState(1);
  const [vendiendo, setVendiendo] = useState(false);
  const agotado = maximo <= 0;

  const handleVender = async () => {
    setVendiendo(true);
    try {
      await onVender(cantidad);
      setCantidad(1);
    } finally {
      setVendiendo(false);
    }
  };

  if (agotado) {
    return <span className="badge text-bg-secondary px-3 py-2">Agotado</span>;
  }

  return (
    <div className="input-group input-group-sm vender-control">
      <input
        type="number"
        className="form-control"
        min={1}
        max={maximo}
        value={cantidad}
        onChange={(e) => setCantidad(Math.max(1, Math.min(maximo, Number(e.target.value) || 1)))}
        aria-label="Cantidad a vender"
      />
      <button className="btn btn-primary" onClick={handleVender} disabled={vendiendo}>
        {vendiendo ? "Vendiendo..." : "Vender"}
      </button>
    </div>
  );
}
