// Hooks para leer datos de Firebase en tiempo real desde cualquier pantalla.
import { useEffect, useState } from 'react'
import { escucharMateriales } from './data/materiales'
import { escucharPrestamosDe, escucharTodosLosPrestamos } from './data/prestamos'

// Fecha y hora actual, se actualiza cada 30 segundos (para los tiempos restantes).
export function useAhora() {
  const [ahora, setAhora] = useState(() => new Date())
  useEffect(() => {
    const intervalo = setInterval(() => setAhora(new Date()), 30000)
    return () => clearInterval(intervalo)
  }, [])
  return ahora
}

export function useMateriales() {
  const [materiales, setMateriales] = useState([])
  const [cargando, setCargando] = useState(true)
  useEffect(() => {
    return escucharMateriales((lista) => {
      setMateriales(lista)
      setCargando(false)
    })
  }, [])
  return { materiales, cargando }
}

// Préstamos del estudiante con sesión iniciada.
export function useMisPrestamos(uid) {
  const [prestamos, setPrestamos] = useState([])
  useEffect(() => {
    if (!uid) return
    return escucharPrestamosDe(uid, setPrestamos)
  }, [uid])
  return prestamos
}

// Todos los préstamos (vistas del encargado).
export function useTodosLosPrestamos() {
  const [prestamos, setPrestamos] = useState([])
  useEffect(() => escucharTodosLosPrestamos(setPrestamos), [])
  return prestamos
}
