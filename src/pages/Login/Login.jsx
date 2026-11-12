import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth.js";
import { MARCA } from "../../utils/marca.js";

const CUENTAS_PRUEBA = [
  { rol: "Admin", correo: "admin@admin.co", password: "admin" },
  { rol: "Empleado", correo: "empleado@empleado.co", password: "empleado" },
  { rol: "Cliente", correo: "cliente@cliente.co", password: "cliente" },
];

export default function Login() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!correo.trim() || !password) {
      setError("Ingresa tu correo y contraseña");
      return;
    }
    setEnviando(true);
    setError("");
    try {
      await login(correo, password);
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (err) {
      setError(err.message);
      setEnviando(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-7 col-lg-5">
        <div className="card hoja">
          <div className="card-body p-4 p-md-5">
            <div className="text-center mb-4">
              <img src="/logo.svg" alt="" width="64" height="64" />
              <h1 className="h2 mt-2">Hola de nuevo</h1>
              <p className="text-secondary mb-0">Entra con tu correo para seguir en {MARCA.nombre}</p>
            </div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-3">
                <label htmlFor="correo" className="form-label fw-semibold">Correo</label>
                <input
                  id="correo"
                  type="email"
                  className="form-control form-control-lg"
                  value={correo}
                  onChange={(e) => setCorreo(e.target.value)}
                  autoComplete="username"
                  placeholder="tu@correo.co"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label fw-semibold">Contraseña</label>
                <input
                  id="password"
                  type="password"
                  className="form-control form-control-lg"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>

              {error && <div className="alert alert-danger py-2">{error}</div>}

              <button className="btn btn-primary btn-lg w-100" type="submit" disabled={enviando}>
                {enviando ? "Entrando..." : "Entrar"}
              </button>
            </form>

            <hr className="my-4" />
            <p className="small text-secondary text-center mb-2">¿Solo quieres probar? Usa una de estas:</p>
            <div className="d-flex flex-wrap justify-content-center gap-2">
              {CUENTAS_PRUEBA.map((c) => (
                <button
                  key={c.rol}
                  type="button"
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => {
                    setCorreo(c.correo);
                    setPassword(c.password);
                  }}
                >
                  {c.rol}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
