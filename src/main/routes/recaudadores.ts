/* eslint-disable @typescript-eslint/no-explicit-any */
import { ipcMain } from 'electron'
import { getToken } from '../services/auth'
import { RecaudadorEntity } from '../../shared/interfaces/recaudador'

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
      const token = await getToken()
      const res = await fetch('https://scrapper-back-two.vercel.app/api/recaudadores', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (!res.ok) {
        const text = await res.text()
        throw new Error(text)
      }

      const data: RecaudadorEntity[] = await res.json()

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
    const token = await getToken()
    const res = await fetch('https://scrapper-back-two.vercel.app/api/recaudadores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  })

  ipcMain.handle('recaudadores:update', async (_evt, id: number, body: RecaudadorEntity) => {
    const token = await getToken()
    const res = await fetch(`https://scrapper-back-two.vercel.app/api/recaudadores/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
  })

  ipcMain.handle('recaudadores:delete', async (_evt, id: number) => {
    const token = await getToken()
    const res = await fetch(`https://scrapper-back-two.vercel.app/api/recaudadores/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error(await res.text())
    return { success: true }
  })
}
