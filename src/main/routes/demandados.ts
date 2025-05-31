import { ipcMain } from 'electron'
import fetch from 'node-fetch'
import { getToken } from '../services/auth'
import { DemandadoEntity } from '../../shared/interfaces/demandado'

export function registerDemandadoHandlers() {
  ipcMain.handle('demandados:getAll', async () => {
    const token = await getToken()
    const res = await fetch('http://localhost:3000/api/demandados', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`)
    return res.json()
  })

  ipcMain.handle('demandados:get', async (_evt, documento: string) => {
    const token = await getToken()
    const res = await fetch(`http://localhost:3000/api/demandados/${documento}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`)
    return res.json()
  })

  ipcMain.handle('demandados:create', async (_evt, body: DemandadoEntity) => {
    const token = await getToken()
    const res = await fetch('http://localhost:3000/api/demandados', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    })
    if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`)
    const contentType = res.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return res.json()
    } else {
      return res.text()
    }
  })

  ipcMain.handle('demandados:update', async (_evt, id: number, body: DemandadoEntity) => {
    const token = await getToken()
    const res = await fetch(`http://localhost:3000/api/demandados/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    })
    if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`)
    const contentType = res.headers.get('content-type')
    if (contentType && contentType.includes('application/json')) {
      return res.json()
    } else {
      return res.text()
    }
  })

  ipcMain.handle('demandados:delete', async (_evt, id: number) => {
    const token = await getToken()
    const res = await fetch(`http://localhost:3000/api/demandados/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`)
    return { success: true }
  })
}
