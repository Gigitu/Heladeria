import { useCallback, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Aviso, Cargando, ErrorCarga } from "../../components/Estado/Estado.jsx";
import useCargar from "../../hooks/useCargar.js";
import {
  esIngredienteSano,
  getIngredientePorId,
  getProductosQueUsan,
  reabastecerIngrediente,
  renovarInventario,
} from "../../services/ingredientesService.js";
import { formatPrecio } from "../../utils/formato.js";

// Detalle de un ingrediente + reabastecer + renovar inventario
export default function IngredienteDetalle() {
  const { id } = useParams();
  const [cantidad, setCantidad] = useState(10);
  const [aviso, setAviso] = useState(null);
  const [trabajando, setTrabajando] = useState(false);

  const cargar = useCallback(async () => {
    const ingrediente = await getIngredientePorId(id);
    if (!ingrediente) return null;
    const [sano, productos] = await Promise.all([esIngredienteSano(id), getProductosQueUsan(id)]);
    return { ingrediente, sano, productos };
  }, [id]);

  const { data, loading, error, recargar } = useCargar(cargar);

  const ejecutar = async (accion, mensajeOk) => {
    setTrabajando(true);
    try {
      await accion();
      setAviso({ tipo: "success", texto: mensajeOk });
      recargar();
    } catch (err) {
      setAviso({ tipo: "danger", texto: `❌ ${err.message}` });
    } finally {
      setTrabajando(false);
    }
  };

  const handleReabastecer = (e) => {
    e.preventDefault();
    ejecutar(() => reabastecerIngrediente(Number(id), Number(cantidad)), `📦 Se agregaron ${cantidad} unidades`);
  };

  const handleRenovar = () => {
    if (!window.confirm("¿Poner el inventario de este complemento en 0?")) return;
    ejecutar(() => renovarInventario(Number(id)), "♻️ Inventario renovado (quedó en 0)");
  };

  if (loading) return <Cargando />;
  if (error) return <ErrorCarga mensaje={error} onReintentar={recargar} />;
  if (!data) {
    return (
      <div className="text-center py-5">
        <h2>Ingrediente no encontrado</h2>
        <Link to="/ingredientes">Volver</Link>
      </div>
    );
  }

  const { ingrediente: ing, sano, productos } = data;

  return (
    <>
      <Link to="/ingredientes" className="btn btn-link px-0 mb-3">← Ingredientes</Link>
      <Aviso aviso={aviso} onCerrar={() => setAviso(null)} />

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card hoja h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-start gap-2">
                <h1 className="h3">{ing.nombre}</h1>
                <Link to={`/ingredientes/${ing.id}/editar`} className="btn btn-sm btn-outline-secondary">Editar</Link>
              </div>
              <p>
                <span className={`chip-ing chip-${ing.tipo} me-2`}>{ing.tipo}</span>
                {ing.sabor && <span className="text-capitalize">Sabor: {ing.sabor}</span>}
              </p>

              <dl className="row mb-0">
                <dt className="col-6">Precio</dt><dd className="col-6">{formatPrecio(ing.precio)}</dd>
                <dt className="col-6">Calorías por porción</dt><dd className="col-6">{ing.calorias} kcal</dd>
                <dt className="col-6">Inventario</dt><dd className="col-6 fw-bold">{ing.inventario} unidades</dd>
                <dt className="col-6">Vegetariano</dt><dd className="col-6">{ing.es_vegetariano ? "🌱 Sí" : "No"}</dd>
                <dt className="col-6">¿Es sano?</dt>
                <dd className="col-6">
                  {sano ? (
                    <span className="badge text-bg-success">💚 Sano según regulación</span>
                  ) : (
                    <span className="badge text-bg-warning">No cumple regulación</span>
                  )}
                </dd>
              </dl>
            </div>
          </div>
        </div>

        <div className="col-lg-6 d-flex flex-column gap-4">
          <div className="card hoja">
            <div className="card-body p-4">
              <h2 className="h5">📦 Reabastecer</h2>
              <form className="d-flex gap-2" onSubmit={handleReabastecer}>
                <input
                  type="number"
                  min={1}
                  className="form-control"
                  value={cantidad}
                  onChange={(e) => setCantidad(Math.max(1, Number(e.target.value) || 1))}
                  aria-label="Unidades a agregar"
                />
                <button className="btn btn-primary text-nowrap" disabled={trabajando}>Agregar unidades</button>
              </form>
            </div>
          </div>

          <div className="card hoja">
            <div className="card-body p-4">
              <h2 className="h5">♻️ Renovar inventario</h2>
              {ing.tipo === "complemento" ? (
                <>
                  <p className="text-secondary small">Los complementos se pueden poner en 0 con una sola instrucción.</p>
                  <button className="btn btn-outline-danger" onClick={handleRenovar} disabled={trabajando}>
                    Poner inventario en 0
                  </button>
                </>
              ) : (
                <p className="text-secondary small mb-0">Solo aplica a complementos. Este ingrediente es una base.</p>
              )}
            </div>
          </div>

          <div className="card hoja">
            <div className="card-body p-4">
              <h2 className="h5">🍨 Se usa en</h2>
              {productos.length === 0 ? (
                <p className="text-secondary mb-0">Ningún producto lo usa.</p>
              ) : (
                <ul className="mb-0">
                  {productos.map((p) => (
                    <li key={p.id}><Link to={`/productos/${p.id}`}>{p.nombre}</Link></li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
