import Modal from './Modal'
import { LIMITE_PIEZAS } from '../logic/bolsita'

export default function ModalReglamento({ onCerrar }) {
  return (
    <Modal titulo="Reglamento del laboratorio" onCerrar={onCerrar}>
      <ol className="reglamento">
        <li>El préstamo es personal; recoge el material con tu credencial.</li>
        <li>Puedes tener hasta {LIMITE_PIEZAS} piezas en préstamo al mismo tiempo.</li>
        <li>Tu bolsita se aparta 24 h; si no confirmas, se libera.</li>
        <li>Devuelve el material completo y a tiempo. Puedes renovar una vez por 3 días.</li>
        <li>Reporta cualquier daño al devolver el equipo.</li>
      </ol>
    </Modal>
  )
}
