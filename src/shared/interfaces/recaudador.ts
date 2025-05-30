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

export type CreateRecaudadorDto = RecaudadorEntity
export type UpdateRecaudadorDto = Partial<CreateRecaudadorDto>
