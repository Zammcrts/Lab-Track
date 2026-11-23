import { useEffect, useState } from 'react'
import { AuthContext } from './useAuth'
import { cerrarSesion, crearCuenta, enviarRecuperacion, escucharSesion, iniciarSesion } from './data/auth'
import { crearPerfil, escucharPerfil } from './data/usuarios'

// Guarda quién inició sesión (usuario) y sus datos de la colección "usuarios" (perfil).
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let dejarDeEscucharPerfil = null

    const dejarDeEscucharSesion = escucharSesion((usuarioFirebase) => {
      if (dejarDeEscucharPerfil) dejarDeEscucharPerfil()
      setUsuario(usuarioFirebase)

      if (!usuarioFirebase) {
        setPerfil(null)
        setCargando(false)
        return
      }

      // El perfil se escucha en tiempo real: si cambia el rol o la bolsita, la app se actualiza.
      dejarDeEscucharPerfil = escucharPerfil(usuarioFirebase.uid, (datos) => {
        setPerfil(datos)
        setCargando(false)
      })
    })

    return () => {
      if (dejarDeEscucharPerfil) dejarDeEscucharPerfil()
      dejarDeEscucharSesion()
    }
  }, [])

  async function registrar({ nombre, matricula, correo, contrasena }) {
    const nuevo = await crearCuenta(correo.trim(), contrasena, nombre.trim())
    await crearPerfil(nuevo.uid, {
      nombre: nombre.trim(),
      matricula: matricula.trim().toUpperCase(),
      correo: correo.trim().toLowerCase(),
    })
  }

  const valor = {
    usuario,
    perfil,
    cargando,
    iniciarSesion,
    registrar,
    recuperarContrasena: enviarRecuperacion,
    cerrarSesion,
  }

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}
