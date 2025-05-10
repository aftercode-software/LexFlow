import { ElectronAPI } from '@electron-toolkit/preload'

interface Api {
  extractDataFromPdf: (
    arrayBuffer: ArrayBuffer,
    pdfType: 'profesional' | 'tercero'
  ) => Promise<DatosTercero | DatosProfesional>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
