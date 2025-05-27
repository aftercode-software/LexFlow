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
import { subirBoletas } from './playwright/procesar-boletas'
import { loginRecaudador } from './playwright/manual-login'
import { scanBoletas } from './playwright/fetch-boletas'
import { EnrichedBoleta } from './interface/boletas'

function createWindow(): void {
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

  mainWindow.webContents.openDevTools()

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

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
    const resp = await fetch('https://scrapper-back-two.vercel.app/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    const text = await resp.text()
    if (!resp.ok) throw new Error(text)

    const { access_token } = JSON.parse(text)

    if (safeStorage.isEncryptionAvailable()) {
      const encrypted = safeStorage.encryptString(access_token)
      await fs.writeFile(tokenFile, encrypted)
    } else {
      await fs.writeFile(tokenFile, access_token, 'utf8')
    }

    return { success: true }
  })

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

  ipcMain.handle('logout', async () => {
    await fs.unlink(tokenFile).catch(() => {})
  })

  ipcMain.handle('getRecaudadores', async () => {
    return getRecaudadores()
  })

  ipcMain.handle('searchDemandado', async (_, dni: string) => {
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

    const writtenPdfPath = await generateWrittenPdf(data)

    const mergedBytes = await mergePdfs(originalPdfPath, writtenPdfPath)

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

    console.log('boleta', data.boleta)
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

    return res.status
  })

  ipcMain.handle('carga:judicial', async (_, boletas: EnrichedBoleta[]) => {
    console.log('Iniciando carga judicial', boletas)
    subirBoletas(boletas)
  })

  ipcMain.handle('precarga:login', () => loginRecaudador())

  ipcMain.handle('boletas:get-to-upload', async (_, matricula: number) => {
    console.log('Buscando boletas para subir')
    console.log('Llega Matrícula:', matricula)
    if (typeof matricula !== 'number' || isNaN(matricula)) {
      throw new Error('La matrícula debe ser un número válido')
    }

    const { profesionales, terceros, profDir, terDir } = await scanBoletas()

    console.log('Profesionales:', profesionales)
    console.log('Terceros:', terceros)

    const token: string | null = await fs
      .readFile(tokenFile)
      .then((data) =>
        safeStorage.isEncryptionAvailable()
          ? safeStorage.decryptString(data)
          : data.toString('utf8')
      )
      .catch(() => null)
    if (!token) throw new Error('No hay token de autenticación')
    const res = await fetch('https://scrapper-back-two.vercel.app/api/boletas/filtrar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({
        boletasTerceros: terceros,
        boletasProfesionales: profesionales,
        matricula
      })
    })

    if (!res.ok) {
      throw new Error('Error al obtener las boletas desde el servidor')
    }

    const data = await res.json()

    console.log('Respuesta del servidor:', data)

    console.log('Boletas profesionales:', data.boletasProfesionales)
    console.log('Boletas terceros:', data.boletasTerceros)
    return {
      profesionales: data.boletasProfesionales,
      terceros: data.boletasTerceros,
      profDir,
      terDir
    }
  })

  ipcMain.handle('open-pdf', (_evt, pdfPath: string) => {
    return shell.openPath(pdfPath)
  })

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
