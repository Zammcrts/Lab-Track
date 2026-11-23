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

// Catálogo de ejemplo para probar la app.
const EJEMPLO = [
  ['MC-012', 'Arduino UNO R3', 'Microcontroladores', 10, 7, 'Estante A1'],
  ['MC-020', 'ESP32 DevKit V1', 'Microcontroladores', 6, 7, 'Estante A1'],
  ['CI-004', 'Raspberry Pi 4 · 4 GB', 'Cómputo IA', 4, 14, 'Gabinete B1'],
  ['CI-001', 'NVIDIA Jetson Nano', 'Cómputo IA', 2, 14, 'Gabinete B1'],
  ['SE-031', 'Sensor ultrasónico HC-SR04', 'Sensores', 18, 7, 'Cajón C3'],
  ['SE-044', 'Sensor MPU-6050', 'Sensores', 9, 7, 'Cajón C3'],
  ['RB-018', 'Servomotor MG996R', 'Robótica', 12, 7, 'Estante D1'],
  ['HE-003', 'Multímetro digital', 'Herramientas', 4, 3, 'Mostrador A'],
]

export async function cargarCatalogoEjemplo() {
  for (const [codigo, nombre, categoria, total, maxDias, ubicacion] of EJEMPLO) {
    await agregarMaterial({ codigo, nombre, categoria, total, maxDias, ubicacion })
  }
}
