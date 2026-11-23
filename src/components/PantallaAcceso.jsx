import { Clock, Search, ShoppingBag } from 'lucide-react'
import Logo from './Logo'

const FUNCIONES = [
  { Icono: Search, texto: 'Busca en el catálogo' },
  { Icono: ShoppingBag, texto: 'Aparta en tu bolsita' },
  { Icono: Clock, texto: 'Avisos de vencimiento' },
]

// Estructura de login, registro y recuperación: panel rojo a la izquierda y tarjeta a la derecha.
export default function PantallaAcceso({ titulo, subtitulo, children, pie }) {
  return (
    <main className="acceso">
      <section className="acceso-marca">
        <span className="circulo circulo-1" aria-hidden="true" />
        <span className="circulo circulo-2" aria-hidden="true" />
        <Logo grande />
        <div className="acceso-mensaje">
          <h1>Pide, recoge y devuelve equipo sin filas.</h1>
          <p>
            Sistema de préstamos del laboratorio: arma tu bolsita, aparta tu horario de recolección y recibe avisos
            antes de cada vencimiento.
          </p>
        </div>
        <ul className="acceso-funciones">
          {FUNCIONES.map(({ Icono, texto }) => (
            <li key={texto}>
              <Icono size={22} strokeWidth={1.75} aria-hidden="true" />
              <span>{texto}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="acceso-panel">
        <div className="tarjeta-acceso">
          <h2>{titulo}</h2>
          {subtitulo && <p className="texto-suave acceso-subtitulo">{subtitulo}</p>}
          {children}
          {pie && <p className="acceso-pie">{pie}</p>}
        </div>
      </section>
    </main>
  )
}
