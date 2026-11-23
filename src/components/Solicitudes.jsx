import { useState } from 'react'
import { useAhora, useMateriales, useTodosLosPrestamos } from '../useDatos'
import Pagina from './Pagina'
import { Encabezado, Estadisticas } from './Encabezado'
import ListaArticulos from './ListaArticulos'
import { aprobarPrestamo, rechazarPrestamo, registrarEntrega } from '../data/prestamos'
import { mensajeDeError } from '../logic/auth'
import { diaYHora } from '../logic/fechas'
import { ESTADOS, estaVencido, ordenarPorFecha } from '../logic/prestamos'

// RF-11: aprobar o rechazar solicitudes y registrar la entrega.
export default function Solicitudes() {
  const prestamos = useTodosLosPrestamos()
  const { materiales } = useMateriales()
  const ahora = useAhora()
  const [mensaje, setMensaje] = useState(null)

  const pendientes = ordenarPorFecha(prestamos.filter((p) => p.estado === ESTADOS.PENDIENTE))
  const reservados = ordenarPorFecha(prestamos.filter((p) => p.estado === ESTADOS.RESERVADO))
  const enPrestamo = prestamos.filter((p) => p.estado === ESTADOS.ENTREGADO)
  const vencidos = enPrestamo.filter((p) => estaVencido(p, ahora))

  // Ejecuta una acción y muestra el resultado.
  async function hacer(accion, textoExito) {
    try {
      await accion()
      setMensaje({ tipo: 'exito', texto: textoExito })
    } catch (error) {
      setMensaje({ tipo: 'error', texto: mensajeDeError(error) })
    }
  }

  return (
    <Pagina
      hero={
        <>
          <Encabezado titulo="Solicitudes" subtitulo="Aprueba las solicitudes y registra la entrega del material" />
          <Estadisticas
            datos={[
              { valor: pendientes.length, texto: 'Por aprobar' },
              { valor: reservados.length, texto: 'Por entregar' },
              { valor: enPrestamo.length, texto: 'En préstamo' },
              { valor: vencidos.length, texto: 'Vencidos' },
            ]}
          />
        </>
      }
    >
      {mensaje && <p className={`alerta alerta-${mensaje.tipo}`}>{mensaje.texto}</p>}

      <article className="tarjeta">
        <h3 className="tarjeta-titulo">Por aprobar</h3>
        {pendientes.length === 0 ? (
          <p className="texto-suave">No hay solicitudes pendientes.</p>
        ) : (
          <div className="tabla-contenedor">
            <table className="tabla">
              <thead>
                <tr><th>Estudiante</th><th>Artículos</th><th>Recolección</th><th>Devolución</th><th>Motivo</th><th></th></tr>
              </thead>
              <tbody>
                {pendientes.map((p) => (
                  <tr key={p.id}>
                    <td><span className="celda-texto"><strong>{p.estudianteNombre}</strong><small>{p.estudianteMatricula}</small></span></td>
                    <td><ListaArticulos items={p.items} /></td>
                    <td className="sin-salto">{diaYHora(p.fechaInicio, ahora)}</td>
                    <td className="sin-salto">{diaYHora(p.fechaLimite, ahora)}</td>
                    <td><span className="celda-texto">{p.motivo}<small>{p.notas}</small></span></td>
                    <td className="celda-accion">
                      <div className="acciones-fila">
                        <button type="button" className="boton boton-chico boton-primario"
                          onClick={() => hacer(() => aprobarPrestamo(p, materiales), 'Solicitud aprobada.')}>
                          Aprobar
                        </button>
                        <button type="button" className="boton boton-chico boton-secundario"
                          onClick={() => hacer(() => rechazarPrestamo(p), 'Solicitud rechazada.')}>
                          Rechazar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>

      <article className="tarjeta">
        <div className="fila-entre tarjeta-titulo">
          <h3>Reservados · registrar entrega</h3>
          <span className="texto-suave">Al entregar se descuentan las piezas del inventario</span>
        </div>
        {reservados.length === 0 ? (
          <p className="texto-suave">No hay material por entregar.</p>
        ) : (
          <div className="tabla-contenedor">
            <table className="tabla">
              <thead>
                <tr><th>Estudiante</th><th>Artículos</th><th>Código</th><th>Recolección</th><th></th></tr>
              </thead>
              <tbody>
                {reservados.map((p) => (
                  <tr key={p.id}>
                    <td><span className="celda-texto"><strong>{p.estudianteNombre}</strong><small>{p.estudianteMatricula}</small></span></td>
                    <td><ListaArticulos items={p.items} /></td>
                    <td><strong>{p.codigo}</strong></td>
                    <td className="sin-salto">{diaYHora(p.fechaInicio, ahora)}</td>
                    <td className="celda-accion">
                      <div className="acciones-fila">
                        <button type="button" className="boton boton-chico boton-primario"
                          onClick={() => hacer(() => registrarEntrega(p), `Entrega registrada (${p.codigo}).`)}>
                          Registrar entrega
                        </button>
                        <button type="button" className="boton boton-chico boton-secundario"
                          onClick={() => hacer(() => rechazarPrestamo(p), 'Reserva cancelada.')}>
                          Cancelar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </Pagina>
  )
}
