export type DocField = 'dni' | 'cuil' | 'cuit'

export interface Documento {
  tipo: 'DNI' | 'CUIL' | 'CUIT'
  valor: string
}

export type Demandado = {
  id: string
  apellido: string
  nombre: string
  apellidoYNombre: string
  domicilioTipo: string
  domicilio: string
}
