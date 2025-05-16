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

export const demandadoSchema = z
  .object({
    dni: z.string().nullable(),
    cuit: z.string().nullable().optional(), //TODO: Ver que se ahce con cuil/cuit
    cuil: z.string().nullable(),
    apellido: z.string(),
    nombre: z.string(),
    nombreCompleto: z.string(),
    domicilio: z.string()
  })
  .refine(
    (d) => {
      const hasDNI = (d.dni?.trim().length ?? 0) > 0
      const hasCUIL = (d.cuil?.trim().length ?? 0) > 0
      const hasCUIT = (d.cuit?.trim().length ?? 0) > 0
      return hasDNI || hasCUIL || hasCUIT
    },
    {
      message: 'Debe completar DNI o CUIL/CUIT',
      path: ['dni']
    }
  )

export const baseFormSchema = z.object({
  recaudador: recaudadorSchema,
  demandado: demandadoSchema,
  fechaEmision: z.string(),
  boleta: z.string(),
  provincia: z.string(),
  bruto: z.number(),
  valorEnLetras: z.string()
})

export const tercerosSchema = baseFormSchema.extend({
  expediente: z.string().nullable()
})

export const profesionalesSchema = baseFormSchema.extend({
  matricula: z.string().nullable()
})

// export const formularioProfesionalSchema = z.object({
//   recaudador: recaudadorSchema,
//   fechaEmision: z.string(),
//   dni: z.string().nullable(),
//   cuil: z.string().nullable(),
//   boleta: z.string(),
//   nombre: z.string(),
//   // domicilioTipo: z.string(),
//   domicilio: z.string(),
//   provincia: z.string(),
//   bruto: z.number(),
//   valorEnLetras: z.string()
// })

// export const formularioTerceroSchema = z.object({
//   recaudador: recaudadorSchema,
//   fechaEmision: z.string(),
//   dni: z.string().nullable(),
//   cuil: z.string().nullable(),
//   boleta: z.string(),
//   nombre: z.string(),
//   apellido: z.string(),
//   nombreCompleto: z.string(),
//   // domicilioTipo: z.string(),
//   domicilio: z.string(),
//   provincia: z.string(),
//   expediente: z.string().nullable(),
//   bruto: z.number(),
//   valorEnLetras: z.string()
// })
