// Qué puede hacer cada rol 
//
//  - admin    -> todo
//  - empleado -> todo excepto lo relacionado con rentabilidad
//  - cliente  -> vender productos, ver productos y sus calorías
export const PERMISOS = {
  verCalorias: ["admin", "empleado", "cliente"],
  vender: ["admin", "empleado", "cliente"],
  verCosto: ["admin", "empleado"],
  gestionarIngredientes: ["admin", "empleado"],
  verVentas: ["admin", "empleado"],
  verRentabilidad: ["admin"],
};

export const ROLES_LABEL = {
  admin: "Administrador",
  empleado: "Empleado",
  cliente: "Cliente",
};
