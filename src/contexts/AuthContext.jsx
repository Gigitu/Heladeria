import { createContext } from "react";
import useLocalStorage from "../hooks/useLocalStorage.js";
import { getUsuarioPorCredenciales } from "../services/usuariosService.js";
import { PERMISOS } from "../utils/permisos.js";

// Contexto global de autenticación
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Usuario autenticado (persistido para no perder la sesión al recargar)
  const [usuario, setUsuario] = useLocalStorage("velluto_sesion", null);

  // Busca el usuario en Supabase por correo y contraseña
  const login = async (correo, password) => {
    const encontrado = await getUsuarioPorCredenciales(correo, password);
    if (!encontrado) throw new Error("Correo o contraseña incorrectos");
    setUsuario(encontrado);
    return encontrado;
  };

  const logout = () => setUsuario(null);

  // hasRole("admin") ó hasRole("admin", "empleado")
  const hasRole = (...roles) => Boolean(usuario) && roles.includes(usuario.rol);

  // can("verRentabilidad") -> según la tabla de PERMISOS
  const can = (permiso) => hasRole(...(PERMISOS[permiso] ?? []));

  const value = { usuario, isAuthenticated: Boolean(usuario), login, logout, hasRole, can };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
