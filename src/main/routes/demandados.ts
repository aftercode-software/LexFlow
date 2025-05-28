import { ipcMain } from 'electron'
import fetch from 'node-fetch'
import { getToken } from '../services/auth'

export function registerDemandadoHandlers() {
  ipcMain.handle('searchDemandado', async (_, dni: string) => {
    const token = await getToken()

    if (!token) throw new Error('No hay token de autenticación')

    const res = await fetch(`https://scrapper-back-two.vercel.app/api/demandados/${dni}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Error ${res.status}: ${text}`)
    }

    return res.json()
  })
}
