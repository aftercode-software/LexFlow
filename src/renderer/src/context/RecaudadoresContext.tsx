import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { RecaudadorEntity } from '@shared/interfaces/recaudador'

interface RecaudadoresContextType {
  recaudadores: RecaudadorEntity[] | null
  recaudadorPorMatricula: (id: number) => RecaudadorEntity | null
  recargando: boolean
}

const RecaudadoresContext = createContext<RecaudadoresContextType | undefined>(undefined)

export function RecaudadoresProvider({ children }: { children: ReactNode }) {
  const [recaudadores, setRecaudadores] = useState<RecaudadorEntity[] | null>(null)
  const [recargando, setRecargando] = useState(true)

  useEffect(() => {
    const fetchRecaudadores = async () => {
      try {
        setRecargando(true)
        const lista = await window.api.getRecaudadores()
        setRecaudadores(lista)
      } catch (error) {
        console.error('Error al obtener recaudadores:', error)
        setRecaudadores([])
      } finally {
        setRecargando(false)
      }
    }
    fetchRecaudadores()
  }, [])

  const recaudadorPorMatricula = (id: number): RecaudadorEntity | null => {
    if (!recaudadores) return null
    return recaudadores.find((r) => Number(r.matricula) === Number(id)) ?? null
  }

  return (
    <RecaudadoresContext.Provider value={{ recaudadores, recaudadorPorMatricula, recargando }}>
      {children}
    </RecaudadoresContext.Provider>
  )
}

export function useRecaudadores() {
  const context = useContext(RecaudadoresContext)
  if (!context) {
    throw new Error('useRecaudadores debe usarse dentro de un <RecaudadoresProvider>')
  }
  return context
}
