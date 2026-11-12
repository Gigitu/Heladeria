import { Link } from "react-router-dom";
import { Cargando, ErrorCarga } from "../../components/Estado/Estado.jsx";
import useCargar from "../../hooks/useCargar.js";
import { getRentabilidades } from "../../services/productosService.js";
import { formatPrecio } from "../../utils/formato.js";

// Solo admin: rentabilidad de cada producto y cuál es el más rentable
export default function Rentabilidad() {
  const { data, loading, error, recargar } = useCargar(getRentabilidades);

  if (loading) return <Cargando />;
  if (error) return <ErrorCarga mensaje={error} onReintentar={recargar} />;

  const [top] = data; // viene ordenado de mayor a menor
  const max = Math.max(...data.map((r) => r.rentabilidad), 1);

  return (
    <>
      <h1 className="h2 mb-4">Ganancias por producto</h1>

      {top && (
        <div className="card mb-4 top-rentable">
          <div className="card-body p-4 d-flex flex-wrap align-items-center gap-4">
            <div className="flex-grow-1">
              <div className="small text-uppercase fw-bold">El que más plata deja</div>
              <Link to={`/productos/${top.producto_id}`} className="h2 mb-1 d-block text-reset">{top.nombre}</Link>
              <div>
                Gana <strong>{formatPrecio(top.rentabilidad)}</strong> por unidad (precio {formatPrecio(top.precio_publico)} − costo {formatPrecio(top.costo)})
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card hoja">
        <div className="table-responsive">
          <table className="table align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Producto</th>
                <th className="text-end">Precio público</th>
                <th className="text-end">Costo</th>
                <th className="text-end">Rentabilidad</th>
                <th style={{ minWidth: 160 }}>Margen</th>
              </tr>
            </thead>
            <tbody>
              {data.map((r) => {
                const margen = r.precio_publico ? (r.rentabilidad / r.precio_publico) * 100 : 0;
                return (
                  <tr key={r.producto_id}>
                    <td className="fw-semibold">
                      <Link to={`/productos/${r.producto_id}`}>{r.nombre}</Link>
                    </td>
                    <td className="text-end">{formatPrecio(r.precio_publico)}</td>
                    <td className="text-end">{formatPrecio(r.costo)}</td>
                    <td className={`text-end fw-bold ${r.rentabilidad >= 0 ? "text-success" : "text-danger"}`}>
                      {formatPrecio(r.rentabilidad)}
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div className="progress flex-grow-1" role="progressbar" aria-label={`Margen ${r.nombre}`} aria-valuenow={Math.round(margen)} aria-valuemin={0} aria-valuemax={100}>
                          <div className="progress-bar" style={{ width: `${Math.max(0, (r.rentabilidad / max) * 100)}%` }} />
                        </div>
                        <small className="text-nowrap">{margen.toFixed(0)}%</small>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
