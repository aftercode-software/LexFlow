import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Api } from '../shared/api'
import { EnrichedBoleta } from '../main/interface/boletas'

const api: Api = {
  login: (username, password) => ipcRenderer.invoke('login', username, password),
  getToken: () => ipcRenderer.invoke('getToken'),
  logout: () => ipcRenderer.invoke('logout'),

  searchDemandado: (nro) => ipcRenderer.invoke('searchDemandado', nro),
  extractDataFromPdf: (arrayBuffer, pdfType) =>
    ipcRenderer.invoke('pdf:extract-data', arrayBuffer, pdfType),

  generateDocument: (data, originalPdfPath) =>
    ipcRenderer.invoke('generateDocument', { data, originalPdfPath }),

  getRecaudadores: () => ipcRenderer.invoke('recaudadores:get'),
  createRecaudador: (body) => ipcRenderer.invoke('recaudadores:create', body),
  updateRecaudador: (id, body) => ipcRenderer.invoke('recaudadores:update', id, body),
  deleteRecaudador: (id) => ipcRenderer.invoke('recaudadores:delete', id),

  uploadBoleta: (data, tipo) => ipcRenderer.invoke('uploadBoleta', { data, tipo }),

  iniciarCargaJudicial: (
    boletas: EnrichedBoleta[],
    montoThreshold: number,
    modoInhibicion: string
  ) => {
    ipcRenderer.invoke('carga:judicial', boletas, montoThreshold, modoInhibicion)
  },

  iniciarLoginManual: () => ipcRenderer.invoke('precarga:login'),
  getBoletasToUpload: (matricula: number) => ipcRenderer.invoke('boletas:get-to-upload', matricula),

  openPdf: (path) => ipcRenderer.invoke('open-pdf', path)
}

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('electron', electronAPI)
  contextBridge.exposeInMainWorld('api', api)
} else {
  window.electron = electronAPI
  window.api = api
}
