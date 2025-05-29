/* eslint-disable @typescript-eslint/no-explicit-any */
import { ElectronAPI } from '@electron-toolkit/preload'

interface Api {
  extractDataFromPdf: (
    arrayBuffer: ArrayBuffer,
    pdfType: 'profesional' | 'tercero'
  ) => Promise<DatosTercero | DatosProfesional>
  login: (username: string, password: string) => Promise<any>
  searchDemandado: (nro: string) => Promise<any>
  generateDocument: (
    data: any,
    originalPdfPath: string
  ) => Promise<{ success: boolean; path: string }>
  getRecaudadores: () => Promise<any>
  uploadBoleta: (data: any, tipo: string) => Promise<any>
  iniciarCargaJudicial: (boletas: EnrichedBoleta[],montoThreshold: number,modoInhibicion:string) => Promise<void>
  iniciarLoginManual: () => Promise<UserData>
  getBoletasToUpload: (matricula: number) => Promise<any>
  openPdf: (path: string) => Promise<void>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
