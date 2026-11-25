
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const MESES_LARGOS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const DIAS_LARGOS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

const UNA_HORA = 60 * 60 * 1000

// Firebase guarda las fechas como Timestamp; esto las convierte a Date.
export function aFecha(valor) {
  if (!valor) return null
  if (valor.toDate) return valor.toDate()
  return new Date(valor)
}

export function mismoDia(a, b) {
  return aFecha(a).toDateString() === aFecha(b).toDateString()
}

// Días de calendario entre dos fechas (sin contar horas).
export function diasEntre(a, b) {
  const inicio = new Date(aFecha(a))
  const fin = new Date(aFecha(b))
  inicio.setHours(0, 0, 0, 0)
  fin.setHours(0, 0, 0, 0)
  return Math.round((fin - inicio) / (24 * UNA_HORA))
}

// "15:00"
export function hora(valor) {
  const fecha = aFecha(valor)
  return fecha.toTimeString().slice(0, 5)
}

// "14 nov"
export function fechaCorta(valor) {
  const fecha = aFecha(valor)
  if (!fecha) return '—'
  return `${fecha.getDate()} ${MESES[fecha.getMonth()]}`
}

// "Sábado, 14 de noviembre"
export function fechaLarga(valor) {
  const fecha = aFecha(valor)
  return `${DIAS_LARGOS[fecha.getDay()]}, ${fecha.getDate()} de ${MESES_LARGOS[fecha.getMonth()]}`
}

// "DOM" para las cajitas de fecha
export function nombreDia(valor) {
  return DIAS[aFecha(valor).getDay()]
}

// "Hoy", "Mañana" o "Vie 28"
export function diaRelativo(valor, ahora) {
  const fecha = aFecha(valor)
  const dias = diasEntre(ahora, fecha)
  if (dias === 0) return 'Hoy'
  if (dias === 1) return 'Mañana'
  return `${DIAS[fecha.getDay()]} ${fecha.getDate()}`
}

// "Hoy · 15:00"
export function diaYHora(valor, ahora) {
  return `${diaRelativo(valor, ahora)} · ${hora(valor)}`
}

// "2 h 15 min", "21 h", "3 días" o "Vencido"
export function tiempoRestante(valor, ahora) {
  const ms = aFecha(valor) - ahora
  if (ms <= 0) return 'Vencido'
  const horas = Math.floor(ms / UNA_HORA)
  const minutos = Math.floor((ms % UNA_HORA) / (60 * 1000))
  if (horas >= 48) return `${Math.floor(horas / 24)} días`
  if (horas === 0) return `${minutos} min`
  if (minutos === 0) return `${horas} h`
  return `${horas} h ${minutos} min`
}

// Horarios de recolección: 10:00, 14:00 y 18:00, desde hoy hasta 7 días adelante.
// Permite reservar con anticipación (RF-07).
export function horariosRecoleccion(ahora, dias = 7) {
  const horarios = []
  for (let dia = 0; dia < dias; dia++) {
    for (const h of [10, 14, 18]) {
      const fecha = new Date(ahora)
      fecha.setDate(fecha.getDate() + dia)
      fecha.setHours(h, 0, 0, 0)
      if (fecha > ahora) horarios.push(fecha)
    }
  }
  return horarios
}

// Fechas de devolución: de 1 día hasta el máximo permitido, siempre a las 15:00.
export function fechasDevolucion(inicio, maxDias) {
  const fechas = []
  for (let dia = 1; dia <= maxDias; dia++) {
    const fecha = new Date(inicio)
    fecha.setDate(fecha.getDate() + dia)
    fecha.setHours(15, 0, 0, 0)
    fechas.push(fecha)
  }
  return fechas
}
