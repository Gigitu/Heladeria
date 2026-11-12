import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../../hooks/useAuth.js";

// - Sin sesión -> /login (recordando a dónde quería ir)
// - Con sesión pero sin permiso -> página principal
// - Todo bien -> muestra el contenido
// Uso: <ProtectedRoute permiso="gestionarIngredientes">...</ProtectedRoute>
export default function ProtectedRoute({ children, permiso }) {
  const { isAuthenticated, can } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (permiso && !can(permiso)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
