import { useState } from 'react'
import { useAhora, useTodosLosPrestamos } from '../useDatos'
import Pagina from './Pagina'
import { Encabezado, Estadisticas } from './Encabezado'
import Chip from './Chip'
import ListaArticulos from './ListaArticulos'
import ModalDevolucion from './ModalDevolucion'
import { diaYHora, fechaCorta, tiempoRestante } from '../logic/fechas'
import { ESTADOS, estaVencido, etiquetaEstado, ordenarPorFecha } from '../logic/prestamos'

// RF-12 y RF-13: material prestado en este momento; los vencidos se resaltan.
export default function PrestamosActivos() {
  const prestamos = useTodosLosPrestamos()
  const ahora = useAhora()
  const [recibiendo, setRecibiendo] = useState(null)
  const [mensaje, setMensaje] = useState('')

  const enPrestamo = ordenarPorFecha(prestamos.filter((p) => p.estado === ESTADOS.ENTREGADO))
  const vencidos = enPrestamo.filter((p) => estaVencido(p, ahora))
  const venceHoy = enPrestamo.filter((p) => etiquetaEstado(p, ahora).texto === 'Vence hoy')

  return (
    <Pagina
      hero={
        <>
          <Encabezado titulo="Préstamos activos" subtitulo="Material fuera del laboratorio, ordenado por fecha límite" />
          <Estadisticas
            datos={[
              { valor: enPrestamo.length, texto: 'En préstamo' },
              { valor: venceHoy.length, texto: 'Vencen hoy' },
              { valor: vencidos.length, texto: 'Vencidos' },
              { valor: prestamos.filter((p) => p.estado === ESTADOS.RESERVADO).length, texto: 'Por entregar' },
            ]}
          />
        </>
      }
    >
      {mensaje && <p className="alerta alerta-exito">{mensaje}</p>}
      <article className="tarjeta">
        {enPrestamo.length === 0 ? (
          <p className="texto-suave">No hay material en préstamo.</p>
        ) : (
          <div className="tabla-contenedor">
            <table className="tabla">
              <thead>
                <tr><th>Estudiante</th><th>Artículos</th><th>Prestado</th><th>Vence</th><th>Restante</th><th>Estado</th><th></th></tr>
              </thead>
              <tbody>
                {enPrestamo.map((p) => {
                  const estado = etiquetaEstado(p, ahora)
                  return (
                    <tr key={p.id} className={estaVencido(p, ahora) ? 'fila-vencida' : ''}>
                      <td><span className="celda-texto"><strong>{p.estudianteNombre}</strong><small>{p.estudianteMatricula}</small></span></td>
                      <td><ListaArticulos items={p.items} /></td>
                      <td className="sin-salto">{fechaCorta(p.fechaInicio)}</td>
                      <td className="sin-salto">{diaYHora(p.fechaLimite, ahora)}</td>
                      <td className="sin-salto">{tiempoRestante(p.fechaLimite, ahora)}</td>
                      <td><Chip color={estado.color}>{estado.texto}</Chip></td>
                      <td className="celda-accion">
                        <button type="button" className="boton boton-chico boton-primario" onClick={() => setRecibiendo(p)}>
                          Registrar devolución
                        </button>
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
