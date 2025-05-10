import { formularioProfesionalSchema } from '@/lib/schemas/modulo-pdf.schema'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@renderer/components/ui/form'
import { Input } from '@renderer/components/ui/input'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

type FormValues = z.infer<typeof formularioProfesionalSchema>

export default function FormProfesionales({
  fechaEmision,
  dni,
  cuil,
  boleta,
  nombre,
  domicilioTipo,
  domicilio,
  provincia,
  bruto,
  valor
}: FormValues) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formularioProfesionalSchema),
    defaultValues: {
      fechaEmision,
      dni,
      cuil,
      boleta,
      nombre,
      domicilioTipo,
      domicilio,
      provincia,
      bruto,
      valor
    }
  })

  useEffect(() => {
    form.reset({
      fechaEmision,
      dni,
      cuil,
      boleta,
      nombre,
      domicilioTipo,
      domicilio,
      provincia,
      bruto,
      valor
    })
  }, [fechaEmision, dni, cuil, boleta, nombre, domicilioTipo, domicilio, provincia, bruto, valor])

  const { handleSubmit } = form

  const onSubmit = (data: FormValues) => {
    console.log('Data: ', data)
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name="fechaEmision"
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
        {dni ? (
          <FormField
            control={form.control}
            name="dni"
            render={({ field }) => (
              <FormItem>
                <FormLabel>DNI</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ) : (
          <FormField
            control={form.control}
            name="cuil"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CUIL</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="boleta"
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
          control={form.control}
          name="nombre"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="domicilioTipo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de domicilio</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="domicilio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Domicilio</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
        <FormField
          control={form.control}
          name="bruto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bruto</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="valor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valor</FormLabel>
              <FormControl>
                <Input {...field} type="number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  )
}
