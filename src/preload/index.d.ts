import { ElectronAPI } from '@electron-toolkit/preload'

interface Api {
  extractDataFromPdf: (arrayBuffer: ArrayBuffer) => Promise<any>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: Api
  }
}
