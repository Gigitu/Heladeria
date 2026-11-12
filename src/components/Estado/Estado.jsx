// Pequeños componentes para estados de carga, error y mensajes

export function Cargando({ texto = "Cargando..." }) {
  return (
    <div className="text-center py-5 text-secondary">
      <div className="spinner-border text-primary mb-3" role="status" aria-hidden="true" />
      <p>{texto}</p>
    </div>
  );
}

export function ErrorCarga({ mensaje, onReintentar }) {
  return (
    <div className="alert alert-danger d-flex flex-wrap align-items-center justify-content-between gap-2" role="alert">
      <span>⚠️ {mensaje}</span>
      {onReintentar && (
        <button className="btn btn-sm btn-outline-danger" onClick={onReintentar}>
          Reintentar
        </button>
      )}
    </div>
  );
}

// aviso = { tipo: "success" | "danger" | "warning", texto }
export function Aviso({ aviso, onCerrar }) {
  if (!aviso) return null;
  return (
    <div className={`alert alert-${aviso.tipo} alert-dismissible`} role="alert">
      {aviso.texto}
      <button type="button" className="btn-close" aria-label="Cerrar" onClick={onCerrar} />
    </div>
  );
}
