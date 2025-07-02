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
import { baseFormSchema, csmSchema } from '@renderer/lib/schemas/forms.schemas'
import { FieldErrors, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { z } from 'zod'

import { toast } from 'sonner'
import { FormularioCSM } from '@shared/interfaces/form'

type FormValues = z.infer<typeof csmSchema>
export type BaseFormValues = z.infer<typeof baseFormSchema>

export default function FormCSM({
  cuij,
  numeroJuicio,
  pdfRoute,
  onComplete
}: FormularioCSM & { pdfRoute: string } & {
  onComplete: () => void
}) {
  const navigate = useNavigate()
  const form = useForm<FormValues>({
    resolver: zodResolver(csmSchema),
    defaultValues: {
      cuij: cuij || '',
      numeroJuicio: numeroJuicio || ''
    }
  })

  console.log('Valores por defecto:', form.getValues())

  const { handleSubmit } = form

  const onSubmit = async (data: FormValues) => {
    console.log('Datos del formulario:', data)
    try {
      await window.api.uploadCSM(data)
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            name="cuij"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>CUIJ</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="numeroJuicio"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de juicio</FormLabel>
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
