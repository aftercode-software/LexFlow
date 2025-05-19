import { z } from 'zod'

export const recaudadorSchema = z
  .object({
    id: z.number(),
    nombre: z.string(),
    sexo: z.enum(['M', 'F']),
    matricula: z.number(),
    telefono: z.string(),
    celular: z.string(),
    organismo: z.string(),
    descripcion: z.string(),
    email: z.string(),
    oficial: z.string(),
    idNombre: z.string()
  })
  .refine((data) => data.id !== 0, {
    message: 'Debe seleccionar un recaudador'
  })

const CUIT_REGEX = /^(20|23|24|27|30|33)-?\d{8}-?\d$/

export const demandadoSchema = z
  .object({
    dni: z.string().nullable(),
    cuil: z.string().nullable(),
    cuit: z.string().nullable(),
    apellido: z.string(),
    nombre: z.string(),
    nombreCompleto: z.string(),
    domicilio: z.string(),
    matricula: z.string().nullable().optional()
  })
  .superRefine((data, ctx) => {
    const docs = [data.dni?.trim(), data.cuil?.trim(), data.cuit?.trim()].filter(
      (s) => s && s.length > 0
    )
    if (docs.length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debe completar uno y sólo uno de: DNI, CUIL o CUIT',
        path: ['dni']
      })
    }

    if (data.cuil && !CUIT_REGEX.test(data.cuil)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'CUIL inválido',
        path: ['cuil']
      })
    }
    if (data.cuit && !CUIT_REGEX.test(data.cuit)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'CUIT inválido',
        path: ['cuit']
      })
    }
  })
const baseFormObjectSchema = z.object({
  recaudador: recaudadorSchema,
  demandado: demandadoSchema,
  fechaEmision: z.string(),
  boleta: z.string(),
  bruto: z.number(),
  valorEnLetras: z.string(),
  tipo: z.enum(['Tercero', 'Profesional']),
  estado: z.enum(['Generada', 'Error', 'Subida']).optional()
})

export const baseFormSchema = baseFormObjectSchema.superRefine((data, ctx) => {
  if (data.tipo === 'Profesional') {
    const mat = data.demandado.matricula?.trim() ?? ''
    if (!mat) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La matrícula es obligatoria para profesionales',
        path: ['demandado', 'matricula']
      })
    }
  }
})

export const tercerosSchema = baseFormObjectSchema
  .extend({
    expediente: z.string().nullable()
  })
  .superRefine((data, ctx) => {
    if (data.tipo === 'Profesional') {
      const mat = data.demandado.matricula?.trim() ?? ''
      if (!mat) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'La matrícula es obligatoria para profesionales',
          path: ['demandado', 'matricula']
        })
      }
    }
  })
