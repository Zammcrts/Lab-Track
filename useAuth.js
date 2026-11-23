import { createContext, useContext } from 'react'

export const AuthContext = createContext(null)

// Hook para leer la sesión desde cualquier componente.
export function useAuth() {
  const contexto = useContext(AuthContext)
  if (!contexto) throw new Error('useAuth debe usarse dentro de <AuthProvider>.')
  return contexto
}
