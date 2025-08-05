/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { zodResolver } from '@hookform/resolvers/zod'
import { baseFormSchema, tercerosSchema } from '@renderer/lib/schemas/forms.schemas'
import { useEffect } from 'react'
import { FieldErrors, useForm, UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import Demandado from '../Demandado'
import Recaudador from '../Recaudador'
import { generatePDF, uploadBoleta } from '@renderer/utils/forms'
import { toast } from 'sonner'
import { FormularioTerceros } from '@shared/interfaces/form'
import { numeroALetras } from '@shared/utils/document'

type FormValues = z.infer<typeof tercerosSchema>
export type BaseFormValues = z.infer<typeof baseFormSchema>

export default function FormTerceros({
  boleta,
  fechaEmision,
  bruto,
  valorEnLetras,
  tipoDocumento,
  documento,
  domicilioTipo,
  domicilio,
  apellidoYNombre,
  expediente,
  tipo,
  pdfRoute,
  onComplete
}: FormularioTerceros & { pdfRoute: string } & { estado: string } & {
  onComplete: () => void
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(tercerosSchema),
    defaultValues: {
      tipo,
      recaudador: { id: 0, nombre: '' },
      demandado: {
        dni: tipoDocumento === 'DNI' ? documento : null,
        cuil: tipoDocumento === 'CUIL' ? documento : null,
        cuit: tipoDocumento === 'CUIT' ? documento : null,
        apellido: '',
        nombre: '',
        domicilioTipo,
        nombreCompleto: apellidoYNombre,
        domicilio
      },
      fechaEmision,
      boleta,
      bruto,
      valorEnLetras,
      expediente
    }
  })

  console.log('defaultValues:', tipoDocumento)
  console.log('Valores por defecto:', form.getValues())

  const { handleSubmit, watch } = form

  const brutoWatch = watch('bruto')

  useEffect(() => {
    if (brutoWatch !== bruto) {
      try {
        const brutoNumber = Number(brutoWatch)
        form.setValue('bruto', brutoNumber)
        const valorEnLetras = numeroALetras(brutoNumber)
        form.setValue('valorEnLetras', valorEnLetras.toUpperCase())
      } catch (err) {
        form.setValue('valorEnLetras', 'NÚMERO MUY GRANDE')
      }
    }
  }, [brutoWatch])

  const onSubmit = async (data: FormValues) => {
    console.log('Datos del formulario:', data)
    try {
      let estado: 'Generada' | 'Error' = 'Generada'
      const { success } = await generatePDF(data, pdfRoute)

      success ? (estado = 'Generada') : (estado = 'Error')

      data = {
        ...data,
        estado
      }

      const result = await uploadBoleta(data, 'Tercero')
      if (result.success || result.updated) {
        toast.success('Boleta subida correctamente')
        onComplete()
      }
    } catch (err) {
      console.error('Error al generar doc:', err)
    } finally {
      onComplete()
    }
    console.log('Data: ', data)
  }

  function getFirstErrorMessage(errors: FieldErrors): string | null {
    for (const key in errors) {
      const error = errors[key]
      if (!error) continue

      if (typeof error.message === 'string') return error.message

      if (typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
        return error.message
      }

      if (typeof error === 'object') {
        const nested = getFirstErrorMessage(error as FieldErrors)
        if (nested) return nested
      }
    }

    return null
  }

  const onError = (errors: FieldErrors<FormValues>) => {
    const message = getFirstErrorMessage(errors) || 'Error de validación.'
    toast.error(message)
  }

  return (
    <Form {...form}>
      <form id="boleta-form" onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
        <Recaudador />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            name="boleta"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Boleta</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="fechaEmision"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de emisión</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Demandado form={form as unknown as UseFormReturn<BaseFormValues>} />
        {/* provincia, expediente, bruto, valor */}

        <div className="flex flex-col md:flex-row gap-4">
          <FormField
            name="expediente"
            control={form.control}
            render={({ field }) => (
              <FormItem className="max-w-[200px]">
                <FormLabel>Expediente</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="bruto"
            control={form.control}
            render={({ field }) => (
              <FormItem className="max-w-[200px]">
                <FormLabel>Bruto</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="valorEnLetras"
            control={form.control}
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel>Valor en letras</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  )
}
