import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import ProductoCard from "../../components/ProductoCard/ProductoCard.jsx";
import { Aviso, Cargando, ErrorCarga } from "../../components/Estado/Estado.jsx";
import useAuth from "../../hooks/useAuth.js";
import useCargar from "../../hooks/useCargar.js";
import { getListadoProductos, venderProducto } from "../../services/productosService.js";
import { formatPrecio } from "../../utils/formato.js";
import { MARCA } from "../../utils/marca.js";
import "./Productos.css";

// Botones del filtro por tipo: [valor, texto que se ve]
const TIPOS = [
  ["todos", "Todos"],
  ["copa", "Copas"],
  ["malteada", "Malteadas"],
];

// Página principal: listado de productos (visible para todos, incluso sin sesión)
export default function Productos() {
  const { usuario, isAuthenticated, can } = useAuth();
  const [busqueda, setBusqueda] = useState(""); // lo que se escribe
  const [filtro, setFiltro] = useState("");     // lo que se buscó
  const [tipo, setTipo] = useState("todos");    // botón de tipo elegido
  const [aviso, setAviso] = useState(null);

  const conCosto = can("verCosto");
  const cargar = useCallback(() => getListadoProductos({ nombre: filtro, conCosto }), [filtro, conCosto]);
  const { data: productos, loading, error, recargar } = useCargar(cargar);

  // Producto más rentable (solo admin)
  const masRentableId =
    can("verRentabilidad") && productos?.length
      ? productos.reduce((max, p) => (p.rentabilidad > max.rentabilidad ? p : max)).id
      : null;

  // Filtro por tipo: no vuelve a llamar a Supabase, solo esconde los que no son del tipo elegido
  const visibles = productos?.filter((p) => tipo === "todos" || p.tipo === tipo);

  const handleBuscar = (e) => {
    e.preventDefault();
    setFiltro(busqueda);
  };

  const handleVender = async (producto, cantidad) => {
    try {
      await venderProducto(producto.id, cantidad, usuario?.id ?? null);
      setAviso({
        tipo: "success",
        texto: `Listo: ${cantidad} × ${producto.nombre} por ${formatPrecio(producto.precio_publico * cantidad)}`,
      });
      recargar(); // refresca inventario disponible
    } catch (err) {
      setAviso({ tipo: "danger", texto: `No se pudo vender: ${err.message}` });
    }
  };

  return (
    <>
      <section className="portada d-flex flex-wrap align-items-center justify-content-between gap-3">
        <span className="sticker">¡Abierto!</span>
        <div>
          <h1>{MARCA.nombre}</h1>
          <p className="lema mb-0">{MARCA.lema} Copas y malteadas para todos los gustos.</p>
          {!isAuthenticated && (
            <Link to="/login" className="btn btn-primary mt-3">Entra para pedir</Link>
          )}
        </div>
        <img src="/logo.svg" alt="" width="110" height="110" className="d-none d-sm-block" />
      </section>

      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <h2 className="h2 mb-0">Lo que hay hoy</h2>
        <form className="d-flex gap-2" role="search" onSubmit={handleBuscar}>
          <input
            className="form-control"
            type="search"
            placeholder="¿Qué se te antoja?"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            aria-label="Buscar producto por nombre"
          />
          <button className="btn btn-outline-primary" type="submit">Buscar</button>
        </form>
      </div>

      <div className="filtro-tipo mb-4" role="group" aria-label="Filtrar por tipo">
        {TIPOS.map(([valor, texto]) => (
          <button
            key={valor}
            type="button"
            className={`btn btn-sm ${tipo === valor ? "btn-primary" : "btn-outline-primary"}`}
            aria-pressed={tipo === valor}
            onClick={() => setTipo(valor)}
          >
            {texto}
          </button>
        ))}
      </div>

      <Aviso aviso={aviso} onCerrar={() => setAviso(null)} />

      {loading && <Cargando texto="Sacando los helados del congelador..." />}
      {error && <ErrorCarga mensaje={error} onReintentar={recargar} />}

      {visibles && visibles.length === 0 && (
        <p className="text-center text-secondary py-5">
          {filtro ? `Nada con "${filtro}". Prueba con otra palabra.` : "No hay productos de este tipo por ahora."}
        </p>
      )}

      {visibles && visibles.length > 0 && (
        <div className="row g-4">
          {visibles.map((p) => (
            <div key={p.id} className="col-12 col-sm-6 col-lg-4 col-xl-3 col-producto">
              <ProductoCard producto={p} onVender={handleVender} esMasRentable={p.id === masRentableId} />
            </div>
          ))}
        </div>
      )}

      {/* Leyenda de colores */}
      {visibles && visibles.length > 0 && (
        <p className="small text-secondary mt-4 mb-0">
          <span className="chip-ing chip-base me-1">Base</span>
          <span className="chip-ing chip-complemento me-2">Complemento</span>
          Ingredientes de cada producto.
        </p>
      )}
    </>
  );
}
