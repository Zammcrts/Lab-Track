import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { useAuth } from '../useAuth'
import { useAhora, useMateriales, useMisPrestamos } from '../useDatos'
import Pagina from './Pagina'
import { Encabezado } from './Encabezado'
import EquipoIcono from './EquipoIcono'
import CampoFormulario from './CampoFormulario'
import ModalReglamento from './ModalReglamento'
import { guardarBolsita, vaciarBolsita } from '../data/usuarios'
import { solicitarPrestamo } from '../data/prestamos'
import { mensajeDeError } from '../logic/auth'
import { fechaCorta, diaRelativo, fechasDevolucion, hora, horariosRecoleccion, tiempoRestante } from '../logic/fechas'
import { generarCodigo } from '../logic/prestamos'
import {
  LIMITE_PIEZAS, MOTIVOS, articulosDeBolsita, crearSolicitud, maxDias, piezasEnPrestamo, validarSolicitud, venceBolsita,
} from '../logic/bolsita'

// "Hoy, 14 nov · 18:00"
function textoOpcion(fecha, ahora) {
  return `${diaRelativo(fecha, ahora)}, ${fechaCorta(fecha)} · ${hora(fecha)}`
}

export default function Bolsita() {
  const { usuario, perfil } = useAuth()
  const { materiales } = useMateriales()
  const prestamos = useMisPrestamos(usuario.uid)
  const ahora = useAhora()
  const navegar = useNavigate()

  const [indiceRecoleccion, setIndiceRecoleccion] = useState(0)
  const [indiceDevolucion, setIndiceDevolucion] = useState(-1) // -1 = el máximo permitido
  const [motivo, setMotivo] = useState(MOTIVOS[0])
  const [notas, setNotas] = useState('')
  const [acepta, setAcepta] = useState(false)
  const [errores, setErrores] = useState([])
  const [verReglamento, setVerReglamento] = useState(false)

  const bolsita = perfil.bolsita || []
  const articulos = articulosDeBolsita(bolsita, materiales)
  const vence = venceBolsita(perfil.bolsitaDesde)
  const expirada = vence && vence <= ahora

  // Si pasaron 24 h sin confirmar, la bolsita se libera.
  useEffect(() => {
    if (expirada) vaciarBolsita(usuario.uid)
  }, [expirada, usuario.uid])

  const horarios = horariosRecoleccion(ahora)
  const recoleccion = horarios[indiceRecoleccion] || horarios[0]
  const devoluciones = fechasDevolucion(recoleccion, maxDias(articulos))
  const devolucion = indiceDevolucion === -1 ? devoluciones.at(-1) : devoluciones[indiceDevolucion]

  const piezas = articulos.reduce((total, a) => total + a.cantidad, 0)

  function cambiarCantidad(materialId, cantidad) {
    const nueva = bolsita.map((item) => (item.materialId === materialId ? { ...item, cantidad } : item))
    guardarBolsita(usuario.uid, nueva, perfil.bolsitaDesde)
  }

  function quitar(materialId) {
    const nueva = bolsita.filter((item) => item.materialId !== materialId)
    guardarBolsita(usuario.uid, nueva, nueva.length ? perfil.bolsitaDesde : null)
  }

  async function solicitar(e) {
    e.preventDefault()
    const problemas = validarSolicitud({ articulos, aceptaReglamento: acepta, piezasActivas: piezasEnPrestamo(prestamos) })
    setErrores(problemas)
    if (problemas.length > 0) return

    const solicitud = crearSolicitud({
      uid: usuario.uid,
      perfil,
      articulos,
      fechaInicio: recoleccion,
      fechaLimite: devolucion,
      motivo,
      notas,
      codigo: generarCodigo(),
    })
    try {
      await solicitarPrestamo(usuario.uid, solicitud)
      navegar('/prestamos')
    } catch (error) {
      setErrores([mensajeDeError(error)])
    }
  }

  const subtitulo = articulos.length
    ? `${piezas} piezas apartadas · se liberan en ${tiempoRestante(vence, ahora)} si no confirmas`
    : 'Tu bolsita está vacía'

  return (
    <Pagina hero={<Encabezado titulo="Mi bolsita" subtitulo={subtitulo} />}>
      <div className="rejilla-bolsita">
        <article className="tarjeta">
          <div className="fila-entre tarjeta-titulo">
            <h3>Artículos</h3>
            <Link to="/buscar" className="enlace-rojo">+ Agregar más</Link>
          </div>
          {articulos.length === 0 && <p className="texto-suave">Agrega equipo desde el catálogo.</p>}
          <ul className="lista-articulos">
            {articulos.map((a) => (
              <li key={a.materialId} className="articulo">
                <EquipoIcono tamano="lg" />
                <div className="articulo-datos">
                  <strong>{a.material.nombre}</strong>
                  <small>{a.material.codigo} · préstamo máx. {a.material.maxDias} días</small>
                </div>
                <div className="contador">
                  <button type="button" onClick={() => cambiarCantidad(a.materialId, a.cantidad - 1)}
                    disabled={a.cantidad <= 1} aria-label="Quitar uno">
                    <Minus size={16} />
                  </button>
                  <span>{a.cantidad}</span>
                  <button type="button" className="mas" onClick={() => cambiarCantidad(a.materialId, a.cantidad + 1)}
                    disabled={a.cantidad >= a.material.disponibles || a.cantidad >= LIMITE_PIEZAS} aria-label="Agregar uno">
                    <Plus size={16} />
                  </button>
                </div>
                <button type="button" className="boton-icono boton-borrar" onClick={() => quitar(a.materialId)}
                  aria-label={`Quitar ${a.material.nombre}`}>
                  <Trash2 size={18} />
                </button>
              </li>
            ))}
          </ul>
        </article>

        <form className="tarjeta" onSubmit={solicitar}>
          <h3 className="tarjeta-titulo">Detalles del préstamo</h3>
          <CampoFormulario id="recoleccion" etiqueta="Recolección" como="select" value={indiceRecoleccion}
            onChange={(e) => setIndiceRecoleccion(Number(e.target.value))}>
            {horarios.map((fecha, i) => (
              <option key={i} value={i}>{textoOpcion(fecha, ahora)}</option>
            ))}
          </CampoFormulario>
          <CampoFormulario id="devolucion" etiqueta="Devolución" como="select"
            value={indiceDevolucion === -1 ? devoluciones.length - 1 : indiceDevolucion}
            onChange={(e) => setIndiceDevolucion(Number(e.target.value))}>
            {devoluciones.map((fecha, i) => (
              <option key={i} value={i}>{textoOpcion(fecha, ahora)}</option>
            ))}
          </CampoFormulario>
          <CampoFormulario id="motivo" etiqueta="Motivo" como="select" value={motivo} onChange={(e) => setMotivo(e.target.value)}>
            {MOTIVOS.map((m) => <option key={m}>{m}</option>)}
          </CampoFormulario>
          <CampoFormulario id="notas" etiqueta="Notas (opcional)" como="textarea" rows={3}
            placeholder="Materia, profesor o algo que deba saber el laboratorio"
            value={notas} onChange={(e) => setNotas(e.target.value)} />
          <label className="casilla casilla-reglamento">
            <input type="checkbox" checked={acepta} onChange={(e) => setAcepta(e.target.checked)} />
            <span>
              Acepto el <button type="button" className="enlace-boton" onClick={() => setVerReglamento(true)}>
                reglamento del laboratorio</button> y me hago responsable del equipo.
            </span>
          </label>
          {errores.length > 0 && (
            <ul className="alerta alerta-error lista-errores">
              {errores.map((e) => <li key={e}>{e}</li>)}
            </ul>
          )}
          <button type="submit" className="boton boton-primario boton-grande boton-ancho" disabled={articulos.length === 0}>
            Solicitar préstamo
          </button>
        </form>
      </div>

      {verReglamento && <ModalReglamento onCerrar={() => setVerReglamento(false)} />}
    </Pagina>
  )
}
