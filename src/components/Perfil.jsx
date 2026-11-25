import { useState } from 'react'
import { FileText, LogOut } from 'lucide-react'
import { useAuth } from '../useAuth'
import { useAhora, useMisPrestamos } from '../useDatos'
import Pagina from './Pagina'
import { Encabezado } from './Encabezado'
import Chip from './Chip'
import CampoFormulario from './CampoFormulario'
import ModalReglamento from './ModalReglamento'
import { actualizarPerfil } from '../data/usuarios'
import { iniciales } from '../logic/auth'
import { LIMITE_PIEZAS, piezasEnPrestamo } from '../logic/bolsita'
import { ESTADOS, estaVencido, porcentajeATiempo } from '../logic/prestamos'

// Interruptor de encendido/apagado
function Interruptor({ activo, onCambio }) {
  return (
    <button type="button" role="switch" aria-checked={activo} className={`interruptor ${activo ? 'activo' : ''}`}
      onClick={() => onCambio(!activo)}>
      <span />
    </button>
  )
}

export default function Perfil() {
  const { usuario, perfil, cerrarSesion } = useAuth()
  const prestamos = useMisPrestamos(usuario.uid)
  const ahora = useAhora()
  const [editando, setEditando] = useState(false)
  const [datos, setDatos] = useState({ telefono: '', carrera: '', semestre: '' })
  const [verReglamento, setVerReglamento] = useState(false)

  const total = prestamos.filter((p) => p.estado !== ESTADOS.RECHAZADO).length
  const porcentaje = porcentajeATiempo(prestamos)
  const tieneVencidos = prestamos.some((p) => estaVencido(p, ahora))
  const notificaciones = perfil.notificaciones || { vencimiento: true, recoleccion: true }

  function editar() {
    setDatos({ telefono: perfil.telefono, carrera: perfil.carrera, semestre: perfil.semestre })
    setEditando(true)
  }

  async function guardar(e) {
    e.preventDefault()
    await actualizarPerfil(usuario.uid, datos)
    setEditando(false)
  }

  function cambiarNotificacion(clave, valor) {
    actualizarPerfil(usuario.uid, { notificaciones: { ...notificaciones, [clave]: valor } })
  }

  const cambiar = (e) => setDatos({ ...datos, [e.target.name]: e.target.value })
  // Mientras edita se muestran los datos del formulario; si no, los guardados.
  const valor = (campo) => (editando ? datos[campo] : perfil[campo])

  return (
    <Pagina hero={<Encabezado titulo="Mi perfil" subtitulo="Tus datos, tu estatus en el laboratorio y tus avisos" />}>
      <div className="rejilla-perfil">
        <article className="tarjeta tarjeta-perfil">
          <span className="avatar-grande">{iniciales(perfil.nombre)}</span>
          <h2>{perfil.nombre}</h2>
          {perfil.carrera && <p className="texto-suave">{perfil.carrera} · {perfil.semestre}.° semestre</p>}
          <p className="texto-suave">Matrícula {perfil.matricula}</p>
          {tieneVencidos ? <Chip color="ambar">Con préstamo vencido</Chip> : <Chip color="verde">Sin adeudos</Chip>}
          <dl className="perfil-cifras">
            <div><dt>Préstamos</dt><dd>{total}</dd></div>
            <div><dt>A tiempo</dt><dd className="texto-verde">{porcentaje === null ? '—' : `${porcentaje}%`}</dd></div>
            <div><dt>Límite</dt><dd>{piezasEnPrestamo(prestamos)} / {LIMITE_PIEZAS}</dd></div>
          </dl>
          <button type="button" className="boton boton-secundario boton-ancho" onClick={editar} disabled={editando}>
            Editar perfil
          </button>
        </article>

        <div className="columna">
          <form className="tarjeta" onSubmit={guardar}>
            <h3 className="tarjeta-titulo">Datos personales</h3>
            <div className="rejilla-campos">
              <CampoFormulario id="correo" etiqueta="Correo institucional" value={perfil.correo} readOnly />
              <CampoFormulario id="telefono" etiqueta="Teléfono" placeholder="Sin registrar"
                value={valor('telefono')} onChange={cambiar} readOnly={!editando} />
              <CampoFormulario id="carrera" etiqueta="Carrera" placeholder="Sin registrar"
                value={valor('carrera')} onChange={cambiar} readOnly={!editando} />
              <CampoFormulario id="semestre" etiqueta="Semestre" placeholder="Sin registrar"
                value={valor('semestre')} onChange={cambiar} readOnly={!editando} />
              <CampoFormulario id="matricula" etiqueta="Matrícula" value={perfil.matricula} readOnly />
              <CampoFormulario id="tipo" etiqueta="Tipo de usuario" value="Estudiante" readOnly />
            </div>
            {editando && (
              <div className="botones-par">
                <button type="button" className="boton boton-secundario" onClick={() => setEditando(false)}>Cancelar</button>
                <button type="submit" className="boton boton-primario">Guardar cambios</button>
              </div>
            )}
          </form>

          <article className="tarjeta">
            <h3 className="tarjeta-titulo">Notificaciones</h3>
            <ul className="lista-ajustes">
              <li>
                <span><strong>Recordatorio de vencimiento</strong><small>Aviso el día que vence tu préstamo</small></span>
                <Interruptor activo={notificaciones.vencimiento} onCambio={(v) => cambiarNotificacion('vencimiento', v)} />
              </li>
              <li>
                <span><strong>Aviso de recolección</strong><small>Cuando tu pedido esté listo en mostrador</small></span>
                <Interruptor activo={notificaciones.recoleccion} onCambio={(v) => cambiarNotificacion('recoleccion', v)} />
              </li>
            </ul>
          </article>

          <div className="botones-par">
            <button type="button" className="boton boton-blanco boton-grande" onClick={() => setVerReglamento(true)}>
              <FileText size={20} className="texto-rojo" /> Reglamento del laboratorio
            </button>
            <button type="button" className="boton boton-peligro boton-grande" onClick={cerrarSesion}>
              <LogOut size={20} /> Cerrar sesión
            </button>
          </div>
        </div>
      </div>

      {verReglamento && <ModalReglamento onCerrar={() => setVerReglamento(false)} />}
    </Pagina>
  )
}
