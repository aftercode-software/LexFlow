import { ipcMain } from 'electron'
import { DemandadoEntity } from '../../shared/interfaces/demandado'
import { backend } from '../utils/backend-fetch'

export function registerDemandadoHandlers() {
  ipcMain.handle('demandados:getAll', async () => {
    const res = await backend.get('/demandados')
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)
    return res.data
  })

  ipcMain.handle('demandados:get', async (_evt, documento: string) => {
    const res = await backend.get(`/demandados/${documento}`)
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)
    return res.data
  })

  ipcMain.handle('demandados:create', async (_evt, body: DemandadoEntity) => {
    const res = await backend.post('/demandados', body)
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)
    return res.data
  })

  ipcMain.handle('demandados:update', async (_evt, id: number, body: DemandadoEntity) => {
    const res = await backend.put(`/demandados/${id}`, body)
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)
    return res.data
  })

  ipcMain.handle('demandados:delete', async (_evt, id: number) => {
    const res = await backend.delete(`/demandados/${id}`)
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)
    return { success: true }
  })
}
