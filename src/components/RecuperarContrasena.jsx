import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../useAuth'
import PantallaAcceso from './PantallaAcceso'
import CampoFormulario from './CampoFormulario'
import { correoDesdeIdentificador, mensajeDeError } from '../logic/auth'

export default function RecuperarContrasena() {
  const { recuperarContrasena } = useAuth()
  const [identificador, setIdentificador] = useState('')
  const [error, setError] = useState('')
  const [enviado, setEnviado] = useState(false)

  async function enviar(e) {
    e.preventDefault()
    const correo = correoDesdeIdentificador(identificador)
    if (!correo) {
      setError('Escribe tu matrícula o tu correo completo.')
      return
    }
    try {
      await recuperarContrasena(correo)
      setEnviado(true)
    } catch (err) {
      setError(mensajeDeError(err))
    }
  }

  return (
    <PantallaAcceso
      titulo="Recuperar contraseña"
      subtitulo="Te enviaremos un enlace para restablecerla"
      pie={<Link to="/login">Volver a iniciar sesión</Link>}
    >
      {enviado ? (
        <p className="alerta alerta-exito">Revisa tu correo: te enviamos las instrucciones.</p>
      ) : (
        <form onSubmit={enviar} noValidate>
          <CampoFormulario id="identificador" etiqueta="Matrícula o correo" placeholder="A01234567"
            value={identificador} onChange={(e) => setIdentificador(e.target.value)} error={error} />
          <button type="submit" className="boton boton-primario boton-grande boton-ancho">Enviar enlace</button>
        </form>
      )}
    </PantallaAcceso>
  )
}
