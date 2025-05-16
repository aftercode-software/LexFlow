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
import Recaudador from './Recaudador'
import Demandado from './Demandado'
import { baseFormSchema, profesionalesSchema } from '@renderer/lib/schemas/forms.schemas'

type FormValues = z.infer<typeof profesionalesSchema>
export type BaseFormValues = z.infer<typeof baseFormSchema>

export default function FormProfesionales({
  fechaEmision,
  dni,
  cuil,
  boleta,
  nombreCompleto,
  domicilio,
  provincia,
  bruto,
  matricula,
  valorEnLetras
}: {
  fechaEmision: string
  dni: string | null
  cuil: string | null
  boleta: string
  nombreCompleto: string
  domicilio: string
  provincia: string
  bruto: number
  matricula: string
  valorEnLetras: string
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(profesionalesSchema),
    defaultValues: {
      boleta,
      fechaEmision,
      matricula,
      demandado: {
        dni: dni,
        cuil: cuil,
        nombre: '',
        apellido: '',
        nombreCompleto,
        domicilio
      },
      provincia,
      bruto,
      valorEnLetras
    }
  })

  const { handleSubmit } = form

  const onSubmit = (data: FormValues) => {
    try {
      // const result = await window.api.generateDocument(extractedData)
      console.log('Resultado:', data)
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
        <FormField
          control={form.control}
          name="matricula"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Matrícula</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Demandado form={form as unknown as UseFormReturn<BaseFormValues>} />

        <FormField
          control={form.control}
          name="provincia"
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
        <Button type="submit">Enviar</Button>
      </form>
    </Form>
  )
}
