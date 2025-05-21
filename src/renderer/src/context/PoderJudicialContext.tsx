import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type UserData = {
  recaudador: string
  matricula: string
  telefonoFijo: string
  telefonoMovil: string
  organismo: string
  descripcion: string
  correo: string
  fechaReporte: string
} | null

interface PoderJudicialContextType {
  userData: UserData
  isAuthenticated: boolean
  login: (data: UserData) => void
  logout: () => void
}

const PoderJudicialContext = createContext<PoderJudicialContextType | undefined>(undefined)

export function PoderJudicialProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const login = (data: UserData) => {
    setUserData(data)
    console.log('Usuario autenticado:', data)
    setIsAuthenticated(true)
    console.log('Estado de autenticación:', isAuthenticated)
    console.log('Datos de usuario:', userData)
  }

  useEffect(() => {
    console.log('🔄 Estado auth actualizado:', { isAuthenticated, userData })
  }, [isAuthenticated, userData])

  const logout = () => {
    setUserData(null)
    setIsAuthenticated(false)
  }

  return (
    <PoderJudicialContext.Provider value={{ userData, isAuthenticated, login, logout }}>
      {children}
    </PoderJudicialContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(PoderJudicialContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
