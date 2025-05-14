/* eslint-disable @typescript-eslint/no-unused-vars */
import { createContext, useState, useEffect, ReactNode, useContext } from 'react'

interface AuthContextProps {
  jwt: string | null
  login: (creds: { username: string; password: string }) => Promise<unknown>
  logout: () => void
}

const AuthContext = createContext<AuthContextProps>({
  jwt: null,
  login: async (creds) => {},
  logout: () => {}
} as {
  jwt: string | null
  login: (creds: { username: string; password: string }) => Promise<unknown>
  logout: () => void
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [jwt, setJwt] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('JWT')
    if (token) setJwt(token)
  }, [])

  const login = async (creds: { username: string; password: string }) => {
    const { token, user } = await window.api.login(creds)
    localStorage.setItem('JWT', token)
    setJwt(token)
    return user
  }

  const logout = () => {
    localStorage.removeItem('JWT')
    setJwt(null)
  }

  return <AuthContext.Provider value={{ jwt, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
