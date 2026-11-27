import Modal from './Modal'
import { POLITICA_LAB } from '../logic/politica'

export default function ModalReglamento({ onCerrar }) {
  return (
    <Modal titulo="Reglamento del laboratorio" onCerrar={onCerrar} chico>
      <ol className="politica-texto">
        {POLITICA_LAB.map((punto) => <li key={punto}>{punto}</li>)}
      </ol>
    </Modal>
  )
}
