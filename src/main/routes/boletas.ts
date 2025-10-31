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
    const { todas, porTipo, dirs } = await getBoletas()

    console.log(todas)
    const res = await backend.post('/boletas/filtrar', {
      boletasAutomotores: porTipo['automotores'],
      boletasIngresosBrutos: porTipo['brutos'],
      boletasInmobiliarios: porTipo['inmobiliarios'],
      boletasMultas: porTipo['multas'],
      boletasSellos: porTipo['sellos'],
      id
    })

    if (!res.ok) {
      throw new Error('Error al obtener las boletas desde el servidor')
    }

    console.log('res.data', res.data)
    return {
      boletasAutomotores: res.data.boletasAutomotores,
      boletasIngresosBrutos: res.data.boletasIngresosBrutos,
      boletasInmobiliarios: res.data.boletasInmobiliarios,
      boletasMultas: res.data.boletasMultas,
      boletasSellos: res.data.boletasSellos,
      dirs
    }
  })

  ipcMain.handle('uploadCSM', async (_, csm: FormularioCSM) => {
    const res = await backend.post('/boletas/csm', csm)
    return res
  })
}
