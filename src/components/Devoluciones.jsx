import { useState } from 'react'
import { useAhora, useTodosLosPrestamos } from '../useDatos'
import Pagina from './Pagina'
import { Encabezado } from './Encabezado'
import Chip from './Chip'
import ListaArticulos from './ListaArticulos'
import ModalDevolucion from './ModalDevolucion'
import { aFecha, diaYHora, fechaCorta } from '../logic/fechas'
import { ESTADOS, etiquetaEstado, ordenarPorFecha } from '../logic/prestamos'

// RF-16, RF-17 y RF-18: registrar devoluciones y consultar el historial.
export default function Devoluciones() {
  const prestamos = useTodosLosPrestamos()
  const ahora = useAhora()
  const [recibiendo, setRecibiendo] = useState(null)
  const [mensaje, setMensaje] = useState('')

  const porRecibir = ordenarPorFecha(prestamos.filter((p) => p.estado === ESTADOS.ENTREGADO))
  const historial = prestamos
    .filter((p) => p.estado === ESTADOS.DEVUELTO)
    .sort((a, b) => aFecha(b.fechaDevolucion) - aFecha(a.fechaDevolucion))

  return (
    <Pagina hero={<Encabezado titulo="Devoluciones" subtitulo={`${porRecibir.length} por recibir · ${historial.length} registradas`} />}>
      {mensaje && <p className="alerta alerta-exito">{mensaje}</p>}

      <article className="tarjeta">
        <h3 className="tarjeta-titulo">Por recibir</h3>
        {porRecibir.length === 0 && <p className="texto-suave">No hay préstamos por recibir.</p>}
        {porRecibir.length > 0 && (
          <div className="tabla-contenedor">
            <table className="tabla">
              <thead><tr><th>Estudiante</th><th>Artículos</th><th>Código</th><th>Vence</th><th></th></tr></thead>
              <tbody>
                {porRecibir.map((p) => (
                  <tr key={p.id}>
                    <td><span className="celda-texto"><strong>{p.estudianteNombre}</strong><small>{p.estudianteMatricula}</small></span></td>
                    <td><ListaArticulos items={p.items} /></td>
                    <td>{p.codigo}</td>
                    <td className="sin-salto">{diaYHora(p.fechaLimite, ahora)}</td>
                    <td className="celda-accion">
                      <button type="button" className="boton boton-chico boton-primario" onClick={() => setRecibiendo(p)}>
                        Registrar devolución
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>

      <article className="tarjeta">
        <h3 className="tarjeta-titulo">Historial de devoluciones</h3>
        {historial.length === 0 && <p className="texto-suave">Todavía no hay devoluciones.</p>}
        {historial.length > 0 && (
          <div className="tabla-contenedor">
            <table className="tabla">
              <thead><tr><th>Estudiante</th><th>Artículos</th><th>Fecha límite</th><th>Devuelto</th><th>Puntualidad</th><th>Material</th></tr></thead>
              <tbody>
                {historial.map((p) => {
                  const estado = etiquetaEstado(p, ahora)
                  const danado = p.items.some((i) => i.estadoDevolucion === 'dañado')
                  return (
                    <tr key={p.id}>
                      <td><span className="celda-texto"><strong>{p.estudianteNombre}</strong><small>{p.estudianteMatricula}</small></span></td>
                      <td><ListaArticulos items={p.items} /></td>
                      <td>{fechaCorta(p.fechaLimite)}</td>
                      <td>{fechaCorta(p.fechaDevolucion)}</td>
                      <td><Chip color={estado.color}>{estado.texto}</Chip></td>
                      <td>
                        <span className="celda-texto">
                          {danado ? <Chip color="rojo">Con daños</Chip> : <Chip color="verde">Buen estado</Chip>}
                          {p.observaciones && <small>{p.observaciones}</small>}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </article>

      {recibiendo && (
        <ModalDevolucion
          prestamo={recibiendo}
          onCerrar={() => setRecibiendo(null)}
          onListo={() => {
            setMensaje(`Devolución de ${recibiendo.estudianteNombre} registrada.`)
            setRecibiendo(null)
          }}
        />
      )}
    </Pagina>
  )
}
