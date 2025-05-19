import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, ipcMain, safeStorage, shell } from 'electron'
import fs from 'fs/promises'
import fsPromises from 'fs/promises'
import path, { join } from 'path'
import icon from '../../resources/icon.png?asset'
import { extractDataFromPdf } from './services/pdf/process-pdf'
import fetch from 'node-fetch'
import { generateWrittenPdf, mergePdfs } from './docx/util'
import { getRecaudadores } from './services/recaudador'
import { flujoCarga } from './playwright/procesar-boletas'
import { loginRecaudador } from './playwright/manual-login'

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
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

  ipcMain.handle(
    'pdf:extract-data',
    async (_, arrayBuffer: ArrayBuffer, pdfType: 'profesional' | 'tercero') => {
      const { data, originalPdfPath } = await extractDataFromPdf(arrayBuffer, pdfType)

      return { data, originalPdfPath }
    }
  )

  const tokenFile = path.join(app.getPath('userData'), 'token.enc')

  ipcMain.handle('login', async (_, username: string, password: string) => {
    console.log('Login:', username, password)
    const resp = await fetch('https://scrapper-back-two.vercel.app/api/auth/login', {
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

  ipcMain.handle('getRecaudadores', async () => {
    return getRecaudadores()
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

  ipcMain.handle('generateDocument', async (_, { data, originalPdfPath }) => {
    console.log('Generando documento', data)
    console.log('tipo de documento', data.tipo)
    console.log('Generando escrito para boleta', data.boleta)

    // 1) Generar PDF “escrito”
    const writtenPdfPath = await generateWrittenPdf(data)

    // 2) Merge
    const mergedBytes = await mergePdfs(originalPdfPath, writtenPdfPath)

    // 3) Guardar en C:\boletas\{boleta}.pdf
    const outputDir =
      data.tipo === 'Profesional' ? 'C:\\boletas\\profesionales' : 'C:\\boletas\\terceros'
    await fsPromises.mkdir(outputDir, { recursive: true })

    const finalPath = path.join(outputDir, `${data.boleta}.pdf`)
    await fsPromises.writeFile(finalPath, mergedBytes)

    console.log('PDF final guardado en', finalPath)
    return { success: true, path: finalPath }
  })

  ipcMain.handle('uploadBoleta', async (_, { data, tipo }) => {
    console.log('Subiendo boleta', data)
    console.log('Tipo de boleta', tipo)
    const token: string | null = await fs
      .readFile(tokenFile)
      .then((data) =>
        safeStorage.isEncryptionAvailable()
          ? safeStorage.decryptString(data)
          : data.toString('utf8')
      )
      .catch(() => null)
    if (!token) throw new Error('No hay token de autenticación')

    const boleta = {
      recaudadorId: data.recaudador.idNombre,
      fechaEmision: data.fechaEmision,
      tipo,
      boleta: data.boleta,
      bruto: data.bruto,
      valorEnLetras: data.valorEnLetras,
      expediente: data.expediente,
      demandado: data.demandado,
      estado: data.estado
    }

    const res = await fetch(`https://scrapper-back-two.vercel.app/api/boletas/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(boleta)
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Error ${res.status}: ${text}`)
    }

    return res.json()
  })

  createWindow()
  ipcMain.handle('precarga:procesar', () => flujoCarga())

  ipcMain.handle('precarga:login', () => loginRecaudador())

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
