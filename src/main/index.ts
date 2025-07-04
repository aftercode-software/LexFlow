import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { app, BrowserWindow, shell } from 'electron'
import path, { join } from 'path'
import icon from '../../resources/icon.png?asset'
import { registerAuthHandlers } from './routes/auth'
import { registerPdfHandlers } from './routes/pdf'
import { registerBoletaHandlers } from './routes/boletas'
import { registerPoderJudicialHandlers } from './routes/poderJudicial'
import { registerDemandadoHandlers } from './routes/demandados'
import { registerRecaudadorHandlers } from './routes/recaudadores'
import { registerCedulaHandlers } from './routes/cedulas'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1600,
    height: 900,
    show: false,
    title: 'LexFlow',
    titleBarOverlay: {
      color: '#ffffff', // fondo de la barra
      symbolColor: '#000000', // color de los botones
      height: 30 // opcional, para ajustar la altura
    },
    icon: path.join(__dirname, '../../resources/icon.png'),
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

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.electron')
  
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerAuthHandlers()
  registerPdfHandlers()
  registerBoletaHandlers()
  registerPoderJudicialHandlers()
  registerDemandadoHandlers()
  registerRecaudadorHandlers()
  registerCedulaHandlers()

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
