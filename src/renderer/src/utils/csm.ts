import { FormularioCSM } from '@shared/interfaces/form'
import { APIResponse } from 'playwright'
import { toast } from 'sonner'

export async function uploadBoletaCSM(
  csm: FormularioCSM,
  pdfRoute: string,
  tribunal: string
): Promise<APIResponse> {
  console.log('Subiendo CSM:', csm)
  const res = await window.api.uploadCSM(csm)
  console.log('Respuesta del servidor:', res)
  const status = typeof res.status === 'function' ? res.status() : res.status
  switch (status) {
    case 201:
      try {
        const result = await window.api.saveCSMPDF(pdfRoute, csm.cuij, tribunal)
        if (result.success) {
          toast.success('Cédula subida y PDF guardado correctamente')
          console.log('PDF guardado en:', result.path)
        } else {
          toast.success('Cédula subida correctamente')
          toast.warning('Error al guardar el PDF localmente')
        }
      } catch (error) {
        console.error('Error al guardar PDF:', error)
        toast.success('Cédula subida correctamente')
        toast.warning('Error al guardar el PDF localmente')
      }
      break
    case 404: {
      const data = await res.json()
      toast.error(data.message || `No se encontró boleta con numero de juicio ${csm.numeroJuicio}`)
      break
    }
    case 500:
      toast.error('Error al subir la CSM al servidor')
      throw new Error('Error al subir la CSM al servidor')
  }
  return res
}

export async function getCedulasToUpload() {
  const res = await window.api.getCedulasFiltradas()
  return res
}
