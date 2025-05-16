export interface DatosProfesional {
  fechaEmision: string
  dni: string | null
  cuil: string | null
  boleta: string
  nombre: string
  domicilioTipo: string
  domicilio: string
  provincia: string
  bruto: number
  valorEnLetras: string
}

export interface DatosTercero {
  fechaEmision: string
  dni: string | null
  cuil: string | null
  boleta: string
  nombreCompleto: string
  domicilioTipo: string
  domicilio: string
  provincia: string
  expediente: string | null
  bruto: number
  valorEnLetras: string
}
