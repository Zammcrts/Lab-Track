import { useState } from 'react'
import Modal from './Modal'
import { POLITICA_LAB, firmaValida } from '../logic/politica'

// Ventana pequeña con la política. Para aceptar hay que "firmar" escribiendo la matrícula.
export default function ModalPolitica({ matricula, onAceptar, onCerrar }) {
  const [firma, setFirma] = useState('')
  const sinMatricula = !matricula.trim()
  const puedeAceptar = firmaValida(firma, matricula)

  return (
    <Modal titulo="Política del laboratorio" onCerrar={onCerrar} chico>
      <ol className="politica-texto">
        {POLITICA_LAB.map((punto) => <li key={punto}>{punto}</li>)}
      </ol>

      <div className="campo politica-firma">
        <label htmlFor="firma" className="etiqueta">Firma con tu matrícula</label>
        <input id="firma" className="entrada" autoComplete="off" disabled={sinMatricula}
          placeholder={sinMatricula ? 'Primero escribe tu matrícula en el formulario' : matricula.trim().toUpperCase()}
          value={firma} onChange={(e) => setFirma(e.target.value)} />
        {!sinMatricula && firma && !puedeAceptar && (
          <p className="campo-error">Debe coincidir con la matrícula del formulario.</p>
        )}
      </div>

      <div className="botones-par">
        <button type="button" className="boton boton-secundario" onClick={onCerrar}>Cancelar</button>
        <button type="button" className="boton boton-primario" disabled={!puedeAceptar} onClick={onAceptar}>
          Acepto y firmo
        </button>
      </div>
    </Modal>
  )
}
