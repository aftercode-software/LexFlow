import { ipcMain, safeStorage, app } from 'electron'
import path from 'path'
import fs from 'fs/promises'
import { backend } from '../utils/backend-fetch'
import { getToken } from '../services/auth'

const tokenFile = path.join(app.getPath('userData'), 'token.enc')

export function registerAuthHandlers() {
  ipcMain.handle('login', async (_, username: string, password: string) => {
    const res = await backend.post('/auth/login', { username, password })
    if (!res.ok) throw new Error(res.statusText)

    const { access_token } = res.data

    const encrypted = safeStorage.isEncryptionAvailable()
      ? safeStorage.encryptString(access_token)
      : access_token

    await fs.writeFile(tokenFile, encrypted)
    return { success: true }
  })

  ipcMain.handle('getToken', async () => {
    return await getToken()
  })

  ipcMain.handle('logout', async () => {
    await fs.unlink(tokenFile).catch(() => {})
  })
}
