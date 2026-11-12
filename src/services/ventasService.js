import { supabase, revisar } from "../lib/supabase.js";

// Ventas registradas desde las 00:00 de hoy (hora local)
export async function getVentasDelDia() {
  const inicioDelDia = new Date();
  inicioDelDia.setHours(0, 0, 0, 0);

  const ventas = revisar(
    await supabase
      .from("ventas")
      .select("id, fecha, cantidad, total, producto:productos ( nombre, tipo ), usuario:users ( nombre )")
      .gte("fecha", inicioDelDia.toISOString())
      .order("fecha", { ascending: false })
  );

  // Contador de ventas del día
  const resumen = {
    numeroVentas: ventas.length,
    unidades: ventas.reduce((s, v) => s + v.cantidad, 0),
    total: ventas.reduce((s, v) => s + Number(v.total), 0),
  };

  return { ventas, resumen };
}
