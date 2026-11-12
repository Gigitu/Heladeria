// 12000 -> "$ 12.000"
const formatoCOP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  maximumFractionDigits: 0,
});

export function formatPrecio(valor) {
  return formatoCOP.format(Number(valor) || 0);
}

// "2026-11-10T15:45:00Z" -> "3:45 p. m."
export function formatHora(fechaISO) {
  return new Date(fechaISO).toLocaleTimeString("es-CO", { hour: "numeric", minute: "2-digit" });
}

export function emojiProducto(tipo) {
  return tipo === "malteada" ? "🥤" : "🍨";
}
