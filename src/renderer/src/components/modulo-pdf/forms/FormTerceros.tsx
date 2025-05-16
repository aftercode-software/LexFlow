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
import { useForm, UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import Recaudador from './Recaudador'
import Demandado from './Demandado'
import { Button } from '@renderer/components/ui/button'
import { baseFormSchema, tercerosSchema } from '@renderer/lib/schemas/forms.schemas'

type FormValues = z.infer<typeof tercerosSchema>
export type BaseFormValues = z.infer<typeof baseFormSchema>

export default function FormTerceros({
  fechaEmision,
  dni,
  cuil,
  cuit,
  boleta,
  nombreCompleto,
  domicilio,
  provincia,
  expediente,
  bruto,
  valorEnLetras,
  pdfRoute
}: {
  fechaEmision: string
  dni: string | null
  cuil: string | null
  cuit: string | null
  boleta: string
  nombre: string
  apellido: string
  nombreCompleto: string
  domicilio: string
  provincia: string
  expediente: string | null
  bruto: number
  valorEnLetras: string
  pdfRoute: string
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(tercerosSchema),
    defaultValues: {
      boleta,
      fechaEmision,
      demandado: {
        dni: dni,
        cuil: cuil,
        cuit: cuit,
        nombre: '',
        apellido: '',
        nombreCompleto,
        domicilio
      },
      provincia,
      expediente,
      bruto,
      valorEnLetras
    }
  })

  const { handleSubmit } = form

  const onSubmit = async (data: FormValues) => {
    try {
      console.log('PDF route:', pdfRoute)
      console.log('Data a enviar:', data)
      const result = await window.api.generateDocument(data, pdfRoute)
      console.log('Resultado:', result)
    } catch (err) {
      console.error('Error al generar doc:', err)
    }
    console.log('Data: ', data)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={handleSubmit(onSubmit, (errors) =>
          console.log('Errores de validación', errors, form.getValues())
        )}
        className="space-y-6"
      >
        {/* boleta + fecha */}
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
        <FormField
          name="provincia"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Provincia</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="expediente"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expediente</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            name="bruto"
            control={form.control}
            render={({ field }) => (
              <FormItem>
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
              <FormItem>
                <FormLabel>Valor en letras</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="w-full flex justify-end">
          <Button type="submit" size="lg">
            Generar PDF
          </Button>
        </div>
      </form>
    </Form>
  )
}
