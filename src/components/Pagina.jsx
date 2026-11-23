import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  BarChart3, Bell, CalendarDays, History, House, Inbox, LogOut, Package, PackageCheck, Search, ShoppingBag, User,
} from 'lucide-react'
import { useAuth } from '../useAuth'
import { useAhora, useMateriales, useMisPrestamos } from '../useDatos'
import { iniciales } from '../logic/auth'
import { ESTADOS, estaVencido, nombrePrestamo } from '../logic/prestamos'
import { mismoDia } from '../logic/fechas'
import Logo from './Logo'

const MENU_ESTUDIANTE = [
  { ruta: '/inicio', texto: 'Inicio', Icono: House },
  { ruta: '/buscar', texto: 'Buscar', Icono: Search },
  { ruta: '/bolsita', texto: 'Bolsita', Icono: ShoppingBag },
  { ruta: '/prestamos', texto: 'Préstamos', Icono: CalendarDays },
  { ruta: '/historial', texto: 'Historial', Icono: History },
  { ruta: '/perfil', texto: 'Perfil', Icono: User },
]

const MENU_ENCARGADO = [
  { ruta: '/encargado/solicitudes', texto: 'Solicitudes', Icono: Inbox },
  { ruta: '/encargado/prestamos', texto: 'Préstamos', Icono: CalendarDays },
  { ruta: '/encargado/inventario', texto: 'Inventario', Icono: Package },
  { ruta: '/encargado/devoluciones', texto: 'Devoluciones', Icono: PackageCheck },
  { ruta: '/encargado/reportes', texto: 'Reportes', Icono: BarChart3 },
]

// Campana con avisos para el estudiante. Respeta las preferencias del perfil.
function Campana() {
  const { usuario, perfil } = useAuth()
  const prestamos = useMisPrestamos(usuario.uid)
  const { materiales } = useMateriales()
  const ahora = useAhora()
  const [abierta, setAbierta] = useState(false)
  const navegar = useNavigate()

  const avisos = []
  if (perfil.notificaciones?.vencimiento) {
    for (const p of prestamos) {
      if (estaVencido(p, ahora)) avisos.push({ texto: `${nombrePrestamo(p)} está vencido`, ruta: '/prestamos' })
      else if (p.estado === ESTADOS.ENTREGADO && mismoDia(p.fechaLimite, ahora)) {
        avisos.push({ texto: `${nombrePrestamo(p)} vence hoy`, ruta: '/prestamos' })
      }
    }
  }
  if (perfil.notificaciones?.recoleccion) {
    for (const p of prestamos) {
      if (p.estado === ESTADOS.RESERVADO) avisos.push({ texto: `${nombrePrestamo(p)} está listo para recoger`, ruta: '/prestamos' })
    }
  }
  for (const m of materiales) {
    if (perfil.avisos?.includes(m.id) && m.disponibles > 0) avisos.push({ texto: `${m.nombre} ya está disponible`, ruta: '/buscar' })
  }

  return (
    <div className="notificaciones">
      <button type="button" className="boton-topbar" aria-label="Notificaciones" onClick={() => setAbierta(!abierta)}>
        <Bell size={20} />
        {avisos.length > 0 && <span className="punto" />}
      </button>
      {abierta && (
        <div className="menu-notificaciones">
          <p className="menu-titulo">Notificaciones</p>
          {avisos.length === 0 && <p className="texto-suave menu-vacio">No tienes avisos por ahora.</p>}
          {avisos.map((aviso) => (
            <button key={aviso.texto} type="button" className="menu-item" onClick={() => navegar(aviso.ruta)}>
              <span className="menu-marca marca-rojo" />
              {aviso.texto}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function BusquedaSuperior() {
  const navegar = useNavigate()
  const [texto, setTexto] = useState('')
  return (
    <form
      className="busqueda-superior"
      onSubmit={(e) => {
        e.preventDefault()
        navegar(`/buscar?q=${encodeURIComponent(texto)}`)
      }}
    >
      <Search size={18} />
      <input type="search" placeholder="Buscar equipo, modelo o código" value={texto} onChange={(e) => setTexto(e.target.value)} />
    </form>
  )
}

// Estructura de todas las pantallas: banda roja, barra superior, menú lateral y contenido.
// "hero" es lo que va sobre la banda roja (título, subtítulo, cifras).
export default function Pagina({ hero, children, conBusqueda = true }) {
  const { perfil, cerrarSesion } = useAuth()
  const esEncargado = perfil.rol === 'encargado'
  const menu = esEncargado ? MENU_ENCARGADO : MENU_ESTUDIANTE
  const enBolsita = perfil.bolsita?.length || 0

  return (
    <div className="pagina">
      <div className="banda" />

      <header className="topbar">
        <Logo />
        <div className="topbar-derecha">
          {!esEncargado && conBusqueda && <BusquedaSuperior />}
          {!esEncargado && <Campana />}
          <Link to={esEncargado ? '/encargado/solicitudes' : '/perfil'} className="usuario">
            <span className="avatar">{iniciales(perfil.nombre)}</span>
            <span className="usuario-datos">
              <strong>{perfil.nombre}</strong>
              <small>{perfil.matricula}</small>
            </span>
          </Link>
        </div>
      </header>

      <nav className="barra-lateral">
        {menu.map(({ ruta, texto, Icono }) => (
          <NavLink key={ruta} to={ruta} className="nav-item">
            <span className="nav-icono">
              <Icono size={22} strokeWidth={1.75} />
              {ruta === '/bolsita' && enBolsita > 0 && <span className="nav-contador">{enBolsita}</span>}
            </span>
            <span className="nav-texto">{texto}</span>
          </NavLink>
        ))}
        {esEncargado && (
          <button type="button" className="nav-item" onClick={cerrarSesion}>
            <LogOut size={22} strokeWidth={1.75} />
            <span className="nav-texto">Salir</span>
          </button>
        )}
      </nav>

      <section className="hero">{hero}</section>
      <main className="contenido">{children}</main>
    </div>
  )
}
