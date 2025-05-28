import { ipcMain } from 'electron'
import { getToken } from '../services/auth'
import { RecaudadorEntity } from '../../shared/interfaces/recaudador'

export function registerRecaudadorHandlers() {
  ipcMain.handle('recaudadores:get', async () => {
    const token = await getToken()
    const res = await fetch('https://scrapper-back-two.vercel.app/api/recaudadores', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error(await res.text())
    return res.json()
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
