// Acceso a Firebase Authentication.
import {
  browserLocalPersistence,
  browserSessionPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth'
import { auth } from '../firebase'

// "Recordarme": con la casilla marcada la sesión sobrevive al cerrar el navegador.
export async function iniciarSesion(correo, contrasena, recordar = true) {
  await setPersistence(auth, recordar ? browserLocalPersistence : browserSessionPersistence)
  return signInWithEmailAndPassword(auth, correo, contrasena)
}

export async function crearCuenta(correo, contrasena, nombre) {
  const credencial = await createUserWithEmailAndPassword(auth, correo, contrasena)
  await updateProfile(credencial.user, { displayName: nombre })
  return credencial.user
}

export function cerrarSesion() {
  return signOut(auth)
}

export function enviarRecuperacion(correo) {
  return sendPasswordResetEmail(auth, correo)
}

export function escucharSesion(callback) {
  return onAuthStateChanged(auth, callback)
}
