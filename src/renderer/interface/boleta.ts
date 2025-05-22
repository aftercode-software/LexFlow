type TipoBoleta = 'Profesional' | 'Tercero'

export interface EnrichedBoleta {
  id: number
  boleta: string
  tanda?: string
  tipo: TipoBoleta
  demandado: string
  recaudador: string
  numeroJuicio?: string
  juzgado?: string
  expediente?: string
  fechaInicioDemanda: string
  monto: number
  montoEnLetras: string
  fechaSentencia?: string
  observaciones?: string
  estado: string
  fechaSubida: string
  nombreArchivo: string
}
