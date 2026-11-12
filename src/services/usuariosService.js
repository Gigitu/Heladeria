import { supabase, revisar } from "../lib/supabase.js";

// USUARIOS · Consultar usuario por correo y contraseña
// GET /rest/v1/users?correo=eq.X&password=eq.Y
export async function getUsuarioPorCredenciales(correo, password) {
  return revisar(
    await supabase
      .from("users")
      .select("id, nombre, correo, rol") // sin traernos la contraseña al frontend
      .eq("correo", correo.trim().toLowerCase())
      .eq("password", password)
      .maybeSingle()
  );
}
