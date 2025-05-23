export type TipoDocumento = 'CUIT' | 'CUIL' | 'DNI'
export type TipoDemandado = 'Tercero' | 'Profesional'

export type TipoBoleta = 'Profesional' | 'Tercero'
export type EstadoBoleta = 'Generada' | 'Revisada' | 'Subida' | 'Error'

export interface EnrichedBoleta {
  id: number
  boleta: string
  tanda?: string
  tipo: TipoBoleta
  demandado: {
    id: number
    apellido: string
    nombre: string
    apellidoYNombre: string
    tipoDocumento: TipoDocumento
    numeroDocumento: string
    tipo: TipoDemandado
    matricula?: number
    domicilio: string
    idNombre: string
  }
  recaudador: {
    id: number
    nombre: string
    sexo: string
    matricula: number
    telefono: string
    celular: string
    organismo: string
    descripcion: string
    email: string
    oficial: string
    idNombre: string
  }
  numeroJuicio?: string
  juzgado?: string
  expediente?: string
  fechaInicioDemanda: string
  monto: string
  montoEnLetras: string
  fechaSentencia?: string
  observaciones?: string
  estado: EstadoBoleta
}
