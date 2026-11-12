import { Cargando, ErrorCarga } from "../../components/Estado/Estado.jsx";
import useCargar from "../../hooks/useCargar.js";
import { getVentasDelDia } from "../../services/ventasService.js";
import { emojiProducto, formatHora, formatPrecio } from "../../utils/formato.js";

// Contador de ventas del día (admin y empleado)
export default function Ventas() {
  const { data, loading, error, recargar } = useCargar(getVentasDelDia);

  return (
    <>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <h1 className="h2 mb-0">Caja de hoy</h1>
        <button className="btn btn-outline-primary" onClick={recargar}>↻ Actualizar</button>
      </div>

      {loading && <Cargando />}
      {error && <ErrorCarga mensaje={error} onReintentar={recargar} />}

      {data && (
        <>
          <div className="row g-3 mb-4">
            <Contador titulo="Ventas realizadas" valor={data.resumen.numeroVentas} icono="🧾" />
            <Contador titulo="Productos vendidos" valor={data.resumen.unidades} icono="🍨" />
            <Contador titulo="Total vendido" valor={formatPrecio(data.resumen.total)} icono="💵" />
          </div>

          <div className="card hoja">
            <div className="table-responsive">
              <table className="table align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Hora</th>
                    <th>Producto</th>
                    <th className="text-center">Cantidad</th>
                    <th className="text-end">Total</th>
                    <th>Vendido por</th>
                  </tr>
                </thead>
                <tbody>
                  {data.ventas.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center text-secondary py-4">Aún no hay ventas hoy</td>
                    </tr>
                  )}
                  {data.ventas.map((v) => (
                    <tr key={v.id}>
                      <td>{formatHora(v.fecha)}</td>
                      <td>{emojiProducto(v.producto?.tipo)} {v.producto?.nombre ?? "—"}</td>
                      <td className="text-center">{v.cantidad}</td>
                      <td className="text-end fw-semibold">{formatPrecio(v.total)}</td>
                      <td className="text-secondary">{v.usuario?.nombre ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </>
  );
}

function Contador({ titulo, valor, icono }) {
  return (
    <div className="col-md-4">
      <div className="card hoja h-100">
        <div className="card-body d-flex align-items-center gap-3">
          <span className="fs-1" aria-hidden="true">{icono}</span>
          <div>
            <div className="small text-secondary text-uppercase">{titulo}</div>
            <div className="fs-3 fw-bold">{valor}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
