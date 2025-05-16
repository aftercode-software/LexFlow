import { formularioProfesionalSchema } from '@/lib/schemas/modulo-pdf.schema'
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
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import Recaudador from './Recaudador'

type FormValues = z.infer<typeof formularioProfesionalSchema>

export default function FormProfesionales({
  fechaEmision,
  dni,
  cuil,
  boleta,
  nombre,
  domicilio,
  provincia,
  bruto,
  valorEnLetras
}: {
  fechaEmision: string
  dni: string | null
  cuil: string | null
  boleta: string
  nombre: string
  domicilio: string
  provincia: string
  bruto: number
  valorEnLetras: string
}) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formularioProfesionalSchema),
    defaultValues: {
      recaudador: {
        id: 0,
        nombre: '',
        matricula: 0,
        telefono: '',
        celular: '',
        organismo: '',
        descripcion: '',
        email: '',
        oficial: ''
      },
      fechaEmision,
      dni,
      cuil,
      boleta,
      nombre,
      domicilio,
      provincia,
      bruto,
      valorEnLetras
    }
  })

  useEffect(() => {
    form.reset({
      recaudador: {
        id: 0,
        nombre: '',
        matricula: 0,
        telefono: '',
        celular: '',
        organismo: '',
        descripcion: '',
        email: '',
        oficial: ''
      },
      fechaEmision,
      dni,
      cuil,
      boleta,
      nombre,
      domicilio,
      provincia,
      bruto,
      valorEnLetras
    })
  }, [fechaEmision, dni, cuil, boleta, nombre, domicilio, provincia, bruto, valorEnLetras])

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
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="valorEnLetras"
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
        <Button type="submit">Enviar</Button>
      </form>
    </Form>
  )
}
