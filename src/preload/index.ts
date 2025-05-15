import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'

// Custom APIs for renderer
const api = {
  extractDataFromPdf: async (arrayBuffer: ArrayBuffer, pdfType: 'profesional' | 'tercero') => {
    const extractedData = await ipcRenderer.invoke('pdf:extract-data', arrayBuffer, pdfType)
    console.log(extractedData)
    return extractedData
  },
  login: async (user: string, password: string) => {
    const response = await ipcRenderer.invoke('login', user, password)
    return response
  },
  getToken: async () => {
    const token = await ipcRenderer.invoke('getToken')
    return token
  },
  logout: async () => {
    const response = await ipcRenderer.invoke('logout')
    return response
  },
  searchDemandado: async (nro: string) => {
    const response = await ipcRenderer.invoke('searchDemandado', nro)
    return response
  },
    iniciarPrecarga: () => ipcRenderer.invoke('precarga:procesar'),
  iniciarLoginManual: () => ipcRenderer.invoke('precarga:login')

}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
