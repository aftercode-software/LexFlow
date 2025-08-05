import { FormularioCSM } from '@shared/interfaces/form'
import { toast } from 'sonner'

export async function uploadBoletaCSM(
  csm: FormularioCSM,
  pdfRoute: string,
  tribunal: string
): Promise<{ success: boolean; updated: boolean }> {
  const res = await window.api.uploadCSM(csm)
  const status = typeof res.status === 'function' ? res.status() : res.status

  switch (status) {
    case 201: {
      try {
        const result = await window.api.saveCSMPDF(pdfRoute, csm.cuij, tribunal)
        if (result.success) {
          toast.success('Cédula subida y PDF guardado correctamente')
        } else {
          toast.success('Cédula subida correctamente')
          toast.warning('Error al guardar el PDF localmente')
        }
      } catch (error) {
        toast.success('Cédula subida correctamente')
        toast.warning('Error al guardar el PDF localmente')
      }
      return { success: true, updated: false }
    }
    case 200: {
      toast.info('Cédula actualizada correctamente')
      return { success: true, updated: true }
    }
    case 404: {
      toast.error('No se encontró la boleta por número de juicio')
      return {
        success: false,
        updated: false
      }
    }
    case 500: {
      toast.error('Error al subir la CSM al servidor')
      return { success: false, updated: false }
    }
    default: {
      toast.error('Error desconocido')
      return { success: false, updated: false }
    }
  }
}
