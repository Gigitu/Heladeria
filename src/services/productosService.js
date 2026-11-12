import { supabase, revisar } from "../lib/supabase.js";

// Producto + sus ingredientes (Supabase arma el "join" usando las llaves foráneas)
const SELECT_PRODUCTO = `
  id, nombre, precio_publico, tipo, vaso, volumen_onzas,
  producto_ingrediente ( ingrediente:ingredientes ( id, nombre, precio, calorias, inventario, tipo, sabor, es_sano, es_vegetariano ) )
`;

// Aplana producto_ingrediente -> ingredientes: [...]
function normalizar(p) {
  const { producto_ingrediente = [], ...resto } = p;
  return { ...resto, ingredientes: producto_ingrediente.map((pi) => pi.ingrediente).filter(Boolean) };
}

// PRODUCTOS · Consultar todos los productos
export async function getProductos() {
  const data = revisar(await supabase.from("productos").select(SELECT_PRODUCTO).order("id"));
  return data.map(normalizar);
}

// PRODUCTOS · Consultar un producto según su ID
export async function getProductoPorId(id) {
  const data = revisar(await supabase.from("productos").select(SELECT_PRODUCTO).eq("id", id).maybeSingle());
  return data ? normalizar(data) : null;
}

// PRODUCTOS · Consultar un producto según su nombre (búsqueda parcial, sin mayúsculas)
export async function getProductosPorNombre(nombre) {
  const data = revisar(
    await supabase.from("productos").select(SELECT_PRODUCTO).ilike("nombre", `%${nombre}%`).order("id")
  );
  return data.map(normalizar);
}

// PRODUCTOS · Consultar las calorías de un producto según su ID
export async function getCaloriasProducto(id) {
  const data = revisar(
    await supabase.from("v_calorias_producto").select("total_calorias").eq("producto_id", id).maybeSingle()
  );
  return data ? Number(data.total_calorias) : 0;
}

// PRODUCTOS · Consultar el costo de producción de un producto según su ID
export async function getCostoProducto(id) {
  const data = revisar(
    await supabase.from("v_costo_producto").select("costo").eq("producto_id", id).maybeSingle()
  );
  return data ? Number(data.costo) : 0;
}

// PRODUCTOS · Consultar la rentabilidad de un producto según su ID
export async function getRentabilidadProducto(id) {
  const data = revisar(
    await supabase.from("v_rentabilidad_producto").select("rentabilidad").eq("producto_id", id).maybeSingle()
  );
  return data ? Number(data.rentabilidad) : 0;
}

// Rentabilidad de todos los productos, de mayor a menor (el primero es el más rentable)
export async function getRentabilidades() {
  const data = revisar(
    await supabase
      .from("v_rentabilidad_producto")
      .select("producto_id, nombre, precio_publico, costo, rentabilidad")
      .order("rentabilidad", { ascending: false })
  );
  return data.map((r) => ({
    ...r,
    precio_publico: Number(r.precio_publico),
    costo: Number(r.costo),
    rentabilidad: Number(r.rentabilidad),
  }));
}

// Calorías de todos los productos (para el listado)
export async function getCaloriasTodos() {
  const data = revisar(await supabase.from("v_calorias_producto").select("producto_id, total_calorias"));
  return Object.fromEntries(data.map((c) => [c.producto_id, Number(c.total_calorias)]));
}

// PRODUCTOS · Vender un producto según su ID
// POST /rest/v1/rpc/vender_producto -> revisa inventario, lo descuenta y registra la venta
export async function venderProducto(id, cantidad = 1, userId = null) {
  return revisar(
    await supabase.rpc("vender_producto", {
      p_producto_id: id,
      p_cantidad: cantidad,
      p_user_id: userId,
    })
  );
}

// Listado completo para la página principal.
// Solo pide costo/rentabilidad si el rol tiene permiso de verlos.
export async function getListadoProductos({ nombre = "", conCosto = false } = {}) {
  const [productos, calorias, rentabilidades] = await Promise.all([
    nombre.trim() ? getProductosPorNombre(nombre.trim()) : getProductos(),
    getCaloriasTodos(),
    conCosto ? getRentabilidades() : Promise.resolve([]),
  ]);

  const porId = Object.fromEntries(rentabilidades.map((r) => [r.producto_id, r]));

  return productos.map((p) => ({
    ...p,
    calorias: calorias[p.id] ?? 0,
    costo: porId[p.id]?.costo ?? null,
    rentabilidad: porId[p.id]?.rentabilidad ?? null,
  }));
}
