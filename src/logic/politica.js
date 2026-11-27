// Política del laboratorio: se firma al registrarse escribiendo la matrícula.
import { LIMITE_PIEZAS } from './bolsita'

export const POLITICA_LAB = [
  'El préstamo es personal: recoge el material con tu credencial y no lo prestes a nadie más.',
  `Puedes tener hasta ${LIMITE_PIEZAS} piezas en préstamo al mismo tiempo.`,
  'Tu bolsita se aparta 24 horas; si no confirmas la solicitud, se libera.',
  'Devuelve el material completo, limpio y a tiempo. Puedes renovar una sola vez por 3 días.',
  'Si el material se daña o se pierde, avisa al encargado; podrías tener que reponerlo.',
  'Los retrasos frecuentes pueden suspender tu acceso a préstamos.',
]

// La firma es válida si escribe exactamente su matrícula (sin importar mayúsculas).
export function firmaValida(firma, matricula) {
  const limpia = matricula.trim().toUpperCase()
  return limpia.length > 0 && firma.trim().toUpperCase() === limpia
}
