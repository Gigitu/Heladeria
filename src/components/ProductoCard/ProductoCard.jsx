import { Link } from "react-router-dom";
import useAuth from "../../hooks/useAuth.js";
import { emojiProducto, formatPrecio } from "../../utils/formato.js";
import { detalleTipo, unidadesDisponibles } from "../../utils/productos.js";
import VenderControl from "../VenderControl/VenderControl.jsx";
import "./ProductoCard.css";

// Tarjeta de un producto. Lo que se muestra depende del rol:
//  público: nombre, precio, ingredientes | cliente: + calorías y vender
//  empleado: + costo                     | admin: + rentabilidad
export default function ProductoCard({ producto, onVender, esMasRentable = false }) {
  const { can } = useAuth();
  const disponibles = unidadesDisponibles(producto.ingredientes);

  return (
    <div className={`card producto-card h-100 ${esMasRentable ? "mas-rentable" : ""}`}>
      {esMasRentable && <span className="ribbon">★ la que más deja</span>}

      <div className={`producto-hero producto-${producto.tipo}`}>
        <span aria-hidden="true">{emojiProducto(producto.tipo)}</span>
      </div>

      <div className="card-body d-flex flex-column gap-2">
        <div className="d-flex justify-content-between align-items-start gap-2">
          <h3 className="h5 card-title mb-0">{producto.nombre}</h3>
          <span className="precio">{formatPrecio(producto.precio_publico)}</span>
        </div>

        <div className="d-flex flex-wrap gap-1">
          <small className="text-secondary text-capitalize">
            {producto.tipo} · {detalleTipo(producto)}
          </small>
        </div>

        <div className="d-flex flex-wrap gap-1">
          {producto.ingredientes.map((ing, i) => (
            <span key={`${ing.id}-${i}`} className={`chip-ing chip-${ing.tipo}`}>
              {ing.nombre}
            </span>
          ))}
        </div>

        {/* Métricas según permisos */}
        {(can("verCalorias") || can("verCosto")) && (
          <div className="metricas">
            {can("verCalorias") && (
              <div><small>Calorías</small><strong>{producto.calorias} kcal</strong></div>
            )}
            {can("verCosto") && producto.costo !== null && (
              <div><small>Costo</small><strong>{formatPrecio(producto.costo)}</strong></div>
            )}
            {can("verRentabilidad") && producto.rentabilidad !== null && (
              <div><small>Rentabilidad</small><strong className="text-success">{formatPrecio(producto.rentabilidad)}</strong></div>
            )}
          </div>
        )}

        <div className="mt-auto pt-2 d-flex flex-wrap align-items-center justify-content-between gap-2">
          <Link to={`/productos/${producto.id}`} className="small fw-bold">Ver más</Link>
          {can("vender") && onVender && (
            <VenderControl
              maximo={disponibles}
              precio={producto.precio_publico}
              onVender={(cant) => onVender(producto, cant)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
