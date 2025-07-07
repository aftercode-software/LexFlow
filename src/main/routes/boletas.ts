import { ipcMain } from 'electron'
import { FormularioCSM } from '../../shared/interfaces/form'
import { backend } from '../utils/backend-fetch'
import { getBoletas } from '../utils/getBoletas'

export function registerBoletaHandlers() {
  ipcMain.handle('uploadBoleta', async (_, { data, tipo }) => {
    const boleta = {
      recaudadorId: data.recaudador.idNombre,
      fechaEmision: data.fechaEmision,
      tipo,
      boleta: data.boleta,
      bruto: data.bruto,
      valorEnLetras: data.valorEnLetras,
      expediente: data.expediente,
      demandado: data.demandado,
      estado: data.estado
    }

    const res = await backend.post('/boletas/create', boleta)

    return res.status
  })

  ipcMain.handle('boletas:get-to-upload', async (_, id: number) => {
    const { profesionales, terceros, profDir, terDir } = await getBoletas()

    const res = await backend.post('/boletas/filtrar', {
      boletasTerceros: terceros,
      boletasProfesionales: profesionales,
      id: id
    })

    if (!res.ok) {
      throw new Error('Error al obtener las boletas desde el servidor')
    }

    return {
      profesionales: res.data.boletasProfesionales,
      terceros: res.data.boletasTerceros,
      profDir,
      terDir
    }
  })

  ipcMain.handle('uploadCSM', async (_, csm: FormularioCSM) => {
    const res = await backend.post('/boletas/csm', csm)
    return res
  })
}
