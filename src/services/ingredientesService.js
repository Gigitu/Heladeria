import { supabase, revisar } from "../lib/supabase.js";

// INGREDIENTES · Consultar todos los ingredientes
export async function getIngredientes() {
  return revisar(await supabase.from("ingredientes").select("*").order("id"));
}

// INGREDIENTES · Consultar un ingrediente según su ID
export async function getIngredientePorId(id) {
  return revisar(await supabase.from("ingredientes").select("*").eq("id", id).maybeSingle());
}

// INGREDIENTES · Consultar un ingrediente según su nombre (búsqueda parcial)
export async function getIngredientesPorNombre(nombre) {
  return revisar(
    await supabase.from("ingredientes").select("*").ilike("nombre", `%${nombre}%`).order("id")
  );
}

// INGREDIENTES · Consultar si un ingrediente es sano según su ID
export async function esIngredienteSano(id) {
  const data = revisar(await supabase.from("ingredientes").select("es_sano").eq("id", id).maybeSingle());
  return Boolean(data?.es_sano);
}

// INGREDIENTES · Crear
export async function crearIngrediente(ingrediente) {
  return revisar(await supabase.from("ingredientes").insert(ingrediente).select().single());
}

// INGREDIENTES · Actualizar
export async function actualizarIngrediente(id, cambios) {
  return revisar(await supabase.from("ingredientes").update(cambios).eq("id", id).select().single());
}

// INGREDIENTES · Eliminar
export async function eliminarIngrediente(id) {
  revisar(await supabase.from("ingredientes").delete().eq("id", id));
}

// INGREDIENTES · Reabastecer un ingrediente según su ID (suma unidades)
// POST /rest/v1/rpc/reabastecer_ingrediente
export async function reabastecerIngrediente(id, cantidad) {
  return revisar(
    await supabase.rpc("reabastecer_ingrediente", { p_ingrediente_id: id, p_cantidad: cantidad })
  );
}

// INGREDIENTES · Renovar el inventario (poner en 0) — solo aplica a complementos
// PATCH /rest/v1/ingredientes?id=eq.X&tipo=eq.complemento  { inventario: 0 }
export async function renovarInventario(id) {
  const data = revisar(
    await supabase
      .from("ingredientes")
      .update({ inventario: 0 })
      .eq("id", id)
      .eq("tipo", "complemento")
      .select()
  );
  if (data.length === 0) {
    throw new Error("Solo los complementos se pueden renovar (poner en 0)");
  }
  return data[0];
}

// Productos que usan un ingrediente (para avisar antes de borrarlo)
export async function getProductosQueUsan(id) {
  const data = revisar(
    await supabase
      .from("producto_ingrediente")
      .select("producto:productos ( id, nombre )")
      .eq("ingrediente_id", id)
  );
  // Quitamos repetidos por si el ingrediente aparece 2 veces en el mismo producto
  const unicos = new Map(data.map((r) => [r.producto.id, r.producto]));
  return [...unicos.values()];
}
