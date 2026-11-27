export const CATEGORIAS = ['Microcontroladores', 'Raspberry Pi', 'Componentes', 'Herramientas', 'Cables y memorias']

// Quita acentos y mayúsculas para comparar ("Ultrasónico" = "ultrasonico").
export function sinAcentos(texto = '') {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export function filtrarMateriales(materiales, texto, categoria) {
  const busqueda = sinAcentos(texto.trim())
  return materiales.filter((m) => {
    if (m.activo === false) return false
    if (categoria !== 'Todos' && m.categoria !== categoria) return false
    return sinAcentos(m.nombre).includes(busqueda) || sinAcentos(m.codigo).includes(busqueda)
  })
}

// Primero lo que tiene más piezas; lo agotado al final.
export function ordenarPorDisponibilidad(materiales) {
  return [...materiales].sort((a, b) => b.disponibles - a.disponibles)
}

// Texto y color que se muestra en cada tarjeta.
export function disponibilidad(material) {
  if (material.disponibles === 0) return { texto: 'Agotado', color: 'gris' }
  if (material.disponibles <= 2) return { texto: `Quedan ${material.disponibles}`, color: 'ambar' }
  return { texto: `${material.disponibles} disponibles`, color: 'verde' }
}
