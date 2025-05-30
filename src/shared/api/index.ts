import { EnrichedBoleta } from '../../main/interface/boletas'

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Api {
  login: (username: string, password: string) => Promise<any>
  getToken: () => Promise<string | null>
  logout: () => Promise<any>

  extractDataFromPdf: (arrayBuffer: ArrayBuffer, pdfType: 'profesional' | 'tercero') => Promise<any>
  searchDemandado: (nro: string) => Promise<any>

  generateDocument: (
    data: any,
    originalPdfPath: string
  ) => Promise<{ success: boolean; path: string }>

  getRecaudadores: () => Promise<any>
  createRecaudador: (body: any) => Promise<any>
  updateRecaudador: (id: number, body: any) => Promise<any>
  deleteRecaudador: (id: number) => Promise<{ success: boolean }>

  uploadBoleta: (data: any, tipo: string) => Promise<any>
  iniciarCargaJudicial: (
    boletas: EnrichedBoleta[],
    montoThreshold: number,
    modoInhibicion: string
  ) => Promise<void>
  iniciarLoginManual: () => Promise<any>
  getBoletasToUpload: (matricula: number) => Promise<any>
  openPdf: (path: string) => Promise<void>
}
