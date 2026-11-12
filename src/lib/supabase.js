import { createClient } from "@supabase/supabase-js";

// Las llaves vienen del archivo .env (en Vercel: Settings > Environment Variables)
const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseConfigurado = Boolean(url && anonKey);

// Cliente que consume la API REST que Supabase genera automáticamente para cada tabla
export const supabase = supabaseConfigurado ? createClient(url, anonKey) : null;

// Convierte la respuesta { data, error } de Supabase en "devuelve data o lanza error"
export function revisar({ data, error }) {
  if (error) throw new Error(error.message);
  return data;
}
