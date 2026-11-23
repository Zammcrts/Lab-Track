import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../useAuth'
import PantallaAcceso from './PantallaAcceso'
import CampoFormulario from './CampoFormulario'
import { mensajeDeError, rutaInicio, validarRegistro } from '../logic/auth'

// El registro siempre crea cuentas de estudiante.
export default function Registro() {
  const { usuario, perfil, registrar } = useAuth()
  const [form, setForm] = useState({ nombre: '', matricula: '', correo: '', contrasena: '', confirmacion: '' })
  const [errores, setErrores] = useState({})
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (usuario && perfil) return <Navigate to={rutaInicio(perfil.rol)} replace />

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function enviar(e) {
    e.preventDefault()
    setError('')
    const nuevosErrores = validarRegistro(form)
    setErrores(nuevosErrores)
    if (Object.keys(nuevosErrores).length > 0) return

    setEnviando(true)
    try {
      await registrar(form)
    } catch (err) {
      setError(mensajeDeError(err))
      setEnviando(false)
    }
  }

  return (
    <PantallaAcceso
      titulo="Solicitar acceso"
      subtitulo="Crea tu cuenta de estudiante"
      pie={<>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></>}
    >
      <form onSubmit={enviar} noValidate>
        {error && <p className="alerta alerta-error">{error}</p>}
        <CampoFormulario id="nombre" etiqueta="Nombre completo" value={form.nombre} onChange={cambiar} error={errores.nombre} />
        <CampoFormulario id="matricula" etiqueta="Matrícula" placeholder="A01234567" value={form.matricula}
          onChange={cambiar} error={errores.matricula} />
        <CampoFormulario id="correo" etiqueta="Correo institucional" type="email" value={form.correo}
          onChange={cambiar} error={errores.correo} />
        <div className="fila-campos">
          <CampoFormulario id="contrasena" etiqueta="Contraseña" type="password" value={form.contrasena}
            onChange={cambiar} error={errores.contrasena} />
          <CampoFormulario id="confirmacion" etiqueta="Confirmar" type="password" value={form.confirmacion}
            onChange={cambiar} error={errores.confirmacion} />
        </div>
        <button type="submit" className="boton boton-primario boton-grande boton-ancho" disabled={enviando}>
          {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
        </button>
      </form>
    </PantallaAcceso>
  )
}
