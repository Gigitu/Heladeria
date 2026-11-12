import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import useAuth from "../../hooks/useAuth.js";
import { ROLES_LABEL } from "../../utils/permisos.js";
import { MARCA } from "../../utils/marca.js";
import "./Navbar.css";

// Barra de navegación (Bootstrap) con enlaces según el rol
export default function Navbar() {
  const { usuario, isAuthenticated, can, logout } = useAuth();
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState(false);

  const cerrarMenu = () => setAbierto(false);

  const handleLogout = () => {
    logout();
    cerrarMenu();
    navigate("/");
  };

  return (
    <nav className="navbar navbar-expand-lg barra sticky-top">
      <div className="container">
        <Link to="/" className="navbar-brand d-flex align-items-center gap-2" onClick={cerrarMenu}>
          <img src="/logo.svg" alt="" width="34" height="34" />
          <span className="nombre-tienda">{MARCA.nombre}</span>
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          aria-label="Abrir menú"
          aria-expanded={abierto}
          onClick={() => setAbierto((a) => !a)}
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className={`collapse navbar-collapse ${abierto ? "show" : ""}`}>
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink to="/" end className="nav-link" onClick={cerrarMenu}>Menú</NavLink>
            </li>
            {can("gestionarIngredientes") && (
              <li className="nav-item">
                <NavLink to="/ingredientes" className="nav-link" onClick={cerrarMenu}>Bodega</NavLink>
              </li>
            )}
            {can("verVentas") && (
              <li className="nav-item">
                <NavLink to="/ventas" className="nav-link" onClick={cerrarMenu}>Caja de hoy</NavLink>
              </li>
            )}
            {can("verRentabilidad") && (
              <li className="nav-item">
                <NavLink to="/rentabilidad" className="nav-link" onClick={cerrarMenu}>Ganancias</NavLink>
              </li>
            )}
          </ul>

          <div className="d-flex flex-wrap align-items-center gap-2">
            {isAuthenticated ? (
              <>
                <span className="navbar-text">
                  Hola, {usuario.nombre}{" "}
                  <span className={`badge rol-badge rol-${usuario.rol}`}>{ROLES_LABEL[usuario.rol]}</span>
                </span>
                <button className="btn btn-outline-primary btn-sm" onClick={handleLogout}>
                  Salir
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm" onClick={cerrarMenu}>
                Entrar
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
