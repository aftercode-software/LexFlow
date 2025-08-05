/* eslint-disable @typescript-eslint/no-explicit-any */
import { ipcMain } from 'electron'
import { RecaudadorEntity } from '../../shared/interfaces/recaudador'
import { backend } from '../utils/backend-fetch'

const cache = new Map<string, { data: any; expiresAt: number }>()

export function registerRecaudadorHandlers() {
  ipcMain.handle('recaudadores:get', async () => {
    const cacheKey = 'recaudadores:list'
    const cacheTTL = 60 * 60 * 2

    const entry = cache.get(cacheKey)
    if (entry && entry.expiresAt > Date.now()) {
      return entry.data
    }

    try {
      const res = await backend.get<RecaudadorEntity[]>('/recaudadores')
      if (!res.ok) {
        throw new Error(`Error ${res.status}: ${res.statusText}`)
      }

      const data: RecaudadorEntity[] = res.data

      cache.set(cacheKey, {
        data,
        expiresAt: Date.now() + cacheTTL * 1000
      })

      return data
    } catch (err) {
      console.error('Error en recaudadores:get:', err)
      throw err
    }
  })
  ipcMain.handle('recaudadores:create', async (_evt, body: RecaudadorEntity) => {
    const res = await backend.post<RecaudadorEntity>('/recaudadores', body)
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)
    return res.data
  })

  ipcMain.handle('recaudadores:update', async (_evt, id: number, body: RecaudadorEntity) => {
    const res = await backend.patch<RecaudadorEntity>(`/recaudadores/${id}`, body)
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)
    return res.data
  })

  ipcMain.handle('recaudadores:delete', async (_evt, id: number) => {
    const res = await backend.delete(`/recaudadores/${id}`)
    if (!res.ok) throw new Error(`Error ${res.status}: ${res.statusText}`)
    return { success: true }
  })
}
