export default function Cargando({ enLinea = false }) {
  return (
    <div className={enLinea ? 'cargando-linea' : 'pantalla-centro'} role="status" aria-live="polite">
      <span className="spinner" aria-hidden="true" />
      <span className="sr-only">Cargando…</span>
    </div>
  )
}
