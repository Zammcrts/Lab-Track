import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../useAuth'
import Cargando from './Cargando'
import { rutaInicio } from '../logic/auth'

// Solo deja pasar a usuarios con sesión y con el rol indicado.
// (La seguridad real de los datos está en firestore.rules)
export default function RutaProtegida({ rol }) {
  const { usuario, perfil, cargando } = useAuth()

  if (cargando) return <Cargando />
  if (!usuario) return <Navigate to="/login" replace />
  if (!perfil) return <p className="pantalla-centro">Tu cuenta no tiene perfil. Acude con el encargado del laboratorio.</p>
  if (perfil.rol !== rol) return <Navigate to={rutaInicio(perfil.rol)} replace />
  return <Outlet />
}
