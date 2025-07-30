import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { Api } from '../shared/api'
import { EnrichedBoleta } from '../shared/interfaces/boletas'
import { FormularioCSM } from '../shared/interfaces/form'
import { CedulaFiltrada } from '../shared/interfaces/cedulas'

declare global {
  interface Window {
    api: Api
    electron: typeof electronAPI
  }
}

const api: Api = {
  login: (username, password) => ipcRenderer.invoke('login', username, password),
  getToken: () => ipcRenderer.invoke('getToken'),
  logout: () => ipcRenderer.invoke('logout'),

  getDemandados: () => ipcRenderer.invoke('demandados:getAll'),
  searchDemandado: (nro) => ipcRenderer.invoke('demandados:get', nro),
  createDemandado: (body) => ipcRenderer.invoke('demandados:create', body),
  updateDemandado: (id, body) => ipcRenderer.invoke('demandados:update', id, body),
  deleteDemandado: (id) => ipcRenderer.invoke('demandados:delete', id),

  extractDataFromPdf: (arrayBuffer, pdfType) =>
    ipcRenderer.invoke('pdf:extract-data', arrayBuffer, pdfType),

  extractDataFromCSMPdf: (arrayBuffer) => ipcRenderer.invoke('pdf:csm:extract-data', arrayBuffer),

  generateDocument: (data, originalPdfPath) =>
    ipcRenderer.invoke('generateDocument', { data, originalPdfPath }),

  getRecaudadores: () => ipcRenderer.invoke('recaudadores:get'),
  createRecaudador: (body) => ipcRenderer.invoke('recaudadores:create', body),
  updateRecaudador: (id, body) => ipcRenderer.invoke('recaudadores:update', id, body),
  deleteRecaudador: (id) => ipcRenderer.invoke('recaudadores:delete', id),

  uploadBoleta: (data, tipo) => ipcRenderer.invoke('uploadBoleta', { data, tipo }),
  uploadCSM: (data: FormularioCSM) => ipcRenderer.invoke('uploadCSM', data),
  saveCSMPDF: (pdfPath: string, cuij: string, tribunal: string) =>
    ipcRenderer.invoke('pdf:save-csm', { pdfPath, cuij, tribunal }),

  iniciarCargaJudicial: (
    boletas: EnrichedBoleta[],
    montoThreshold: number,
    modoInhibicion: string,
    oficial2: boolean
  ) => {
    console.log('debi de anmuerasd', oficial2)
    return ipcRenderer.invoke('carga:judicial', boletas, montoThreshold, modoInhibicion, oficial2)
  },
  iniciarCargaCedulas: (
  cedulas: CedulaFiltrada[],
  tipoEscrito: 'CSM' | 'JMI',
  tribunal: 'primer' | 'segundo' | 'tercer'
) => {
  return ipcRenderer.invoke('carga:cedulas', cedulas, tipoEscrito, tribunal)
},
  getCedulasFiltradas: (matricula: number) => ipcRenderer.invoke('cedulas:get-filtradas', matricula),
  iniciarLoginManual: () => ipcRenderer.invoke('precarga:login'),
  getBoletasToUpload: (id: number) => ipcRenderer.invoke('boletas:get-to-upload', id),

  openPdf: (path) => ipcRenderer.invoke('open-pdf', path)
}

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('electron', electronAPI)
  contextBridge.exposeInMainWorld('api', api)
} else {
  window.electron = electronAPI
  window.api = api
}
