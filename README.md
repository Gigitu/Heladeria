# 🍦 Velluto — Gelatería

Frontend en **React + Vite** con **Bootstrap 5** que consume la **API REST automática de Supabase** para gestionar los productos, los ingredientes, el inventario y las ventas de una heladería.

## Cómo ponerlo a funcionar

1. **Supabase:** crea un proyecto, abre **SQL Editor**, pega todo el archivo [`supabase/schema.sql`](supabase/schema.sql) y dale **Run**.
2. **Variables de entorno:** copia `.env.example` como `.env` y pon la URL y la *anon key* de tu proyecto. Las encuentras en Supabase → Project Settings → API.
3. **Correr la app:**
   ```bash
   npm install
   npm run dev
   ```
4. **Vercel:** importa el repositorio de GitHub y agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en *Settings → Environment Variables*. El archivo `vercel.json` hace que las rutas como `/ingredientes` funcionen al recargar la página.

### Usuarios de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@admin.co | admin |
| Empleado | empleado@empleado.co | empleado |
| Cliente | cliente@cliente.co | cliente |

## Roles

| Función | Público | Cliente | Empleado | Admin |
|---|:-:|:-:|:-:|:-:|
| Ver lista de productos | ✅ | ✅ | ✅ | ✅ |
| Ver calorías | | ✅ | ✅ | ✅ |
| Vender productos | | ✅ | ✅ | ✅ |
| Ver costo de producción | | | ✅ | ✅ |
| CRUD de ingredientes, reabastecer y renovar | | | ✅ | ✅ |
| Ventas del día | | | ✅ | ✅ |
| Rentabilidad y producto más rentable | | | | ✅ |

Los permisos están definidos en un solo lugar: [`src/utils/permisos.js`](src/utils/permisos.js).

## Operaciones obligatorias de la API

| Operación | Función | Archivo |
|---|---|---|
| Consultar usuario por correo y contraseña | `getUsuarioPorCredenciales` | `services/usuariosService.js` |
| Consultar todos los productos | `getProductos` | `services/productosService.js` |
| Consultar producto por ID | `getProductoPorId` | 〃 |
| Consultar producto por nombre | `getProductosPorNombre` | 〃 |
| Calorías de un producto por ID | `getCaloriasProducto` (vista `v_calorias_producto`) | 〃 |
| Rentabilidad de un producto por ID | `getRentabilidadProducto` (vista `v_rentabilidad_producto`) | 〃 |
| Costo de producción por ID | `getCostoProducto` (vista `v_costo_producto`) | 〃 |
| Vender un producto por ID | `venderProducto` (RPC `vender_producto`) | 〃 |
| Consultar todos los ingredientes | `getIngredientes` | `services/ingredientesService.js` |
| Consultar ingrediente por ID | `getIngredientePorId` | 〃 |
| Consultar ingrediente por nombre | `getIngredientesPorNombre` | 〃 |
| ¿Es sano? por ID | `esIngredienteSano` | 〃 |
| Reabastecer por ID | `reabastecerIngrediente` (RPC `reabastecer_ingrediente`) | 〃 |
| Renovar inventario (0 si es complemento) | `renovarInventario` | 〃 |
| Crear / editar / eliminar ingrediente | `crearIngrediente`, `actualizarIngrediente`, `eliminarIngrediente` | 〃 |

## Correcciones al script SQL del enunciado

- `ventas.user_id` estaba definido como `uuid`, pero `users.id` es `bigserial`, así que el script fallaba. Se cambió a `bigint`.
- El `insert` de usuarios usaba la columna `contra`, que no existe. Se cambió a `password`.
- Se agregaron dos funciones:
  - `vender_producto`: revisa el inventario, lo descuenta y registra la venta en una sola transacción.
  - `reabastecer_ingrediente`.

## Estructura

```
src/
  lib/supabase.js          cliente de Supabase
  services/                todas las llamadas a la API
  contexts/AuthContext.jsx sesión, login, logout, hasRole, can
  components/              Navbar, ProtectedRoute, ProductoCard, VenderControl, Estado
  pages/                   Productos, ProductoDetalle, Login, Ingredientes (+Detalle, +Editor), Ventas, Rentabilidad
  utils/                   permisos, formato de precios, cálculos de productos
supabase/schema.sql        tablas, vistas, funciones y datos iniciales
```
