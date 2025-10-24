import { Naturalezas } from '@shared/interfaces/boletas'
import { toast } from 'sonner'

/* eslint-disable @typescript-eslint/no-explicit-any */
export async function generatePDF(
  data: any,
  pdfRoute: string
): Promise<{
  success: boolean
  path: string
}> {
  return await window.api.generateDocument(data, pdfRoute)
}

export async function uploadBoleta(
  data: any,
  tipo: Naturalezas | null
): Promise<{ success: boolean; updated: boolean; message: string }> {
  if (!tipo) return { success: false, updated: false, message: 'no type' }

  try {
    console.log('data', data)
    const normalizedType = tipo.charAt(0).toUpperCase() + tipo.slice(1).toLowerCase()

    console.log('normalizedType', normalizedType)
    const result = await window.api.uploadBoleta(data, normalizedType)
    console.log('Resultado de la subida de boleta:', result)
    switch (result) {
      case 201:
        toast.success('Boleta subida correctamente')
        break
      case 409:
        toast.warning('Boleta actualizada correctamente')
        break
      default:
        toast.error('Error al subir la boleta')
    }
    return {
      success: true,
      updated: result === 409,
      message: result === 201 ? 'Boleta subida correctamente' : 'Boleta actualizada correctamente'
    }
  } catch (error: any) {
    toast.error('Error inesperado al subir la boleta')
    return {
      success: false,
      updated: false,
      message: error?.message || 'Error desconocido'
    }
  }
}
