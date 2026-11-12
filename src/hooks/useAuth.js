import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext.jsx";

// const { usuario, isAuthenticated, login, logout, hasRole, can } = useAuth();
export default function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return context;
}
