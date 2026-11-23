// Colección "prestamos".
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'
import { ESTADOS, fechaRenovada } from '../logic/prestamos'

function convertir(snap) {
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// Préstamos de un estudiante.
export function escucharPrestamosDe(uid, alCambiar) {
  const consulta = query(collection(db, 'prestamos'), where('estudianteId', '==', uid))
  return onSnapshot(consulta, (snap) => alCambiar(convertir(snap)))
}

// Todos los préstamos (solo el encargado puede leerlos).
export function escucharTodosLosPrestamos(alCambiar) {
  return onSnapshot(collection(db, 'prestamos'), (snap) => alCambiar(convertir(snap)))
}

// El estudiante envía su bolsita como solicitud (estado pendiente).
export async function solicitarPrestamo(uid, solicitud) {
  await addDoc(collection(db, 'prestamos'), { ...solicitud, fechaSolicitud: serverTimestamp() })
  await updateDoc(doc(db, 'usuarios', uid), { bolsita: [], bolsitaDesde: null })
}

export function renovarPrestamo(prestamo) {
  return updateDoc(doc(db, 'prestamos', prestamo.id), { fechaLimite: fechaRenovada(prestamo), renovado: true })
}

// ---- Encargado ----

// Aprobar: se verifica que haya piezas y el préstamo queda reservado.
export async function aprobarPrestamo(prestamo, materiales) {
  for (const item of prestamo.items) {
    const material = materiales.find((m) => m.id === item.materialId)
    if (!material || material.disponibles < item.cantidad) {
      throw new Error(`No hay piezas suficientes de ${item.nombre}.`)
    }
  }
  return updateDoc(doc(db, 'prestamos', prestamo.id), { estado: ESTADOS.RESERVADO })
}

export function rechazarPrestamo(prestamo) {
  return updateDoc(doc(db, 'prestamos', prestamo.id), { estado: ESTADOS.RECHAZADO })
}

// Registrar la entrega: descuenta las piezas del inventario.
// Se usa una transacción para que dos entregas al mismo tiempo no dejen el inventario en negativo:
// si no hay piezas suficientes, se cancela todo y nada cambia.
export function registrarEntrega(prestamo) {
  return runTransaction(db, async (transaccion) => {
    const materiales = []
    for (const item of prestamo.items) {
      const ref = doc(db, 'materiales', item.materialId)
      const material = (await transaccion.get(ref)).data()
      if (material.disponibles < item.cantidad) {
        throw new Error(`No se puede entregar: hay ${material.disponibles} de ${item.nombre} y se piden ${item.cantidad}.`)
      }
      materiales.push({ ref, disponibles: material.disponibles - item.cantidad })
    }
    for (const m of materiales) transaccion.update(m.ref, { disponibles: m.disponibles })
    transaccion.update(doc(db, 'prestamos', prestamo.id), {
      estado: ESTADOS.ENTREGADO,
      fechaInicio: serverTimestamp(),
    })
  })
}

// Registrar la devolución: lo que regresa en buen estado vuelve a estar disponible
// y lo dañado pasa a reparación (RF-17).
// danados = lista de materialId que regresaron dañados
export function registrarDevolucion(prestamo, danados, observaciones) {
  return runTransaction(db, async (transaccion) => {
    const lecturas = []
    for (const item of prestamo.items) {
      const ref = doc(db, 'materiales', item.materialId)
      lecturas.push({ item, ref, material: (await transaccion.get(ref)).data() })
    }
    for (const { item, ref, material } of lecturas) {
      if (danados.includes(item.materialId)) {
        transaccion.update(ref, { enReparacion: material.enReparacion + item.cantidad })
      } else {
        transaccion.update(ref, { disponibles: material.disponibles + item.cantidad })
      }
    }
    transaccion.update(doc(db, 'prestamos', prestamo.id), {
      estado: ESTADOS.DEVUELTO,
      fechaDevolucion: serverTimestamp(),
      items: prestamo.items.map((item) => ({
        ...item,
        estadoDevolucion: danados.includes(item.materialId) ? 'dañado' : 'bueno',
      })),
      observaciones,
    })
  })
}
