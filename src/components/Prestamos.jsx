import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../useAuth'
import { useAhora, useMisPrestamos } from '../useDatos'
import Pagina from './Pagina'
import { Encabezado, PestanasPrestamos } from './Encabezado'
import Chip from './Chip'
import EquipoIcono from './EquipoIcono'
import ModalQR from './ModalQR'
import { renovarPrestamo } from '../data/prestamos'
import { mensajeDeError } from '../logic/auth'
import { diaYHora, fechaCorta, tiempoRestante } from '../logic/fechas'
import { DIAS_RENOVACION, ESTADOS, estaActivo, etiquetaEstado, nombrePrestamo, ordenarPorFecha, puedeRenovar } from '../logic/prestamos'

export default function Prestamos() {
  const { usuario } = useAuth()
  const prestamos = useMisPrestamos(usuario.uid)
  const ahora = useAhora()
  const [mensaje, setMensaje] = useState(null)
  const [qr, setQr] = useState(null)

  const activos = ordenarPorFecha(prestamos.filter(estaActivo))
  const destacados = activos.slice(0, 3)
  const filas = activos.flatMap((p) => p.items.map((item) => ({ prestamo: p, item })))
  const venceHoy = activos.filter((p) => etiquetaEstado(p, ahora).texto === 'Vence hoy').length

  async function renovar(prestamo) {
    try {
      await renovarPrestamo(prestamo)
      setMensaje({ tipo: 'exito', texto: `${nombrePrestamo(prestamo)}: renovado ${DIAS_RENOVACION} días más.` })
    } catch (error) {
      setMensaje({ tipo: 'error', texto: mensajeDeError(error) })
    }
  }

  return (
    <Pagina
      hero={
        <Encabezado
          titulo="Mis préstamos"
          subtitulo={`${filas.length} artículos activos · ${venceHoy} vence hoy`}
          acciones={<PestanasPrestamos />}
        />
      }
    >
      {mensaje && <p className={`alerta alerta-${mensaje.tipo}`}>{mensaje.texto}</p>}

      {activos.length === 0 && (
        <div className="tarjeta tarjeta-vacia">
          <h3>No tienes préstamos activos</h3>
          <Link to="/buscar" className="boton boton-primario">Buscar equipo</Link>
        </div>
      )}

      {/* Tarjetas de lo más urgente */}
      <div className="rejilla-3">
        {destacados.map((p) => {
          const estado = etiquetaEstado(p, ahora)

          if (p.estado === ESTADOS.RESERVADO) {
            return (
              <article key={p.id} className="tarjeta tarjeta-oscura tarjeta-chica">
                <div className="fila-entre">
                  <p className="antetitulo-tarjeta">Por recoger</p>
                  <Chip color="oscuro-claro">{diaYHora(p.fechaInicio, ahora)}</Chip>
                </div>
                <div className="destacado">
                  <EquipoIcono variante="oscuro" bolsa />
                  <div className="destacado-texto">
                    <h3>{nombrePrestamo(p)}</h3>
                    <p>Mostrador A · código {p.codigo}</p>
                  </div>
                </div>
                <button type="button" className="boton boton-blanco boton-ancho" onClick={() => setQr(p)}>
                  Mostrar QR de recolección
                </button>
              </article>
            )
          }

          return (
            <article key={p.id} className={`tarjeta tarjeta-chica ${estado.color === 'rojo' ? 'tarjeta-urgente' : ''}`}>
              <div className="fila-entre">
                <p className="antetitulo-tarjeta">{p.estado === ESTADOS.PENDIENTE ? 'En revisión' : estado.texto}</p>
                <Chip color={estado.color}>{diaYHora(p.fechaLimite, ahora)}</Chip>
              </div>
              <div className="destacado">
                <EquipoIcono />
                <div className="destacado-texto">
                  <h3>{nombrePrestamo(p)}</h3>
                  {p.estado === ESTADOS.ENTREGADO
                    ? <strong className="texto-rojo">Faltan {tiempoRestante(p.fechaLimite, ahora)}</strong>
                    : <p className="texto-suave">Esperando aprobación del laboratorio</p>}
                </div>
              </div>
              <button type="button" className="boton boton-secundario" onClick={() => renovar(p)}
                disabled={!puedeRenovar(p, ahora)}>
                Renovar {DIAS_RENOVACION} días
              </button>
            </article>
          )
        })}
      </div>

      {/* Tabla con todos los artículos activos */}
      {filas.length > 0 && (
        <article className="tarjeta">
          <div className="fila-entre tarjeta-titulo">
            <h3>Todos los préstamos activos</h3>
            <span className="texto-suave">Ordenado por fecha de vencimiento</span>
          </div>
          <div className="tabla-contenedor">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Equipo</th>
                  <th>Cant.</th>
                  <th>Prestado</th>
                  <th>Vence</th>
                  <th>Tiempo restante</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filas.map(({ prestamo, item }) => {
                  const estado = etiquetaEstado(prestamo, ahora)
                  const entregado = prestamo.estado === ESTADOS.ENTREGADO
                  return (
                    <tr key={prestamo.id + item.materialId}>
                      <td>
                        <span className="celda-equipo">
                          <EquipoIcono tamano="sm" />
                          <span><strong>{item.nombre}</strong><small>{item.codigo}</small></span>
                        </span>
                      </td>
                      <td>{item.cantidad}</td>
                      <td className="texto-suave">
                        {entregado ? fechaCorta(prestamo.fechaInicio) : `Recoger ${diaYHora(prestamo.fechaInicio, ahora)}`}
                      </td>
                      <td className="sin-salto">{diaYHora(prestamo.fechaLimite, ahora)}</td>
                      <td className="texto-suave sin-salto">{entregado ? tiempoRestante(prestamo.fechaLimite, ahora) : '—'}</td>
                      <td><Chip color={estado.color}>{estado.texto}</Chip></td>
                      <td className="celda-accion">
                        {prestamo.estado === ESTADOS.RESERVADO && (
                          <button type="button" className="enlace-boton enlace-rojo" onClick={() => setQr(prestamo)}>Ver QR</button>
                        )}
                        {puedeRenovar(prestamo, ahora) && (
                          <button type="button" className="enlace-boton enlace-rojo" onClick={() => renovar(prestamo)}>Renovar</button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </article>
      )}

      {qr && <ModalQR prestamo={qr} ahora={ahora} onCerrar={() => setQr(null)} />}
    </Pagina>
  )
}
