import { ipcMain } from 'electron'
import { scanBoletas } from '../playwright/fetch-boletas'
import { getToken } from '../services/auth'

export function registerBoletaHandlers() {
  ipcMain.handle('uploadBoleta', async (_, { data, tipo }) => {
    const token = await getToken()
    if (!token) throw new Error('No hay token de autenticación')

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

    const res = await fetch(`https://scrapper-back-two.vercel.app/api/boletas/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(boleta)
    })

    return res.status
  })

  ipcMain.handle('boletas:get-to-upload', async (_, id: number) => {
    if (typeof id !== 'number' || isNaN(id)) {
      throw new Error('La matrícula debe ser un número válido')
    }

    console.log('ID recibido:', id)

    const { profesionales, terceros, profDir, terDir } = await scanBoletas()

    const token = await getToken()
    if (!token) throw new Error('No hay token de autenticación')
    const res = await fetch('https://scrapper-back-two.vercel.app/api/boletas/filtrar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        boletasTerceros: terceros,
        boletasProfesionales: profesionales,
        id: id
      })
    })

    console.log('Respuesta del servidor:', res.status, res.statusText)

    if (!res.ok) {
      throw new Error('Error al obtener las boletas desde el servidor')
    }

    const data = await res.json()
    console.log('Datos obtenidos:', data)

    return {
      profesionales: data.boletasProfesionales,
      terceros: data.boletasTerceros,
      profDir,
      terDir
    }
  })
}
