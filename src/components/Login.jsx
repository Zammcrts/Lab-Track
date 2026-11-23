import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useAuth } from '../useAuth'
import PantallaAcceso from './PantallaAcceso'
import CampoFormulario from './CampoFormulario'
import { correoDesdeIdentificador, mensajeDeError, rutaInicio, validarLogin } from '../logic/auth'

export default function Login() {
  const { usuario, perfil, iniciarSesion } = useAuth()
  const [identificador, setIdentificador] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [recordar, setRecordar] = useState(true)
  const [errores, setErrores] = useState({})
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  // Si ya inició sesión, lo mandamos a su pantalla de inicio.
  if (usuario && perfil) return <Navigate to={rutaInicio(perfil.rol)} replace />

  async function entrar(e) {
    e.preventDefault()
    setError('')
    const nuevosErrores = validarLogin({ identificador, contrasena })
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    setEnviando(true)
    try {
      await iniciarSesion(correoDesdeIdentificador(identificador), contrasena, recordar)
    } catch (err) {
      setError(mensajeDeError(err))
    }
    setEnviando(false)
  }

  return (
    <PantallaAcceso
      titulo="Iniciar sesión"
      subtitulo="Usa tu cuenta institucional"
      pie={<>¿Primera vez? <Link to="/registro">Solicita acceso al laboratorio</Link></>}
    >
      <form onSubmit={entrar} noValidate>
        {error && <p className="alerta alerta-error">{error}</p>}
        <CampoFormulario id="identificador" etiqueta="Matrícula o correo" placeholder="A01234567"
          value={identificador} onChange={(e) => setIdentificador(e.target.value)} error={errores.identificador} />
        <CampoFormulario id="contrasena" etiqueta="Contraseña" type="password" placeholder="••••••••"
          value={contrasena} onChange={(e) => setContrasena(e.target.value)} error={errores.contrasena} />
        <div className="fila-entre acceso-opciones">
          <label className="casilla">
            <input type="checkbox" checked={recordar} onChange={(e) => setRecordar(e.target.checked)} />
            Recordarme
          </label>
          <Link to="/recuperar">¿Olvidaste tu contraseña?</Link>
        </div>
        <button type="submit" className="boton boton-primario boton-grande boton-ancho" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'} <ArrowRight size={20} />
        </button>
      </form>
    </PantallaAcceso>
  )
}
