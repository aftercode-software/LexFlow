export interface DatosProfesional {
  fechaEmision: string
  dni: string | null
  cuil: string | null
  boleta: string
  nombre: string
  nombreCompleto: string
  matricula: string
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
  nombre: string
  apellido: string
  nombreCompleto: string
  domicilio: string
  provincia: string
  expediente: string | null
  bruto: number
  valorEnLetras: string
}
