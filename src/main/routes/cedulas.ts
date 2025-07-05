import { ipcMain } from 'electron'
import { scanCedulas, fetchCedulasFromServer } from '../playwright/fetch-cedulas'
import { mapCedulasContribuidas } from '../../shared/interfaces/cedulas'
import { getToken } from '../services/auth'


export function registerCedulaHandlers() {
  ipcMain.handle('cedulas:get-filtradas', async () => {
    try {
      const token = await getToken()
      if (!token) throw new Error('No hay token de autenticación')

      const { cuijsPrimero, cuijsSegundo, cuijsTercero } = await scanCedulas()
     
      const [resPrimero, resSegundo, resTercero] = await Promise.all([
        fetchCedulasFromServer(cuijsPrimero, token),
        fetchCedulasFromServer(cuijsSegundo, token),
        fetchCedulasFromServer(cuijsTercero, token)
      ])

      const todas: any[] = [
        ...mapCedulasContribuidas(resPrimero, 'Primero'),
        ...mapCedulasContribuidas(resSegundo, 'Segundo'),
        ...mapCedulasContribuidas(resTercero, 'Tercero')
      ]
      console.log('✅ Retornando cédulas al renderer:')
    console.table(todas.map((c) => ({
      cuij: c.cuij,
      estado: c.estado,
      tribunal: c.tipoTribunal,
      tipo: c.tipoEscrito
    })))
      return todas
    } catch (err) {
      console.error('❌ Error al traer cédulas filtradas:', err)
      return []
    }
  })
}
