import { useCallback, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Cargando, ErrorCarga } from "../../components/Estado/Estado.jsx";
import useCargar from "../../hooks/useCargar.js";
import {
  actualizarIngrediente,
  crearIngrediente,
  getIngredientePorId,
} from "../../services/ingredientesService.js";

const VACIO = {
  nombre: "",
  precio: "",
  calorias: "",
  inventario: 0,
  tipo: "base",
  sabor: "",
  es_vegetariano: false,
  es_sano: true,
};

// Crear (/ingredientes/nuevo) o editar (/ingredientes/:id/editar)
export default function IngredienteEditor() {
  const { id } = useParams();
  const editando = id !== undefined;

  const cargar = useCallback(
    () => (editando ? getIngredientePorId(id) : Promise.resolve(VACIO)),
    [editando, id]
  );
  const { data, loading, error, recargar } = useCargar(cargar);

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

  return <IngredienteForm key={id ?? "nuevo"} inicial={data} id={editando ? Number(id) : null} />;
}

function IngredienteForm({ inicial, id }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ ...VACIO, ...inicial, sabor: inicial.sabor ?? "" });
  const [errores, setErrores] = useState({});
  const [errorApi, setErrorApi] = useState("");
  const [guardando, setGuardando] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  };

  const validar = () => {
    const err = {};
    if (!form.nombre.trim()) err.nombre = "El nombre es obligatorio";
    if (form.precio === "" || Number(form.precio) < 0) err.precio = "Precio inválido";
    if (form.calorias === "" || !Number.isInteger(Number(form.calorias)) || Number(form.calorias) < 0)
      err.calorias = "Calorías inválidas (número entero)";
    if (form.inventario === "" || !Number.isInteger(Number(form.inventario)) || Number(form.inventario) < 0)
      err.inventario = "Inventario inválido (número entero)";
    if (form.tipo === "base" && !form.sabor.trim()) err.sabor = "Las bases deben tener un sabor";
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validar();
    setErrores(err);
    if (Object.keys(err).length) return;

    const payload = {
      nombre: form.nombre.trim(),
      precio: Number(form.precio),
      calorias: Number(form.calorias),
      inventario: Number(form.inventario),
      tipo: form.tipo,
      sabor: form.tipo === "base" ? form.sabor.trim().toLowerCase() : null, // solo las bases tienen sabor
      es_vegetariano: form.es_vegetariano,
      es_sano: form.es_sano,
    };

    setGuardando(true);
    setErrorApi("");
    try {
      if (id) await actualizarIngrediente(id, payload);
      else await crearIngrediente(payload);
      navigate("/ingredientes");
    } catch (error) {
      setErrorApi(error.message);
      setGuardando(false);
    }
  };

  const campo = (name, label, props = {}) => (
    <div className="col-sm-6">
      <label htmlFor={name} className="form-label fw-semibold">{label}</label>
      <input
        id={name}
        name={name}
        className={`form-control ${errores[name] ? "is-invalid" : ""}`}
        value={form[name]}
        onChange={handleChange}
        {...props}
      />
      {errores[name] && <div className="invalid-feedback">{errores[name]}</div>}
    </div>
  );

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <Link to="/ingredientes" className="btn btn-link px-0 mb-3">← Ingredientes</Link>
        <div className="card hoja">
          <div className="card-body p-4">
            <h1 className="h3 mb-4">{id ? `Editar: ${inicial.nombre}` : "Nuevo ingrediente"}</h1>

            <form className="row g-3" onSubmit={handleSubmit} noValidate>
              {campo("nombre", "Nombre", { placeholder: "Ej: Maracuyá" })}

              <div className="col-sm-6">
                <label htmlFor="tipo" className="form-label fw-semibold">Tipo</label>
                <select id="tipo" name="tipo" className="form-select" value={form.tipo} onChange={handleChange}>
                  <option value="base">Base</option>
                  <option value="complemento">Complemento</option>
                </select>
              </div>

              {campo("precio", "Precio (COP)", { type: "number", min: 0, step: 50 })}
              {campo("calorias", "Calorías por porción", { type: "number", min: 0 })}
              {campo("inventario", "Inventario disponible", { type: "number", min: 0 })}
              {form.tipo === "base" && campo("sabor", "Sabor", { placeholder: "Ej: maracuyá" })}

              <div className="col-12 d-flex flex-wrap gap-4">
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" role="switch" id="es_vegetariano" name="es_vegetariano" checked={form.es_vegetariano} onChange={handleChange} />
                  <label className="form-check-label" htmlFor="es_vegetariano">🌱 Vegetariano</label>
                </div>
                <div className="form-check form-switch">
                  <input className="form-check-input" type="checkbox" role="switch" id="es_sano" name="es_sano" checked={form.es_sano} onChange={handleChange} />
                  <label className="form-check-label" htmlFor="es_sano">💚 Sano (regulación de salud)</label>
                </div>
              </div>

              {errorApi && <div className="col-12"><div className="alert alert-danger mb-0">{errorApi}</div></div>}

              <div className="col-12 d-flex gap-2">
                <button className="btn btn-primary" disabled={guardando}>
                  {guardando ? "Guardando..." : id ? "Guardar cambios" : "Crear ingrediente"}
                </button>
                <Link to="/ingredientes" className="btn btn-outline-secondary">Cancelar</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
