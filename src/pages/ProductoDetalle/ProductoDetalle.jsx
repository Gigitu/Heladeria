import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Aviso, Cargando, ErrorCarga } from "../../components/Estado/Estado.jsx";
import VenderControl from "../../components/VenderControl/VenderControl.jsx";
import useAuth from "../../hooks/useAuth.js";
import useCargar from "../../hooks/useCargar.js";
import {
  getCaloriasProducto,
  getCostoProducto,
  getProductoPorId,
  getRentabilidadProducto,
  venderProducto,
} from "../../services/productosService.js";
import { emojiProducto, formatPrecio } from "../../utils/formato.js";
import { detalleTipo, unidadesDisponibles } from "../../utils/productos.js";

// Detalle de un producto: usa las consultas "por ID" de la API
export default function ProductoDetalle() {
  const { id } = useParams();
  const { usuario, can } = useAuth();
  const [aviso, setAviso] = useState(null);

  const verCalorias = can("verCalorias");
  const verCosto = can("verCosto");
  const verRentabilidad = can("verRentabilidad");
  const verInventario = can("gestionarIngredientes");

  const cargar = useCallback(async () => {
    const producto = await getProductoPorId(id);
    if (!producto) return null;
    const [calorias, costo, rentabilidad] = await Promise.all([
      verCalorias ? getCaloriasProducto(id) : null,
      verCosto ? getCostoProducto(id) : null,
      verRentabilidad ? getRentabilidadProducto(id) : null,
    ]);
    return { ...producto, calorias, costo, rentabilidad };
  }, [id, verCalorias, verCosto, verRentabilidad]);

  const { data: producto, loading, error, recargar } = useCargar(cargar);

  const handleVender = async (cantidad) => {
    try {
      await venderProducto(producto.id, cantidad, usuario?.id ?? null);
      setAviso({ tipo: "success", texto: `✅ Vendiste ${cantidad} × ${producto.nombre}` });
      recargar();
    } catch (err) {
      setAviso({ tipo: "danger", texto: `❌ ${err.message}` });
    }
  };

  if (loading) return <Cargando />;
  if (error) return <ErrorCarga mensaje={error} onReintentar={recargar} />;
  if (!producto) {
    return (
      <div className="text-center py-5">
        <h2>Producto no encontrado</h2>
        <Link to="/">Volver al menú</Link>
      </div>
    );
  }

  const margen = producto.rentabilidad !== null ? (producto.rentabilidad / producto.precio_publico) * 100 : null;

  return (
    <>
      <Link to="/" className="btn btn-link px-0 mb-3">← Volver al menú</Link>
      <Aviso aviso={aviso} onCerrar={() => setAviso(null)} />

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card hoja overflow-hidden">
            <div className={`producto-hero producto-${producto.tipo}`} style={{ height: 220, fontSize: 110 }}>
              <span aria-hidden="true">{emojiProducto(producto.tipo)}</span>
            </div>
            <div className="card-body">
              <h1 className="h3">{producto.nombre}</h1>
              <p className="mb-2">
                <span className="badge rounded-pill text-bg-light text-capitalize me-1">{producto.tipo}</span>
                <span className="badge rounded-pill text-bg-light">{detalleTipo(producto)}</span>
              </p>
              <p className="fs-3 fw-bold precio mb-3">{formatPrecio(producto.precio_publico)}</p>
              {can("vender") && (
                <VenderControl maximo={unidadesDisponibles(producto.ingredientes)} onVender={handleVender} />
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-7 d-flex flex-column gap-4">
          {(verCalorias || verCosto) && (
            <div className="row g-3">
              {verCalorias && <Metrica titulo="Calorías" valor={`${producto.calorias} kcal`} icono="🔥" />}
              {verCosto && <Metrica titulo="Costo de producción" valor={formatPrecio(producto.costo)} icono="🧾" />}
              {verRentabilidad && (
                <Metrica
                  titulo="Rentabilidad"
                  valor={formatPrecio(producto.rentabilidad)}
                  extra={`${margen.toFixed(0)}% de margen`}
                  icono="📈"
                />
              )}
            </div>
          )}

          <div className="card hoja">
            <div className="card-body">
              <h2 className="h5">Ingredientes</h2>
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Tipo</th>
                      {verCalorias && <th>Calorías</th>}
                      {verCosto && <th>Precio</th>}
                      {verInventario && <th>Inventario</th>}
                      <th title="🌱 vegetariano · 💚 sano">Etiquetas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {producto.ingredientes.map((ing, i) => (
                      <tr key={`${ing.id}-${i}`}>
                        <td>
                          {verInventario ? <Link to={`/ingredientes/${ing.id}`}>{ing.nombre}</Link> : ing.nombre}
                          {ing.sabor && <small className="text-secondary"> · sabor {ing.sabor}</small>}
                        </td>
                        <td><span className={`chip-ing chip-${ing.tipo}`}>{ing.tipo}</span></td>
                        {verCalorias && <td>{ing.calorias} kcal</td>}
                        {verCosto && <td>{formatPrecio(ing.precio)}</td>}
                        {verInventario && <td>{ing.inventario}</td>}
                        <td className="text-nowrap">
                          {ing.es_vegetariano && <span title="Vegetariano">🌱</span>}{" "}
                          {ing.es_sano && <span title="Sano">💚</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Metrica({ titulo, valor, extra, icono }) {
  return (
    <div className="col-sm-4">
      <div className="card hoja h-100">
        <div className="card-body">
          <div className="fs-4" aria-hidden="true">{icono}</div>
          <div className="small text-secondary text-uppercase">{titulo}</div>
          <div className="fs-5 fw-bold">{valor}</div>
          {extra && <div className="small text-success">{extra}</div>}
        </div>
      </div>
    </div>
  );
}
