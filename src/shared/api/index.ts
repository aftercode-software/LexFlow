import { APIResponse } from 'playwright'
import { EnrichedBoleta } from '../interfaces/boletas'
import { CedulaFiltrada } from '../interfaces/cedulas'
import { FormularioCSM } from '../interfaces/form'
import { RecaudadorEntity } from '../interfaces/recaudador'

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface Api {
  login: (username: string, password: string) => Promise<any>
  getToken: () => Promise<string | null>
  logout: () => Promise<any>

  extractDataFromPdf: (arrayBuffer: ArrayBuffer, pdfType: 'profesional' | 'tercero') => Promise<any>
  extractDataFromCSMPdf: (arrayBuffer: ArrayBuffer) => Promise<any>

  getDemandados(): Promise<any>
  searchDemandado(nro: string): Promise<any>
  createDemandado(body: any): Promise<any>
  updateDemandado(id: number, body: any): Promise<any>
  deleteDemandado(id: number): Promise<{ success: boolean }>

  generateDocument: (
    data: any,
    originalPdfPath: string
  ) => Promise<{ success: boolean; path: string }>

  getRecaudadores: () => Promise<RecaudadorEntity[]>
  createRecaudador: (body: any) => Promise<any>
  updateRecaudador: (id: number, body: any) => Promise<any>
  deleteRecaudador: (id: number) => Promise<{ success: boolean }>

  uploadBoleta: (data: any, tipo: string) => Promise<any>
  uploadCSM: (data: FormularioCSM) => Promise<APIResponse>
  saveCSMPDF: (
    pdfRoute: string,
    cuij: string,
    tribunal: string
  ) => Promise<{ success: boolean; path: string; error?: any }>
  iniciarCargaJudicial: (
    boletas: EnrichedBoleta[],
    montoThreshold: number,
    modoInhibicion: string,
    oficial2: boolean
  ) => Promise<void>
  getCedulasFiltradas: () => Promise<CedulaFiltrada[]>

  iniciarLoginManual: () => Promise<any>
  getBoletasToUpload: (id: number) => Promise<any>
  openPdf: (path: string) => Promise<void>
}
