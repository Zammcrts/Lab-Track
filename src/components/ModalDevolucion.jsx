import { useState } from 'react'
import Modal from './Modal'
import { registrarDevolucion } from '../data/prestamos'
import { mensajeDeError } from '../logic/auth'

// Registro de la devolución: el encargado marca las piezas que llegaron dañadas (RF-16, RF-17).
export default function ModalDevolucion({ prestamo, onCerrar, onListo }) {
  const [danados, setDanados] = useState([])
  const [observaciones, setObservaciones] = useState('')
  const [error, setError] = useState('')

  function marcar(materialId, danado) {
    if (danado) setDanados([...danados, materialId])
    else setDanados(danados.filter((id) => id !== materialId))
  }

  async function guardar() {
    if (danados.length > 0 && !observaciones.trim()) {
      setError('Describe el daño en las observaciones.')
      return
    }
    try {
      await registrarDevolucion(prestamo, danados, observaciones.trim())
      onListo()
    } catch (err) {
      setError(mensajeDeError(err))
    }
  }

  return (
    <Modal titulo="Registrar devolución" onCerrar={onCerrar}>
      <div className="detalle">
        <p className="texto-suave">{prestamo.estudianteNombre} · código {prestamo.codigo}</p>
        {prestamo.items.map((item) => (
          <label key={item.materialId} className="casilla devolucion-item">
            <input type="checkbox" checked={danados.includes(item.materialId)}
              onChange={(e) => marcar(item.materialId, e.target.checked)} />
            <span><strong>{item.nombre} × {item.cantidad}</strong> — llegó dañado</span>
          </label>
        ))}
        <textarea className="entrada" rows={3} placeholder="Observaciones (obligatorio si hay daños)"
          value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
        <p className="texto-suave texto-chico">Lo que llega bien vuelve al inventario; lo dañado pasa a reparación.</p>
        {error && <p className="alerta alerta-error">{error}</p>}
        <button type="button" className="boton boton-primario boton-grande boton-ancho" onClick={guardar}>
          Registrar devolución
        </button>
      </div>
    </Modal>
  )
}
