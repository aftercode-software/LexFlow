import { ElectronAPI } from '@electron-toolkit/preload'

interface Api {
  extractDataFromPdf: (
    arrayBuffer: ArrayBuffer,
    pdfType: 'profesional' | 'tercero'
  ) => Promise<DatosTercero | DatosProfesional>
  login: (username: string, password: string) => Promise<any>
  searchDemandado: (nro: string) => Promise<any>
  generateDocument: (data: any) => Promise<any>
  getRecaudadores: () => Promise<any>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
