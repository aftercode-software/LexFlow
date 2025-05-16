import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, ipcMain, safeStorage, shell } from 'electron'
import path, { join } from 'path'
import icon from '../../resources/icon.png?asset'
import { extractDataFromPdf } from './services/pdf/process-pdf'
import { PDFType } from './types'
import fs from 'fs/promises'

import fetch from 'node-fetch'
import { compileDocument, convertDocxToPdf } from './docx/util'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  ipcMain.handle('pdf:extract-data', async (_, arrayBuffer: ArrayBuffer, pdfType: PDFType) =>
    extractDataFromPdf(arrayBuffer, pdfType)
  )

  const tokenFile = path.join(app.getPath('userData'), 'token.enc')

  ipcMain.handle('login', async (_, username: string, password: string) => {
    console.log('Login:', username, password)
    const resp = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    const text = await resp.text()
    if (!resp.ok) throw new Error(text)

    // extraigo el token
    const { access_token } = JSON.parse(text)

    // cifro y guardo
    if (safeStorage.isEncryptionAvailable()) {
      const encrypted = safeStorage.encryptString(access_token)
      await fs.writeFile(tokenFile, encrypted)
    } else {
      await fs.writeFile(tokenFile, access_token, 'utf8')
    }

    return { success: true }
  })

  // 2️⃣ Leer token ya descifrado
  ipcMain.handle('getToken', async () => {
    try {
      const data = await fs.readFile(tokenFile)
      return safeStorage.isEncryptionAvailable()
        ? safeStorage.decryptString(data)
        : data.toString('utf8')
    } catch {
      return null
    }
  })

  // 3️⃣ Logout: borro token
  ipcMain.handle('logout', async () => {
    await fs.unlink(tokenFile).catch(() => {})
  })

  // 4️⃣ Submit de forms-pdf: leo el token y hago fetch con Authorization
  // ipcMain.handle('submit-boletas', async (_e, payload: any) => {
  //   const token = await fs
  //     .readFile(tokenFile)
  //     .then((buf) =>
  //       safeStorage.isEncryptionAvailable() ? safeStorage.decryptString(buf) : buf.toString('utf8')
  //     )
  //     .catch(() => null)

  //   if (!token) throw new Error('No hay sesión activa')

  //   const resp = await fetch('https://tuservidor.local/api/boletas', {
  //     method: 'POST',
  //     headers: {
  //       'Content-Type': 'application/json',
  //       Authorization: `Bearer ${token}`
  //     },
  //     body: JSON.stringify(payload)
  //   })

  //   const data = await resp.text()
  //   if (!resp.ok) throw new Error(data)
  //   return JSON.parse(data)
  // })

  ipcMain.handle('searchDemandado', async (_event, dni: string) => {
    const token: string | null = await fs
      .readFile(tokenFile)
      .then((data) =>
        safeStorage.isEncryptionAvailable()
          ? safeStorage.decryptString(data)
          : data.toString('utf8')
      )
      .catch(() => null)
    if (!token) throw new Error('No hay token de autenticación')

    const res = await fetch(`http://localhost:3000/api/demandados/${dni}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Error ${res.status}: ${text}`)
    }

    console.log('Respuesta de la API:', res)

    return res.json()
  })

  ipcMain.handle('generateDocument', async (_, data: any) => {
    console.log('Compiling document with aaadata:', data)
    const buffer = await compileDocument()
    const docxPath = path.join(app.getPath('temp'), 'document.docx')
    await fs.writeFile(docxPath, buffer)

    console.log('Document compiled and saved to:', docxPath)
    await convertDocxToPdf(docxPath)

    return { success: true }
  })
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
