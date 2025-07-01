export type DatosFormulario = {
  boleta: string
  fechaEmision: string
  bruto: number
  valorEnLetras: string
  tipoDocumento: 'DNI' | 'CUIL' | 'CUIT'
  documento: string
  domicilioTipo: string
  domicilio: string
  apellidoYNombre: string
}

export type FormularioTerceros = DatosFormulario & {
  expediente: string
  tipo: 'Tercero'
}

export type FormularioProfesionales = DatosFormulario & {
  matricula: string
  tipo: 'Profesional'
}

export type FormularioCSM = {
  cuij: string
  numeroJuicio: string
}
