import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@renderer/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@renderer/components/ui/form'
import { Input } from '@renderer/components/ui/input'
import { useForm, UseFormReturn } from 'react-hook-form'
import { z } from 'zod'
import Recaudador from '../Recaudador'
import Demandado from '../Demandado'
import { baseFormSchema } from '@renderer/lib/schemas/forms.schemas'
import { FormularioProfesionales } from '@renderer/lib/types'

type FormValues = z.infer<typeof baseFormSchema>
export type BaseFormValues = z.infer<typeof baseFormSchema>

export default function FormProfesionales({
  boleta,
  fechaEmision,
  bruto,
  valorEnLetras,
  tipoDocumento,
  documento,
  domicilio,
  apellidoYNombre,
  tipo,
  matricula,
  pdfRoute
}: FormularioProfesionales & { pdfRoute: string } & { estado: string }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(baseFormSchema),
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
        domicilio,
        matricula
      },
      fechaEmision,
      boleta,
      bruto,
      valorEnLetras
    }
  })

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
      await window.api.uploadBoleta(data, 'Profesional')
    } catch (err) {
      console.error('Error al generar doc:', err)
    }
    console.log('Data: ', data)
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Recaudador />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            name="boleta"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Boleta</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
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
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Demandado form={form as unknown as UseFormReturn<BaseFormValues>} />

        <div className="flex flex-col md:flex-row gap-4">
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
