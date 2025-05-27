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
  tipo: 'Tercero' | 'Profesional'
): Promise<{ success: boolean; updated: boolean; message: string }> {
  try {
    const result = await window.api.uploadBoleta(data, tipo)
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
