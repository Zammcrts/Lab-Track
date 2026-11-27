import { X } from 'lucide-react'

// Ventana emergente. Se cierra con el botón X o al hacer clic afuera.
// chico = ventana más angosta (por ejemplo, la política del laboratorio).
export default function Modal({ titulo, onCerrar, children, chico = false }) {
  return (
    <div className="modal-fondo" onClick={onCerrar}>
      <div className={`modal ${chico ? 'modal-chico' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="modal-encabezado">
          <h2>{titulo}</h2>
          <button type="button" className="boton-icono" onClick={onCerrar} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
