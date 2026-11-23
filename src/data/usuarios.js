// Colección "usuarios": perfil, bolsita y avisos de cada persona.
import { arrayRemove, arrayUnion, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

export function crearPerfil(uid, { nombre, matricula, correo }) {
  return setDoc(doc(db, 'usuarios', uid), {
    nombre,
    matricula,
    correo,
    rol: 'estudiante', // el rol de encargado solo se cambia desde la consola de Firebase
    carrera: '',
    semestre: '',
    telefono: '',
    notificaciones: { vencimiento: true, recoleccion: true },
    bolsita: [], // [{ materialId, cantidad }]
    bolsitaDesde: null, // cuándo se agregó el primer artículo
    avisos: [], // materiales agotados de los que quiere aviso
  })
}

// Escucha el perfil en tiempo real.
export function escucharPerfil(uid, alCambiar) {
  return onSnapshot(doc(db, 'usuarios', uid), (snap) => {
    alCambiar(snap.exists() ? { id: snap.id, ...snap.data() } : null)
  })
}

export function actualizarPerfil(uid, datos) {
  return updateDoc(doc(db, 'usuarios', uid), datos)
}

// ---- Bolsita ----

export function guardarBolsita(uid, bolsita, bolsitaDesde) {
  return updateDoc(doc(db, 'usuarios', uid), { bolsita, bolsitaDesde })
}

export function vaciarBolsita(uid) {
  return updateDoc(doc(db, 'usuarios', uid), { bolsita: [], bolsitaDesde: null })
}

// ---- Avisos ("Avisarme" cuando un material agotado vuelva a estar disponible) ----

export function activarAviso(uid, materialId) {
  return updateDoc(doc(db, 'usuarios', uid), { avisos: arrayUnion(materialId) })
}

export function quitarAviso(uid, materialId) {
  return updateDoc(doc(db, 'usuarios', uid), { avisos: arrayRemove(materialId) })
}
