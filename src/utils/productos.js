// ¿Cuántas unidades de un producto se pueden vender con el inventario actual?
// (si un ingrediente aparece 2 veces en el producto, se gasta el doble)
export function unidadesDisponibles(ingredientes = []) {
  if (ingredientes.length === 0) return 0;
  const usos = {};
  for (const ing of ingredientes) {
    usos[ing.id] = usos[ing.id] ?? { inventario: ing.inventario, veces: 0 };
    usos[ing.id].veces += 1;
  }
  return Math.min(...Object.values(usos).map((u) => Math.floor(u.inventario / u.veces)));
}

// Texto del detalle según el tipo: copa -> vaso, malteada -> onzas
export function detalleTipo(producto) {
  if (producto.tipo === "copa") return producto.vaso ? `Vaso ${producto.vaso}` : "Copa";
  return producto.volumen_onzas ? `${producto.volumen_onzas} oz` : "Malteada";
}
