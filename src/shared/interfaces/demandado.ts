export type DocField = 'dni' | 'cuit'

export interface Documento {
  tipo: 'DNI' | 'CUIT'
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
  tipoDocumento: 'CUIT' | 'DNI'
  numeroDocumento: string
  tipo: 'Tercero' | 'Profesional'
  matricula?: number
  domicilio: string
  idNombre: string
}
