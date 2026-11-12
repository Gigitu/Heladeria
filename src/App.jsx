import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import "./App.css";

import { AuthProvider } from "./contexts/AuthContext.jsx";
import { supabaseConfigurado } from "./lib/supabase.js";
import { MARCA } from "./utils/marca.js";

import Navbar from "./components/Navbar/Navbar.jsx";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute.jsx";

import Productos from "./pages/Productos/Productos.jsx";
import ProductoDetalle from "./pages/ProductoDetalle/ProductoDetalle.jsx";
import Login from "./pages/Login/Login.jsx";
import Ingredientes from "./pages/Ingredientes/Ingredientes.jsx";
import IngredienteDetalle from "./pages/Ingredientes/IngredienteDetalle.jsx";
import IngredienteEditor from "./pages/Ingredientes/IngredienteEditor.jsx";
import Ventas from "./pages/Ventas/Ventas.jsx";
import Rentabilidad from "./pages/Rentabilidad/Rentabilidad.jsx";

// Atajo: <Protegida permiso="...">  (ver src/utils/permisos.js)
const protegida = (permiso, elemento) => <ProtectedRoute permiso={permiso}>{elemento}</ProtectedRoute>;

function App() {
  if (!supabaseConfigurado) return <FaltaConfiguracion />;

  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <main className="container pt-5 pb-4 flex-grow-1">
          <Routes>
            {/* Público: lista de productos */}
            <Route path="/" element={<Productos />} />
            <Route path="/productos/:id" element={<ProductoDetalle />} />
            <Route path="/login" element={<Login />} />

            {/* Admin y empleado */}
            <Route path="/ingredientes" element={protegida("gestionarIngredientes", <Ingredientes />)} />
            <Route path="/ingredientes/nuevo" element={protegida("gestionarIngredientes", <IngredienteEditor />)} />
            <Route path="/ingredientes/:id" element={protegida("gestionarIngredientes", <IngredienteDetalle />)} />
            <Route path="/ingredientes/:id/editar" element={protegida("gestionarIngredientes", <IngredienteEditor />)} />
            <Route path="/ventas" element={protegida("verVentas", <Ventas />)} />

            {/* Solo admin */}
            <Route path="/rentabilidad" element={protegida("verRentabilidad", <Rentabilidad />)} />

            <Route
              path="*"
              element={
                <div className="hoja no-existe">
                  <h1 className="h2">Uy, por aquí no es</h1>
                  <p className="text-secondary">Esa página no existe (o la escribiste mal).</p>
                  <Link to="/" className="btn btn-primary">Ir al menú</Link>
                </div>
              }
            />
          </Routes>
        </main>

        <footer className="pie py-3 mt-4">
          <div className="container d-flex flex-wrap justify-content-between gap-2">
            <span>{MARCA.nombre} — proyecto de clase</span>
            <span>React · Vite · Supabase</span>
          </div>
        </footer>
      </BrowserRouter>
    </AuthProvider>
  );
}

// Se muestra si faltan las variables de entorno de Supabase
function FaltaConfiguracion() {
  return (
    <div className="container py-5" style={{ maxWidth: 640 }}>
      <div className="card hoja">
        <div className="card-body p-4">
          <h1 className="h3">Falta conectar Supabase</h1>
          <p>
            Crea un archivo <code>.env</code> en la raíz del proyecto (puedes copiar <code>.env.example</code>) con:
          </p>
          <pre className="bg-light p-3 rounded-3 small mb-3">
{`VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key`}
          </pre>
          <p className="mb-0 small text-secondary">
            Los valores están en Supabase → Project Settings → API. Después reinicia <code>npm run dev</code>. En
            Vercel se agregan en Settings → Environment Variables.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
