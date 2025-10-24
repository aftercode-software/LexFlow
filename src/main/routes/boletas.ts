import { ipcMain } from 'electron'
import { FormularioCSM } from '../../shared/interfaces/form'
import { backend } from '../utils/backend-fetch'
import { getBoletas } from '../utils/getBoletas'

export function registerBoletaHandlers() {
  ipcMain.handle('uploadBoleta', async (_, { data, tipo }) => {
    const boleta = {
      recaudadorId: data.recaudador.idNombre,
      boleta: data.boleta,
      fechaEmision: data.fechaEmision,
      secuencia: data.secuencia,
      tipo,
      bruto: data.bruto,
      valorEnLetras: data.valorEnLetras,
      objeto: data.objeto,
      demandado: data.demandado,
      estado: data.estado
    }

    const res = await backend.post('/boletas/create', boleta)

    return res.status
  })

  ipcMain.handle('boletas:get-to-upload', async (_, id: number) => {
    const { todas, multas, multasDir, otrosDir } = await getBoletas()

    console.log(todas, multas)
    const res = await backend.post('/boletas/filtrar', {
      boletasTodas: todas,
      boletasMultas: multas,
      id
    })

    if (!res.ok) {
      throw new Error('Error al obtener las boletas desde el servidor')
    }

    console.log('res.data', res.data)
    return {
      boletasTodas: res.data.boletasTodas,
      boletasMultas: res.data.boletasMultas,
      multasDir,
      otrosDir
    }
  })

  ipcMain.handle('uploadCSM', async (_, csm: FormularioCSM) => {
    const res = await backend.post('/boletas/csm', csm)
    return res
  })
}
