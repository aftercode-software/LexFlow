export interface RecaudadorEntity {
  id: number
  nombre: string
  sexo: 'M' | 'F'
  matricula: number
  telefono: string
  celular: string
  organismo: string
  descripcion: string
  email: string
  oficial: string
  idNombre: string
}

export type CreateRecaudadorDto = Omit<RecaudadorEntity, 'id'>
export type UpdateRecaudadorDto = Partial<CreateRecaudadorDto>
