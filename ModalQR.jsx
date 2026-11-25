import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import Modal from './Modal'
import { nombrePrestamo } from '../logic/prestamos'
import { diaYHora } from '../logic/fechas'

// Muestra el QR con el código de recolección para enseñarlo en mostrador.
export default function ModalQR({ prestamo, ahora, onCerrar }) {
  const [imagen, setImagen] = useState('')

  useEffect(() => {
    QRCode.toDataURL(prestamo.codigo, { width: 240, margin: 1 }).then(setImagen)
  }, [prestamo.codigo])

  return (
    <Modal titulo="Código de recolección" onCerrar={onCerrar}>
      <div className="qr">
        {imagen && <img src={imagen} alt={`QR del código ${prestamo.codigo}`} />}
        <p className="qr-codigo">{prestamo.codigo}</p>
        <p className="texto-suave">
          {nombrePrestamo(prestamo)} · Mostrador A
          <br />
          {diaYHora(prestamo.fechaInicio, ahora)} · trae tu credencial
        </p>
      </div>
    </Modal>
  )
}
