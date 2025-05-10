export interface DatosProfesional {
  fechaEmision: string
  dni: string | null
  cuil: string | null
  boleta: string
  nombre: string
  domicilioTipo: string
  domicilio: string
  provincia: string
  bruto: string
  valor: number
}

export interface DatosTercero {
  fechaEmision: string
  dni: string | null
  cuil: string | null
  boleta: string
  nombre: string
  domicilioTipo: string
  domicilio: string
  provincia: string
  expediente: string | null
  bruto: string
  valor: number
}
