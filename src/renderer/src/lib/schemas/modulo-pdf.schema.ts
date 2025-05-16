import { z } from 'zod'

export const recaudadorSchema = z
  .object({
    id: z.number(),
    nombre: z.string(),
    matricula: z.number(),
    telefono: z.string(),
    celular: z.string(),
    organismo: z.string(),
    descripcion: z.string(),
    email: z.string(),
    oficial: z.string()
  })
  .refine((data) => data.id !== 0, {
    message: 'Debe seleccionar un recaudador'
  })

export const formularioProfesionalSchema = z.object({
  recaudador: recaudadorSchema,
  fechaEmision: z.string(),
  dni: z.string().nullable(),
  cuil: z.string().nullable(),
  boleta: z.string(),
  nombre: z.string(),
  // domicilioTipo: z.string(),
  domicilio: z.string(),
  provincia: z.string(),
  bruto: z.number(),
  valorEnLetras: z.string()
})

export const formularioTerceroSchema = z.object({
  recaudador: recaudadorSchema,
  fechaEmision: z.string(),
  dni: z.string().nullable(),
  cuil: z.string().nullable(),
  boleta: z.string(),
  nombre: z.string(),
  apellido: z.string(),
  nombreCompleto: z.string(),
  // domicilioTipo: z.string(),
  domicilio: z.string(),
  provincia: z.string(),
  expediente: z.string().nullable(),
  bruto: z.number(),
  valorEnLetras: z.string()
})
