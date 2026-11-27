export const ROLES = { ESTUDIANTE: 'estudiante', ENCARGADO: 'encargado' }

// Dominio del correo institucional (se configura en el archivo .env).
export const DOMINIO = (import.meta.env.VITE_DOMINIO_INSTITUCIONAL || '').trim().toLowerCase()

const FORMATO_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Permite entrar con matrícula: "A01234567" → "a01234567@universidad.mx"
export function correoDesdeIdentificador(texto, dominio = DOMINIO) {
  const valor = texto.trim().toLowerCase()
  if (!valor) return null
  if (valor.includes('@')) return valor
  if (!dominio) return null
  return `${valor}@${dominio}`
}

export function validarLogin({ identificador, contrasena }, dominio = DOMINIO) {
  const errores = {}
  const correo = correoDesdeIdentificador(identificador, dominio)
  if (!identificador.trim()) errores.identificador = 'Ingresa tu matrícula o correo.'
  else if (!correo) errores.identificador = 'Escribe tu correo completo.'
  else if (!FORMATO_CORREO.test(correo)) errores.identificador = 'El correo no tiene un formato válido.'
  if (!contrasena) errores.contrasena = 'Ingresa tu contraseña.'
  return errores
}

export function validarRegistro({ nombre, matricula, correo, contrasena, confirmacion, aceptaPolitica }, dominio = DOMINIO) {
  const errores = {}
  const correoLimpio = correo.trim().toLowerCase()
  if (nombre.trim().length < 3) errores.nombre = 'Ingresa tu nombre completo.'
  if (!/^[A-Za-z0-9]{4,20}$/.test(matricula.trim())) errores.matricula = 'La matrícula solo lleva letras y números.'
  if (!FORMATO_CORREO.test(correoLimpio)) errores.correo = 'El correo no tiene un formato válido.'
  else if (dominio && !correoLimpio.endsWith('@' + dominio)) errores.correo = `Usa tu correo institucional (@${dominio}).`
  if (contrasena.length < 8) errores.contrasena = 'La contraseña debe tener al menos 8 caracteres.'
  if (contrasena !== confirmacion) errores.confirmacion = 'Las contraseñas no coinciden.'
  if (!aceptaPolitica) errores.politica = 'Debes leer y firmar la política del laboratorio.'
  return errores
}

export function rutaInicio(rol) {
  return rol === ROLES.ENCARGADO ? '/encargado/solicitudes' : '/inicio'
}

// "Andrea López" → "AL"
export function iniciales(nombre = '') {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join('')
}

const MENSAJES = {
  'auth/invalid-credential': 'Matrícula, correo o contraseña incorrectos.',
  'auth/email-already-in-use': 'Ya existe una cuenta con ese correo.',
  'auth/too-many-requests': 'Demasiados intentos. Espera unos minutos.',
  'auth/network-request-failed': 'No hay conexión a internet.',
  'auth/invalid-api-key': 'Falta configurar Firebase: revisa el archivo .env.',
  'permission-denied': 'No tienes permiso para hacer esto.',
}

// Convierte un error de Firebase en un mensaje para el usuario.
export function mensajeDeError(error) {
  if (MENSAJES[error.code]) return MENSAJES[error.code]
  if (error.code) return 'Ocurrió un error. Inténtalo de nuevo.' // error de Firebase sin traducir
  return error.message // errores nuestros: new Error('texto para el usuario')
}
