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
import { datosFormularioSchema } from '@renderer/lib/schemas/forms.schemas'
import { useEffect } from 'react'
import { FieldErrors, useForm } from 'react-hook-form'
import { z } from 'zod'
import Demandado from '../Demandado'
import { generatePDF, uploadBoleta } from '@renderer/utils/forms'
import { toast } from 'sonner'
import { numeroALetras } from '@shared/utils/document'
import { DatosFormulario } from '@shared/interfaces/form'
import { Naturalezas } from '@shared/interfaces/boletas'
import Recaudador from '../Recaudador'

type FormValues = z.infer<typeof datosFormularioSchema>

export default function FormATM({
  boleta,
  fechaEmision,
  secuencia,
  tipoDocumento,
  documento,
  apellidoYNombre,
  domicilio,
  objeto,
  bruto,
  valorEnLetras,
  pdfRoute,
  typePDF,
  onComplete
}: DatosFormulario & { pdfRoute: string } & { estado: string } & {
  onComplete: () => void
} & { typePDF: Naturalezas | null }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(datosFormularioSchema),
    defaultValues: {
      recaudador: {
        id: 0,
        nombre: '',
        sexo: 'M',
        matricula: 0,
        telefono: '',
        celular: '',
        organismo: '',
        descripcion: '',
        email: '',
        oficial: '',
        idNombre: ''
      },
      demandado: {
        dni: tipoDocumento === 'DNI' ? documento : null,
        cuil: tipoDocumento === 'CUIL' ? documento : null,
        cuit: tipoDocumento === 'CUIT' ? documento : null,
        apellido: '',
        nombre: '',
        nombreCompleto: apellidoYNombre,
        domicilio
      },
      boleta,
      fechaEmision,
      secuencia,
      objeto: objeto ?? undefined,
      bruto,
      valorEnLetras
    }
  })

  const { handleSubmit, watch, setValue, control } = form

  const brutoWatch = watch('bruto')
  useEffect(() => {
    try {
      const brutoNumber = Number(brutoWatch ?? 0)
      if (!Number.isFinite(brutoNumber)) return
      setValue('bruto', brutoNumber as unknown as any, { shouldDirty: true })
      const letras = numeroALetras(brutoNumber)
      setValue('valorEnLetras', letras.toUpperCase(), { shouldDirty: true })
    } catch {
      setValue('valorEnLetras', 'NÚMERO MUY GRANDE')
    }
  }, [brutoWatch])

  const onSubmit = async (data: FormValues) => {
    try {
      const payloadT = { ...data, tipo: typePDF as string }
      console.log('dataSUBMIT', payloadT)
      const { success } = await generatePDF(payloadT, pdfRoute)
      const estado: 'Generada' | 'Error' = success ? 'Generada' : 'Error'
      const payload = { ...data, estado } as any

      const result = await uploadBoleta(payload, typePDF)
      if (result.success || result.updated) {
        onComplete()
      }
    } catch (err) {
      console.error('Error al generar doc:', err)
    } finally {
      onComplete()
    }
  }

  function getFirstErrorMessage(errors: FieldErrors): string | null {
    for (const key in errors) {
      const error = (errors as any)[key]
      if (!error) continue
      if (typeof error.message === 'string') return error.message
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            name="boleta"
            control={control}
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
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de emisión</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="DD/MM/AAAA" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="secuencia"
            control={control}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Secuencia</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} className="" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Demandado form={form} />

        <FormField
          name="objeto"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Objeto</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} placeholder="Ej: 0AB453HT" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex flex-col md:flex-row gap-4">
          <FormField
            name="bruto"
            control={control}
            render={({ field }) => (
              <FormItem className="md:w-60">
                <FormLabel>Bruto</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value === '' ? '' : Number(e.target.value))
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            name="valorEnLetras"
            control={control}
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
