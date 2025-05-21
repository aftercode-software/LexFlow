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
  iniciarPrecarga: () => Promise<void>
  iniciarLoginManual: () => Promise<UserData>
  getBoletasToUpload: (matricula: number) => Promise<any>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
