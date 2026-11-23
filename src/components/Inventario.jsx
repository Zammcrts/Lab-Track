import { useState } from 'react'
import { useMateriales, useTodosLosPrestamos } from '../useDatos'
import Pagina from './Pagina'
import { Encabezado, Estadisticas } from './Encabezado'
import Chip from './Chip'
import CampoFormulario from './CampoFormulario'
import { agregarMaterial, cambiarActivo, cargarCatalogoEjemplo, marcarReparada } from '../data/materiales'
import { mensajeDeError } from '../logic/auth'
import { CATEGORIAS } from '../logic/catalogo'
import { estaActivo } from '../logic/prestamos'

const FORM_VACIO = { codigo: '', nombre: '', categoria: CATEGORIAS[0], total: 1, maxDias: 7, ubicacion: '' }

// RF-14 y RF-15: alta y baja de material.
export default function Inventario() {
  const { materiales } = useMateriales()
  const prestamos = useTodosLosPrestamos()
  const [form, setForm] = useState(FORM_VACIO)
  const [mensaje, setMensaje] = useState(null)

  const ordenados = [...materiales].sort((a, b) => a.codigo.localeCompare(b.codigo))
  const activos = materiales.filter((m) => m.activo)

  const cambiar = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  async function hacer(accion, textoExito) {
    try {
      await accion()
      setMensaje({ tipo: 'exito', texto: textoExito })
    } catch (error) {
      setMensaje({ tipo: 'error', texto: mensajeDeError(error) })
    }
  }

  async function agregar(e) {
    e.preventDefault()
    if (!form.codigo.trim() || !form.nombre.trim() || !form.ubicacion.trim()) {
      setMensaje({ tipo: 'error', texto: 'Llena el código, el nombre y la ubicación.' })
      return
    }
    await hacer(
      () => agregarMaterial({
        codigo: form.codigo.trim().toUpperCase(),
        nombre: form.nombre.trim(),
        categoria: form.categoria,
        total: Number(form.total),
        maxDias: Number(form.maxDias),
        ubicacion: form.ubicacion.trim(),
      }),
      `${form.nombre} se agregó al inventario.`,
    )
    setForm(FORM_VACIO)
  }

  // Solo se puede dar de baja si nadie tiene ese material en un préstamo activo.
  function darDeBaja(material) {
    const enUso = prestamos.some((p) => estaActivo(p) && p.items.some((i) => i.materialId === material.id))
    if (enUso) {
      setMensaje({ tipo: 'error', texto: `${material.nombre} tiene préstamos activos; no se puede dar de baja.` })
      return
    }
    hacer(() => cambiarActivo(material.id, false), `${material.nombre} se dio de baja.`)
  }

  return (
    <Pagina
      hero={
        <>
          <Encabezado titulo="Inventario" subtitulo="Alta y baja del material del laboratorio" />
          <Estadisticas
            datos={[
              { valor: activos.length, texto: 'Materiales activos' },
              { valor: activos.reduce((t, m) => t + m.total, 0), texto: 'Piezas en total' },
              { valor: activos.reduce((t, m) => t + m.disponibles, 0), texto: 'Piezas disponibles' },
              { valor: activos.reduce((t, m) => t + m.enReparacion, 0), texto: 'En reparación' },
            ]}
          />
        </>
      }
    >
      {mensaje && <p className={`alerta alerta-${mensaje.tipo}`}>{mensaje.texto}</p>}

      <article className="tarjeta">
        <h3 className="tarjeta-titulo">Dar de alta material</h3>
        <form className="form-material" onSubmit={agregar}>
          <CampoFormulario id="codigo" etiqueta="Código" placeholder="MC-012" value={form.codigo} onChange={cambiar} />
          <CampoFormulario id="nombre" etiqueta="Nombre" placeholder="Arduino UNO R3" value={form.nombre} onChange={cambiar} />
          <CampoFormulario id="categoria" etiqueta="Categoría" como="select" value={form.categoria} onChange={cambiar}>
            {CATEGORIAS.map((c) => <option key={c}>{c}</option>)}
          </CampoFormulario>
          <CampoFormulario id="total" etiqueta="Piezas" type="number" min="1" value={form.total} onChange={cambiar} />
          <CampoFormulario id="maxDias" etiqueta="Máx. días" type="number" min="1" value={form.maxDias} onChange={cambiar} />
          <CampoFormulario id="ubicacion" etiqueta="Ubicación" placeholder="Estante A1" value={form.ubicacion} onChange={cambiar} />
          <button type="submit" className="boton boton-primario">Agregar</button>
        </form>
        {materiales.length === 0 && (
          <div className="aviso-semilla">
            <p>El inventario está vacío. Puedes cargar un catálogo de ejemplo para probar.</p>
            <button type="button" className="boton boton-primario"
              onClick={() => hacer(cargarCatalogoEjemplo, 'Catálogo de ejemplo cargado.')}>
              Cargar catálogo de ejemplo
            </button>
          </div>
        )}
      </article>

      <article className="tarjeta">
        <h3 className="tarjeta-titulo">Material registrado</h3>
        <div className="tabla-contenedor">
          <table className="tabla">
            <thead>
              <tr><th>Código</th><th>Material</th><th>Ubicación</th><th>Disponibles</th><th>Estado</th><th></th></tr>
            </thead>
            <tbody>
              {ordenados.map((m) => (
                <tr key={m.id} className={m.activo ? '' : 'fila-inactiva'}>
                  <td>{m.codigo}</td>
                  <td><span className="celda-texto"><strong>{m.nombre}</strong><small>{m.categoria} · máx. {m.maxDias} días</small></span></td>
                  <td className="sin-salto">{m.ubicacion}</td>
                  <td>
                    <span className="celda-texto">
                      {m.disponibles} / {m.total}
                      {m.enReparacion > 0 && <small className="texto-rojo">{m.enReparacion} en reparación</small>}
                    </span>
                  </td>
                  <td><Chip color={m.activo ? 'verde' : 'gris'}>{m.activo ? 'Activo' : 'De baja'}</Chip></td>
                  <td className="celda-accion">
                    <div className="acciones-fila">
                      {m.enReparacion > 0 && (
                        <button type="button" className="enlace-boton enlace-rojo"
                          onClick={() => hacer(() => marcarReparada(m.id), `Una pieza de ${m.nombre} volvió a estar disponible.`)}>
                          Reparada
                        </button>
                      )}
                      {m.activo ? (
                        <button type="button" className="enlace-boton enlace-rojo" onClick={() => darDeBaja(m)}>Dar de baja</button>
                      ) : (
                        <button type="button" className="enlace-boton enlace-rojo"
                          onClick={() => hacer(() => cambiarActivo(m.id, true), `${m.nombre} se reactivó.`)}>
                          Reactivar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </Pagina>
  )
}
