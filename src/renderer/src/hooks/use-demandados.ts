import { useState, useEffect, useMemo } from 'react'

import type {
  CreateDemandadoDto,
  UpdateDemandadoDto
} from '../components/demandados/demandado-form'
import { DemandadoEntity } from '@shared/interfaces/demandado'

export interface FilterParams {
  search?: string
  tipoDocumento?: string
  tipo?: string
}

export function useDemandados() {
  const [allDemandados, setAllDemandados] = useState<DemandadoEntity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterParams>({})

  const loadAllDemandados = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await window.api.getDemandados()
      setAllDemandados(data)
    } catch (err) {
      setError('Error loading demandados')
      console.error('Error loading demandados:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredDemandados = useMemo(() => {
    let result = [...allDemandados]

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      result = result.filter(
        (d) =>
          d.apellidoYNombre.toLowerCase().includes(searchLower) ||
          d.numeroDocumento.includes(filters.search!)
      )
    }

    if (filters.tipoDocumento && filters.tipoDocumento !== 'all') {
      result = result.filter((d) => d.tipoDocumento === filters.tipoDocumento)
    }

    if (filters.tipo && filters.tipo !== 'all') {
      result = result.filter((d) => d.tipo === filters.tipo)
    }

    return result
  }, [allDemandados, filters])

  const updateFilters = (newFilters: FilterParams) => {
    setFilters((prev) => ({ ...prev, ...newFilters }))
  }

  const createDemandado = async (data: CreateDemandadoDto) => {
    try {
      setError(null)
      const newDemandado = await window.api.createDemandado(data)
      setAllDemandados((prev) => [...prev, newDemandado])
      return newDemandado
    } catch (err) {
      setError('Error creating demandado')
      console.error('Error creating demandado:', err)
      throw err
    }
  }

  const updateDemandado = async (id: number, data: UpdateDemandadoDto) => {
    try {
      setError(null)
      const updatedDemandado = await window.api.updateDemandado(id, data)
      setAllDemandados((prev) => prev.map((d) => (d.id === id ? updatedDemandado : d)))
      return updatedDemandado
    } catch (err) {
      setError('Error updating demandado')
      console.error('Error updating demandado:', err)
      throw err
    }
  }

  const deleteDemandado = async (id: number) => {
    try {
      setError(null)
      await window.api.deleteDemandado(id)
      setAllDemandados((prev) => prev.filter((d) => d.id !== id))
    } catch (err) {
      setError('Error deleting demandado')
      console.error('Error deleting demandado:', err)
      throw err
    }
  }

  useEffect(() => {
    loadAllDemandados()
  }, [])

  return {
    allDemandados,
    filteredDemandados,
    isLoading,
    error,
    filters,
    updateFilters,
    createDemandado,
    updateDemandado,
    deleteDemandado
  }
}
