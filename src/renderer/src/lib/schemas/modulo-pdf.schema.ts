import { z } from 'zod'

export const formularioProfesionalSchema = z.object({
  fechaEmision: z.string(),
  dni: z.string().nullable(),
  cuil: z.string().nullable(),
  boleta: z.string(),
  nombre: z.string(),
  // domicilioTipo: z.string(),
  domicilio: z.string(),
  provincia: z.string(),
  bruto: z.string(),
  valor: z.number()
})

export const formularioTerceroSchema = z.object({
  fechaEmision: z.string(),
  dni: z.string().nullable(),
  cuil: z.string().nullable(),
  boleta: z.string(),
  nombre: z.string(),
  // domicilioTipo: z.string(),
  domicilio: z.string(),
  provincia: z.string(),
  expediente: z.string().nullable(),
  bruto: z.string(),
  valor: z.number()
})
