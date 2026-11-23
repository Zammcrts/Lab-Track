import { NavLink } from 'react-router-dom'

// Título y subtítulo de cada pantalla, sobre la banda roja.
export function Encabezado({ antetitulo, titulo, subtitulo, acciones }) {
  return (
    <div className="encabezado">
      <div>
        {antetitulo && <p className="antetitulo">{antetitulo}</p>}
        <h1>{titulo}</h1>
        {subtitulo && <p className="subtitulo-hero">{subtitulo}</p>}
      </div>
      {acciones && <div className="encabezado-acciones">{acciones}</div>}
    </div>
  )
}

// Fila de tarjetas con cifras sobre la banda roja.
export function Estadisticas({ datos }) {
  return (
    <div className="estadisticas">
      {datos.map(({ valor, texto }) => (
        <div key={texto} className="estadistica">
          <span className="estadistica-valor">{valor}</span>
          <span className="estadistica-texto">{texto}</span>
        </div>
      ))}
    </div>
  )
}

// Selector Activos / Historial de la sección de préstamos.
export function PestanasPrestamos() {
  return (
    <div className="pestanas" role="tablist">
      <NavLink to="/prestamos" className="pestana" role="tab">
        Activos
      </NavLink>
      <NavLink to="/historial" className="pestana" role="tab">
        Historial
      </NavLink>
    </div>
  )
}
