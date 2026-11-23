// Reglas de los préstamos.
import { aFecha, diasEntre, mismoDia } from './fechas'

// Ciclo de vida: pendiente → reservado → entregado → devuelto (o rechazado)
export const ESTADOS = {
  PENDIENTE: 'pendiente',
  RESERVADO: 'reservado',
  ENTREGADO: 'entregado',
  DEVUELTO: 'devuelto',
  RECHAZADO: 'rechazado',
}

export const DIAS_RENOVACION = 3

export function estaActivo(prestamo) {
  return [ESTADOS.PENDIENTE, ESTADOS.RESERVADO, ESTADOS.ENTREGADO].includes(prestamo.estado)
}

export function estaVencido(prestamo, ahora) {
  return prestamo.estado === ESTADOS.ENTREGADO && aFecha(prestamo.fechaLimite) < ahora
}

// Total de piezas de un préstamo (suma de cantidades).
export function contarPiezas(prestamo) {
  return prestamo.items.reduce((total, item) => total + item.cantidad, 0)
}

// "Sensor HC-SR04 × 2" o "Arduino UNO R3 y 2 más"
export function nombrePrestamo(prestamo) {
  const primero = prestamo.items[0]
  let nombre = primero.nombre
  if (primero.cantidad > 1) nombre += ` × ${primero.cantidad}`
  if (prestamo.items.length > 1) nombre += ` y ${prestamo.items.length - 1} más`
  return nombre
}

// Días de retraso al devolver (0 si se devolvió a tiempo).
export function diasRetraso(prestamo) {
  if (!prestamo.fechaDevolucion) return 0
  return Math.max(0, diasEntre(prestamo.fechaLimite, prestamo.fechaDevolucion))
}

// Texto y color de la etiqueta de estado.
export function etiquetaEstado(prestamo, ahora) {
  if (prestamo.estado === ESTADOS.PENDIENTE) return { texto: 'Solicitado', color: 'gris' }
  if (prestamo.estado === ESTADOS.RESERVADO) return { texto: 'Por recoger', color: 'oscuro' }
  if (prestamo.estado === ESTADOS.RECHAZADO) return { texto: 'Rechazado', color: 'gris' }

  if (prestamo.estado === ESTADOS.DEVUELTO) {
    const retraso = diasRetraso(prestamo)
    if (retraso === 0) return { texto: 'A tiempo', color: 'verde' }
    return { texto: `${retraso} ${retraso === 1 ? 'día' : 'días'} de retraso`, color: 'ambar' }
  }

  // Entregado: depende de cuánto falta para la fecha límite
  const limite = aFecha(prestamo.fechaLimite)
  if (limite < ahora) return { texto: 'Vencido', color: 'rojo' }
  if (mismoDia(limite, ahora)) return { texto: 'Vence hoy', color: 'rojo' }
  if (diasEntre(ahora, limite) === 1) return { texto: 'Por vencer', color: 'ambar' }
  return { texto: 'En curso', color: 'verde' }
}

// Ordena por la fecha que importa: la recolección si falta recoger, si no la fecha límite.
export function ordenarPorFecha(prestamos) {
  const fechaClave = (p) => aFecha(p.estado === ESTADOS.ENTREGADO ? p.fechaLimite : p.fechaInicio)
  return [...prestamos].sort((a, b) => fechaClave(a) - fechaClave(b))
}

// El estudiante puede renovar una sola vez, solo si ya tiene el material y no ha vencido.
export function puedeRenovar(prestamo, ahora) {
  return prestamo.estado === ESTADOS.ENTREGADO && !prestamo.renovado && !estaVencido(prestamo, ahora)
}

export function fechaRenovada(prestamo) {
  const nueva = new Date(aFecha(prestamo.fechaLimite))
  nueva.setDate(nueva.getDate() + DIAS_RENOVACION)
  return nueva
}

// Cifras de las tarjetas rojas del inicio.
export function resumenInicio(prestamos, ahora) {
  const enMano = prestamos.filter((p) => p.estado === ESTADOS.ENTREGADO)
  const reservados = prestamos.filter((p) => p.estado === ESTADOS.RESERVADO)
  return {
    activos: prestamos.filter(estaActivo).length,
    venceHoy: enMano.filter((p) => mismoDia(p.fechaLimite, ahora)).length,
    porRecoger: reservados.length,
    recogerHoy: reservados.filter((p) => mismoDia(p.fechaInicio, ahora)).length,
    porcentajeATiempo: porcentajeATiempo(prestamos),
  }
}

export function porcentajeATiempo(prestamos) {
  const devueltos = prestamos.filter((p) => p.estado === ESTADOS.DEVUELTO)
  if (devueltos.length === 0) return null
  const aTiempo = devueltos.filter((p) => diasRetraso(p) === 0).length
  return Math.round((aTiempo / devueltos.length) * 100)
}

// Cifras del historial.
export function estadisticasHistorial(prestamos) {
  const devueltos = prestamos.filter((p) => p.estado === ESTADOS.DEVUELTO)
  const aTiempo = devueltos.filter((p) => diasRetraso(p) === 0).length
  let diasTotales = 0
  for (const p of devueltos) diasTotales += diasEntre(p.fechaInicio, p.fechaDevolucion)
  return {
    total: devueltos.length,
    aTiempo,
    conRetraso: devueltos.length - aTiempo,
    diasPromedio: devueltos.length ? Math.round((diasTotales / devueltos.length) * 10) / 10 : 0,
  }
}

// Reporte del encargado (RF-19): estudiantes con más devoluciones tardías.
export function reporteRetrasos(prestamos) {
  const porEstudiante = {}
  for (const p of prestamos) {
    if (p.estado !== ESTADOS.DEVUELTO) continue
    if (!porEstudiante[p.estudianteId]) {
      porEstudiante[p.estudianteId] = { nombre: p.estudianteNombre, matricula: p.estudianteMatricula, devoluciones: 0, tardias: 0 }
    }
    porEstudiante[p.estudianteId].devoluciones++
    if (diasRetraso(p) > 0) porEstudiante[p.estudianteId].tardias++
  }
  return Object.values(porEstudiante)
    .filter((e) => e.tardias > 0)
    .sort((a, b) => b.tardias - a.tardias)
}

// Código que el estudiante muestra en mostrador, por ejemplo "PK-4821".
export function generarCodigo() {
  return 'PK-' + Math.floor(1000 + Math.random() * 9000)
}
