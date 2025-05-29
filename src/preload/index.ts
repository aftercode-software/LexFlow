/* eslint-disable @typescript-eslint/no-explicit-any */
import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'
import { EnrichedBoleta } from '../main/interface/boletas'

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
  generateDocument: async (data, originalPdfPath) => {
    return await ipcRenderer.invoke('generateDocument', { data, originalPdfPath })
  },
  getRecaudadores: async () => {
    const response = await ipcRenderer.invoke('getRecaudadores')
    return response
  },
  uploadBoleta: async (data, tipo) => {
    const response = await ipcRenderer.invoke('uploadBoleta', { data, tipo })
    return response
  },
  iniciarCargaJudicial: (boletas: EnrichedBoleta[],montoThreshold:number,modoInhibicion:string) => {
    ipcRenderer.invoke('carga:judicial', boletas, montoThreshold, modoInhibicion)
  },
  iniciarLoginManual: () => ipcRenderer.invoke('precarga:login'),
  getBoletasToUpload: async (matricula: number) => {
    const devolucionIPC = await ipcRenderer.invoke('boletas:get-to-upload', matricula)
    return devolucionIPC
  },
  openPdf: (path: string) => ipcRenderer.invoke('open-pdf', path)
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
