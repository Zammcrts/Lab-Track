// Colección "materiales" (inventario).
import { collection, doc, increment, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

export function escucharMateriales(alCambiar) {
  return onSnapshot(collection(db, 'materiales'), (snap) => {
    alCambiar(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
  })
}

// Alta de material (RF-14). El código de inventario se usa como id del documento.
export function agregarMaterial({ codigo, nombre, categoria, total, maxDias, ubicacion }) {
  return setDoc(doc(db, 'materiales', codigo), {
    codigo,
    nombre,
    categoria,
    total,
    disponibles: total,
    enReparacion: 0,
    maxDias,
    ubicacion,
    activo: true,
  })
}

// Baja o reactivación (RF-15). No se borra para conservar el historial.
export function cambiarActivo(id, activo) {
  return updateDoc(doc(db, 'materiales', id), { activo })
}

// Una pieza reparada vuelve a estar disponible.
export function marcarReparada(id) {
  return updateDoc(doc(db, 'materiales', id), { enReparacion: increment(-1), disponibles: increment(1) })
}

// Catálogo inicial del laboratorio: [código, nombre, categoría, piezas, máx. días, ubicación]
export const CATALOGO_LAB = [
  // Microcontroladores
  ['MC-001', 'Arduino UNO R3', 'Microcontroladores', 12, 7, 'Estante A1'],
  ['MC-002', 'Arduino Mega 2560', 'Microcontroladores', 5, 7, 'Estante A1'],
  ['MC-003', 'Arduino Nano', 'Microcontroladores', 10, 7, 'Estante A2'],
  // Raspberry Pi
  ['RP-001', 'Raspberry Pi 4 · 4 GB', 'Raspberry Pi', 4, 14, 'Gabinete B1'],
  ['RP-002', 'Raspberry Pi 3 B+', 'Raspberry Pi', 4, 14, 'Gabinete B1'],
  ['RP-003', 'Raspberry Pi Pico', 'Raspberry Pi', 8, 7, 'Gabinete B2'],
  // Componentes
  ['CP-001', 'Protoboard 830 puntos', 'Componentes', 20, 7, 'Cajón C1'],
  ['CP-002', 'Protoboard 400 puntos', 'Componentes', 15, 7, 'Cajón C1'],
  ['CP-003', 'Compuerta AND 74LS08', 'Componentes', 30, 7, 'Cajón C2'],
  ['CP-004', 'Compuerta OR 74LS32', 'Componentes', 30, 7, 'Cajón C2'],
  ['CP-005', 'Compuerta NOT 74LS04', 'Componentes', 30, 7, 'Cajón C2'],
  ['CP-006', 'Compuerta NAND 74LS00', 'Componentes', 30, 7, 'Cajón C2'],
  ['CP-007', 'Compuerta XOR 74LS86', 'Componentes', 20, 7, 'Cajón C2'],
  // Herramientas
  ['HE-001', 'Pinzas de punta', 'Herramientas', 8, 3, 'Mostrador A'],
  ['HE-002', 'Pinzas de corte', 'Herramientas', 8, 3, 'Mostrador A'],
  ['HE-003', 'Pinzas pelacables', 'Herramientas', 6, 3, 'Mostrador A'],
  ['HE-004', 'Vernier digital', 'Herramientas', 5, 3, 'Mostrador A'],
  ['HE-005', 'Multímetro digital', 'Herramientas', 6, 3, 'Mostrador A'],
  ['HE-006', 'Cautín 40 W', 'Herramientas', 4, 3, 'Mostrador A'],
  // Cables y memorias
  ['CM-001', 'Cable HDMI 1.5 m', 'Cables y memorias', 10, 7, 'Cajón D1'],
  ['CM-002', 'Cable micro HDMI a HDMI', 'Cables y memorias', 6, 7, 'Cajón D1'],
  ['CM-003', 'Memoria microSD 32 GB', 'Cables y memorias', 10, 14, 'Gabinete B2'],
  ['CM-004', 'Memoria microSD 64 GB', 'Cables y memorias', 6, 14, 'Gabinete B2'],
]

// Materiales del catálogo inicial que todavía no están en el inventario.
export function faltantesDelCatalogo(materiales) {
  return CATALOGO_LAB.filter(([codigo]) => !materiales.some((m) => m.id === codigo))
}

// Agrega solo lo que falta, para no reiniciar las piezas de lo que ya existe.
export async function cargarCatalogo(materiales) {
  for (const [codigo, nombre, categoria, total, maxDias, ubicacion] of faltantesDelCatalogo(materiales)) {
    await agregarMaterial({ codigo, nombre, categoria, total, maxDias, ubicacion })
  }
}
