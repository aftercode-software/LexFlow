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
import { FormularioTerceros } from '@renderer/lib/types'
import { useNavigate } from 'react-router'

type FormValues = z.infer<typeof tercerosSchema>
export type BaseFormValues = z.infer<typeof baseFormSchema>

export default function FormTerceros({
  boleta,
  fechaEmision,
  bruto,
  valorEnLetras,
  tipoDocumento,
  documento,
  domicilio,
  apellidoYNombre,
  expediente,
  tipo,
  pdfRoute
}: FormularioTerceros & { pdfRoute: string } & { estado: string }) {
  const navigate = useNavigate()
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

  const { handleSubmit } = form

  const onSubmit = async (data: FormValues) => {
    console.log('Datos del formulario:', data)
    try {
      console.log('PDF route:', pdfRoute)
      console.log('Data a enviar:', data)

      let estado: 'Generada' | 'Error' = 'Generada'
      const result = await window.api.generateDocument(data, pdfRoute)
      estado = 'Generada'

      if (!result.success) {
        estado = 'Error'
      }

      data = {
        ...data,
        estado
      }
      const uploadBoleta = await window.api.uploadBoleta(data, 'Tercero')

      navigate(`/escanear-pdf/${data.boleta}`)
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
        <div className="w-full flex justify-end">
          <Button type="submit" size="lg">
            Generar PDF
          </Button>
        </div>
      </form>
    </Form>
  )
}
