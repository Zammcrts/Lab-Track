import { useMateriales, useTodosLosPrestamos } from '../useDatos'
import Pagina from './Pagina'
import { Encabezado, Estadisticas } from './Encabezado'
import { ESTADOS, porcentajeATiempo, reporteRetrasos } from '../logic/prestamos'

// RF-19: estudiantes que devuelven tarde con más frecuencia.
export default function Reportes() {
  const prestamos = useTodosLosPrestamos()
  const { materiales } = useMateriales()

  const filas = reporteRetrasos(prestamos)
  const porcentaje = porcentajeATiempo(prestamos)
  const devueltos = prestamos.filter((p) => p.estado === ESTADOS.DEVUELTO).length
  const enReparacion = materiales.reduce((total, m) => total + m.enReparacion, 0)

  return (
    <Pagina
      hero={
        <>
          <Encabezado titulo="Reportes" subtitulo="Puntualidad de las devoluciones" />
          <Estadisticas
            datos={[
              { valor: devueltos, texto: 'Devoluciones' },
              { valor: porcentaje === null ? '—' : `${porcentaje}%`, texto: 'A tiempo' },
              { valor: filas.length, texto: 'Estudiantes con retrasos' },
              { valor: enReparacion, texto: 'Piezas en reparación' },
            ]}
          />
        </>
      }
    >
      <article className="tarjeta">
        <h3 className="tarjeta-titulo">Devoluciones tardías por estudiante</h3>
        {filas.length === 0 ? (
          <p className="texto-suave">Ningún estudiante ha devuelto material tarde.</p>
        ) : (
          <div className="tabla-contenedor">
            <table className="tabla">
              <thead><tr><th>#</th><th>Estudiante</th><th>Devoluciones</th><th>Tardías</th></tr></thead>
              <tbody>
                {filas.map((f, i) => (
                  <tr key={f.matricula}>
                    <td className="texto-suave">{i + 1}</td>
                    <td><span className="celda-texto"><strong>{f.nombre}</strong><small>{f.matricula}</small></span></td>
                    <td>{f.devoluciones}</td>
                    <td><strong className="texto-rojo">{f.tardias}</strong></td>
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
