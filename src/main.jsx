import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css"; // Bootstrap (requisito: estilos con Bootstrap)
import "./index.css";                           // Tema de la heladería (encima de Bootstrap)
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
