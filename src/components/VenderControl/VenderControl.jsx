import { useState } from "react";
import { formatPrecio } from "../../utils/formato.js";

// Selector de cantidad + total a pagar + botón "Vender"
// onVender(cantidad) debe ser async; mientras corre, el botón se desactiva
export default function VenderControl({ onVender, maximo, precio }) {
  const [cantidad, setCantidad] = useState(1);
  const [vendiendo, setVendiendo] = useState(false);
  const agotado = maximo <= 0;

  // Lo que va a pagar el cliente: se recalcula cada vez que cambia la cantidad
  const total = Number(precio) * cantidad;

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
    <div className="d-flex flex-column align-items-end gap-1">
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
      {precio != null && (
        <small className="total-compra" aria-live="polite">
          Total: <strong>{formatPrecio(total)}</strong>
        </small>
      )}
    </div>
  );
}
