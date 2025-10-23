export type DatosFormulario = {
  boleta: string
  fechaEmision: string
  secuencia: string

  tipoDocumento: 'DNI' | 'CUIL' | 'CUIT'
  apellidoYNombre: string
  documento: string
  domicilio: string

  objeto: string | null
  bruto: number
  valorEnLetras: string
}

export type FormularioCSM = {
  cuij: string
  numeroJuicio: string
}
