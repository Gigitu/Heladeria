import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { Aviso, Cargando, ErrorCarga } from "../../components/Estado/Estado.jsx";
import useCargar from "../../hooks/useCargar.js";
import {
  eliminarIngrediente,
  getIngredientes,
  getIngredientesPorNombre,
  getProductosQueUsan,
} from "../../services/ingredientesService.js";
import { formatPrecio } from "../../utils/formato.js";

// CRUD de ingredientes: listado + buscar + eliminar (crear/editar en IngredienteEditor)
export default function Ingredientes() {
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState("");
  const [aviso, setAviso] = useState(null);

  const cargar = useCallback(
    () => (filtro.trim() ? getIngredientesPorNombre(filtro.trim()) : getIngredientes()),
    [filtro]
  );
  const { data: ingredientes, loading, error, recargar } = useCargar(cargar);

  const handleEliminar = async (ing) => {
    try {
      const usados = await getProductosQueUsan(ing.id);
      const mensaje = usados.length
        ? `"${ing.nombre}" se usa en: ${usados.map((p) => p.nombre).join(", ")}.\nSi lo eliminas, esos productos quedarán con menos ingredientes.\n\n¿Eliminar de todas formas?`
        : `¿Eliminar "${ing.nombre}"?`;
      if (!window.confirm(mensaje)) return;

      await eliminarIngrediente(ing.id);
      setAviso({ tipo: "success", texto: `🗑️ "${ing.nombre}" eliminado` });
      recargar();
    } catch (err) {
      setAviso({ tipo: "danger", texto: `❌ ${err.message}` });
    }
  };

  return (
    <>
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
        <h1 className="h2 mb-0">Bodega de ingredientes</h1>
        <div className="d-flex flex-wrap gap-2">
          <form
            className="d-flex gap-2"
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              setFiltro(busqueda);
            }}
          >
            <input
              className="form-control"
              type="search"
              placeholder="Buscar por nombre..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              aria-label="Buscar ingrediente por nombre"
            />
            <button className="btn btn-outline-primary">Buscar</button>
          </form>
          <Link to="/ingredientes/nuevo" className="btn btn-primary">+ Nuevo</Link>
        </div>
      </div>

      <Aviso aviso={aviso} onCerrar={() => setAviso(null)} />
      {loading && <Cargando />}
      {error && <ErrorCarga mensaje={error} onReintentar={recargar} />}

      {ingredientes && (
        <div className="card hoja">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Sabor</th>
                  <th className="text-end">Precio</th>
                  <th className="text-end">Calorías</th>
                  <th className="text-center">Inventario</th>
                  <th className="text-center">Vegetariano</th>
                  <th className="text-center">Sano</th>
                  <th className="text-end">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {ingredientes.length === 0 && (
                  <tr>
                    <td colSpan={10} className="text-center text-secondary py-4">Sin resultados</td>
                  </tr>
                )}
                {ingredientes.map((ing) => (
                  <tr key={ing.id}>
                    <td className="text-secondary">{ing.id}</td>
                    <td className="fw-semibold">
                      <Link to={`/ingredientes/${ing.id}`}>{ing.nombre}</Link>
                    </td>
                    <td><span className={`chip-ing chip-${ing.tipo}`}>{ing.tipo}</span></td>
                    <td className="text-capitalize">{ing.sabor ?? "—"}</td>
                    <td className="text-end">{formatPrecio(ing.precio)}</td>
                    <td className="text-end">{ing.calorias}</td>
                    <td className="text-center">
                      <span className={`badge ${ing.inventario === 0 ? "text-bg-danger" : ing.inventario < 10 ? "text-bg-warning" : "text-bg-success"}`}>
                        {ing.inventario}
                      </span>
                    </td>
                    <td className="text-center">{ing.es_vegetariano ? "🌱" : "—"}</td>
                    <td className="text-center">{ing.es_sano ? "💚" : "—"}</td>
                    <td className="text-end text-nowrap">
                      <Link to={`/ingredientes/${ing.id}/editar`} className="btn btn-sm btn-outline-secondary me-1">Editar</Link>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleEliminar(ing)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
