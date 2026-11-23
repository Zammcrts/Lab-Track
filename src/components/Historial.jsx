import { useState } from 'react'
import { Download } from 'lucide-react'
import { useAuth } from '../useAuth'
import { useAhora, useMisPrestamos } from '../useDatos'
import Pagina from './Pagina'
import { Encabezado, Estadisticas, PestanasPrestamos } from './Encabezado'
import Chip from './Chip'
import EquipoIcono from './EquipoIcono'
import { aFecha, fechaCorta } from '../logic/fechas'
import { ESTADOS, diasRetraso, estadisticasHistorial, etiquetaEstado } from '../logic/prestamos'

// Descarga el historial como archivo CSV (se abre en Excel).
function exportarCSV(filas, ahora) {
  const lineas = ['Equipo,Código,Cantidad,Prestado,Fecha límite,Devuelto,Estado']
  for (const { prestamo, item } of filas) {
    lineas.push([
      item.nombre, item.codigo, item.cantidad, fechaCorta(prestamo.fechaInicio),
      fechaCorta(prestamo.fechaLimite), fechaCorta(prestamo.fechaDevolucion), etiquetaEstado(prestamo, ahora).texto,
    ].join(','))
  }
  const archivo = new Blob(['﻿' + lineas.join('\n')], { type: 'text/csv;charset=utf-8' })
  const enlace = document.createElement('a')
  enlace.href = URL.createObjectURL(archivo)
  enlace.download = 'historial.csv'
  enlace.click()
}

export default function Historial() {
  const { usuario } = useAuth()
  const prestamos = useMisPrestamos(usuario.uid)
  const ahora = useAhora()
  const [filtro, setFiltro] = useState('Todo')

  const stats = estadisticasHistorial(prestamos)
  let devueltos = prestamos.filter((p) => p.estado === ESTADOS.DEVUELTO)
  if (filtro === 'A tiempo') devueltos = devueltos.filter((p) => diasRetraso(p) === 0)
  if (filtro === 'Con retraso') devueltos = devueltos.filter((p) => diasRetraso(p) > 0)
  devueltos.sort((a, b) => aFecha(b.fechaDevolucion) - aFecha(a.fechaDevolucion))
  const filas = devueltos.flatMap((p) => p.items.map((item) => ({ prestamo: p, item })))

  return (
    <Pagina
      hero={
        <>
          <Encabezado titulo="Historial" subtitulo="Todo lo que has pedido prestado" acciones={<PestanasPrestamos />} />
          <Estadisticas
            datos={[
              { valor: stats.total, texto: 'Préstamos totales' },
              { valor: stats.aTiempo, texto: 'Devueltos a tiempo' },
              { valor: stats.conRetraso, texto: 'Con retraso' },
              { valor: stats.diasPromedio, texto: 'Días promedio' },
            ]}
          />
        </>
      }
    >
      <article className="tarjeta">
        <div className="fila-entre">
          <div className="filtros">
            {['Todo', 'A tiempo', 'Con retraso'].map((f) => (
              <button key={f} type="button" className={`filtro ${filtro === f ? 'activo' : ''}`} onClick={() => setFiltro(f)}>
                {f}
              </button>
            ))}
          </div>
          <button type="button" className="boton boton-secundario" onClick={() => exportarCSV(filas, ahora)} disabled={!filas.length}>
            <Download size={18} /> Exportar
          </button>
        </div>

        {filas.length === 0 ? (
          <p className="texto-suave">Aún no hay préstamos devueltos.</p>
        ) : (
          <div className="tabla-contenedor">
            <table className="tabla">
              <thead>
                <tr>
                  <th>Equipo</th>
                  <th>Cant.</th>
                  <th>Prestado</th>
                  <th>Fecha límite</th>
                  <th>Devuelto</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filas.map(({ prestamo, item }) => {
                  const estado = etiquetaEstado(prestamo, ahora)
                  return (
                    <tr key={prestamo.id + item.materialId}>
                      <td>
                        <span className="celda-equipo">
                          <EquipoIcono tamano="sm" variante="gris" />
                          <span><strong>{item.nombre}</strong><small>{item.codigo}</small></span>
                        </span>
                      </td>
                      <td>{item.cantidad}</td>
                      <td className="texto-suave">{fechaCorta(prestamo.fechaInicio)}</td>
                      <td className="texto-suave">{fechaCorta(prestamo.fechaLimite)}</td>
                      <td>{fechaCorta(prestamo.fechaDevolucion)}</td>
                      <td><Chip color={estado.color}>{estado.texto}</Chip></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </article>
    </Pagina>
  )
}
