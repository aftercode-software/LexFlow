import { z } from 'zod'

export const recaudadorSchema = z
  .object({
    id: z.number({ required_error: 'Debe seleccionar un recaudador' }),
    nombre: z.string({ required_error: 'El nombre del recaudador es requerido' }),
    sexo: z.enum(['M', 'F'], { required_error: 'Debe seleccionar un recaudador' }),
    matricula: z.number({ required_error: 'La matrícula es obligatoria' }),
    telefono: z.string({ required_error: 'El teléfono es obligatorio' }),
    celular: z.string({ required_error: 'El celular es obligatorio' }),
    organismo: z.string({ required_error: 'El organismo es obligatorio' }),
    descripcion: z.string({ required_error: 'La descripción es obligatoria' }),
    email: z.string({ required_error: 'El email es obligatorio' }),
    oficial: z.string({ required_error: 'Debe completar el campo oficial' }),
    idNombre: z.string({ required_error: 'El campo idNombre es obligatorio' })
  })
  .refine((data) => data.id !== 0, {
    message: 'Debe seleccionar un recaudador',
    path: ['id']
  })

const CUIT_REGEX = /^(20|23|24|27|30|33)-?\d{8}-?\d$/

export const demandadoSchema = z
  .object({
    dni: z.string().nullable().optional(),
    cuil: z.string().nullable().optional(),
    cuit: z.string().nullable().optional(),
    apellido: z.string({ required_error: 'El apellido es obligatorio' }),
    nombre: z.string({ required_error: 'El nombre es obligatorio' }),
    nombreCompleto: z.string({ required_error: 'El nombre completo es obligatorio' }),
    domicilioTipo: z.string({ required_error: 'El tipo de domicilio es obligatorio' }),
    domicilio: z.string({ required_error: 'El domicilio es obligatorio' }),
    matricula: z.string().nullable().optional()
  })
  .superRefine((data, ctx) => {
    const docs = [data.dni?.trim(), data.cuil?.trim(), data.cuit?.trim()].filter(
      (s) => s && s.length > 0
    )

    if (docs.length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Debe completar el numero de documento',
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
  fechaEmision: z
    .string({ required_error: 'La fecha de emisión es obligatoria' })
    .min(1, 'La fecha de emisión es obligatoria'),
  boleta: z
    .string({ required_error: 'La boleta es obligatoria' })
    .min(1, 'La boleta es obligatoria'),
  bruto: z
    .number({ required_error: 'El monto bruto es obligatorio' })
    .min(1, 'El monto debe ser mayor que 0'),
  valorEnLetras: z
    .string({ required_error: 'El valor en letras es obligatorio' })
    .min(3, 'El valor en letras es obligatorio'),
  tipo: z.enum(['Tercero', 'Profesional'], { required_error: 'Debe seleccionar un tipo' }),
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
    expediente: z.string().nullable().optional()
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
