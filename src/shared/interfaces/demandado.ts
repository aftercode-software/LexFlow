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

export interface DemandadoEntity {
  id: number
  apellido: string
  nombre: string
  apellidoYNombre: string
  tipoDocumento: 'CUIL' | 'CUIT' | 'DNI'
  numeroDocumento: string
  tipo: 'Tercero' | 'Profesional'
  matricula?: number
  domicilio: string
  idNombre: string
}
