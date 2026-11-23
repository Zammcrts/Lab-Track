// Reglas de la bolsita (carrito) y de la solicitud de préstamo.
import { aFecha } from './fechas'
import { ESTADOS, contarPiezas, estaActivo } from './prestamos'

export const LIMITE_PIEZAS = 6 // piezas que un estudiante puede tener a la vez
export const HORAS_APARTADO = 24 // la bolsita se libera si no se confirma
export const MOTIVOS = ['Proyecto de clase', 'Práctica de laboratorio', 'Tesis o investigación', 'Otro']

// Une cada artículo de la bolsita con los datos de su material.
export function articulosDeBolsita(bolsita = [], materiales) {
  const articulos = []
  for (const item of bolsita) {
    const material = materiales.find((m) => m.id === item.materialId)
    if (material) articulos.push({ ...item, material })
  }
  return articulos
}

// Fecha en que se libera la bolsita.
export function venceBolsita(bolsitaDesde) {
  if (!bolsitaDesde) return null
  return new Date(aFecha(bolsitaDesde).getTime() + HORAS_APARTADO * 60 * 60 * 1000)
}

// El préstamo dura lo que permita el material con menos días.
export function maxDias(articulos) {
  if (articulos.length === 0) return 0
  return Math.min(...articulos.map((a) => a.material.maxDias))
}

// Piezas que el estudiante ya tiene en préstamos activos.
export function piezasEnPrestamo(prestamos) {
  return prestamos.filter(estaActivo).reduce((total, p) => total + contarPiezas(p), 0)
}

// Devuelve una lista de errores; si está vacía, la solicitud es válida.
export function validarSolicitud({ articulos, aceptaReglamento, piezasActivas }) {
  const errores = []
  if (articulos.length === 0) errores.push('Tu bolsita está vacía.')

  let piezasNuevas = 0
  for (const a of articulos) {
    piezasNuevas += a.cantidad
    if (a.cantidad > a.material.disponibles) {
      errores.push(`Solo hay ${a.material.disponibles} de ${a.material.nombre}.`)
    }
  }
  if (piezasActivas + piezasNuevas > LIMITE_PIEZAS) {
    errores.push(`Puedes tener hasta ${LIMITE_PIEZAS} piezas a la vez; ya tienes ${piezasActivas} en préstamo.`)
  }
  if (!aceptaReglamento) errores.push('Debes aceptar el reglamento del laboratorio.')
  return errores
}

// Documento que se guarda en la colección "prestamos".
export function crearSolicitud({ uid, perfil, articulos, fechaInicio, fechaLimite, motivo, notas, codigo }) {
  return {
    estudianteId: uid,
    estudianteNombre: perfil.nombre,
    estudianteMatricula: perfil.matricula,
    items: articulos.map((a) => ({
      materialId: a.materialId,
      codigo: a.material.codigo,
      nombre: a.material.nombre,
      cantidad: a.cantidad,
    })),
    estado: ESTADOS.PENDIENTE,
    fechaInicio,
    fechaLimite,
    fechaDevolucion: null,
    motivo,
    notas: notas.trim(),
    observaciones: '',
    codigo,
    renovado: false,
  }
}
