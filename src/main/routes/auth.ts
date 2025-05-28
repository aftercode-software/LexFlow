import { ipcMain, safeStorage, app } from 'electron'
import path from 'path'
import fs from 'fs/promises'
import fetch from 'node-fetch'
import { getToken } from '../services/auth'

const tokenFile = path.join(app.getPath('userData'), 'token.enc')

export function registerAuthHandlers() {
  ipcMain.handle('login', async (_, username: string, password: string) => {
    const resp = await fetch('https://scrapper-back-two.vercel.app/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    const text = await resp.text()
    if (!resp.ok) throw new Error(text)

    const { access_token } = JSON.parse(text)

    const encrypted = safeStorage.isEncryptionAvailable()
      ? safeStorage.encryptString(access_token)
      : access_token

    await fs.writeFile(tokenFile, encrypted)
    return { success: true }
  })

  ipcMain.handle('getToken', async () => {
    return getToken()
  })

  ipcMain.handle('logout', async () => {
    await fs.unlink(tokenFile).catch(() => {})
  })
}
