'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { formularioTerceroSchema } from '@/lib/schemas/modulo-pdf.schema'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { AlertCircle, CheckCircle2, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

import { z } from 'zod'
import { fetchDniData } from '@renderer/lib/forms'

type FormValues = z.infer<typeof formularioTerceroSchema>

interface Props extends Partial<FormValues> {
  onSubmit?: (data: FormValues) => void
}

export default function FormTerceros({
  fechaEmision,
  dni,
  boleta,
  nombre,
  domicilio,
  provincia,
  expediente,
  bruto,
  valor,
  onSubmit
}: Props) {
  const [isSearching, setIsSearching] = useState(false)
  const [dniFound, setDniFound] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [warningMessage, setWarningMessage] = useState('')
  const [autoCompletedFields, setAutoCompletedFields] = useState<string[]>([])
  const [accordionOpen, setAccordionOpen] = useState<string[]>([])
  const previousDni = useRef<string>('')

  const form = useForm<FormValues>({
    resolver: zodResolver(formularioTerceroSchema),
    defaultValues: {
      boleta: boleta || '',
      fechaEmision: fechaEmision || '',
      dni: dni || '',
      nombre: nombre || '',
      domicilio: domicilio || '',
      provincia: provincia || '',
      expediente: expediente || '',
      bruto: bruto || '',
      valor: valor || ''
    }
  })

  useEffect(() => {
    form.reset({
      boleta: boleta || '',
      fechaEmision: fechaEmision || '',
      dni: dni || '',
      nombre: nombre || '',
      domicilio: domicilio || '',
      provincia: provincia || '',
      expediente: expediente || '',
      bruto: bruto || '',
      valor: valor || ''
    })
  }, [boleta, fechaEmision, dni, nombre, domicilio, provincia, expediente, bruto, valor])

  const searchByDni = async () => {
    const valorDni = form.getValues('dni').trim()

    // Validar caracteres especiales
    const specialCharsRegex = /[|°&?!@#$%^*()_+\-=[\]{};':"\\,.<>/?]/
    if (specialCharsRegex.test(valorDni)) {
      setShowWarning(true)
      setWarningMessage('El DNI contiene caracteres especiales.')
      return
    }
    if (valorDni.length < 7) return

    if (valorDni === previousDni.current) return
    previousDni.current = valorDni

    setShowWarning(false)
    setIsSearching(true)
    setDniFound(false)

    try {
      const data = await fetchDniData(valorDni)
      if (data) {
        form.setValue('nombre', data.nombre)
        form.setValue('domicilio', data.domicilio)

        setAutoCompletedFields(['nombre', 'domicilio'])
        setAccordionOpen(['auto-completed'])
        setDniFound(true)
      } else {
        setAutoCompletedFields([])
        setDniFound(false)
      }
    } catch (error: any) {
      console.error('Error al buscar datos por DNI:', error)
      setShowWarning(true)
      setWarningMessage(error.message || 'Ocurrió un error al buscar los datos.')
    } finally {
      setIsSearching(false)
    }
  }

  // sólo advertencia, no dispara búsqueda automática
  useEffect(() => {
    const sub = form.watch((_, { name }) => {
      if (name === 'dni') {
        const v = form.getValues('dni') || ''
        if (v.length >= 7) {
          const specialCharsRegex = /[|°&?!@#$%^*()_+\-=[\]{};':"\\,.<>/?]/
          if (specialCharsRegex.test(v)) {
            setShowWarning(true)
            setWarningMessage('El DNI contiene caracteres especiales.')
          } else {
            setShowWarning(false)
          }
        }
      }
    })
    return () => sub.unsubscribe()
  }, [form.watch])

  const handleSubmit = (data: FormValues) => {
    if (onSubmit) onSubmit(data)
  }

  return (
    <div className="bg-white border rounded-lg p-6">
      {showWarning && (
        <Alert variant="warning" className="mb-6 bg-amber-50 border-amber-200 text-amber-800">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{warningMessage}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Primera fila */}
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

          {/* DNI */}
          <div className="relative">
            <FormField
              name="dni"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>DNI</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input
                        {...field}
                        className={cn(dniFound && 'border-green-500 focus-visible:ring-green-500')}
                        onChange={(e) => {
                          field.onChange(e)
                          setDniFound(false)
                        }}
                        onBlur={() => searchByDni()}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={searchByDni}
                      disabled={isSearching || field.value.length < 7}
                    >
                      {isSearching ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {dniFound && (
                    <div className="text-green-600 text-sm flex items-center mt-1">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Datos encontrados
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Auto-completados */}
          {autoCompletedFields.length > 0 && (
            <Accordion
              type="single"
              collapsible
              value={accordionOpen}
              onValueChange={setAccordionOpen}
              className="border rounded-md"
            >
              <AccordionItem value="auto-completed" className="border-none">
                <AccordionTrigger className="px-4 py-2 hover:bg-gray-50">
                  <div className="flex items-center text-green-700">
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    <span>Datos auto-completados</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-1">
                  <div className="space-y-4">
                    <FormField
                      name="nombre"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className={cn(
                                autoCompletedFields.includes('nombre') &&
                                  'border-green-200 bg-green-50'
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="domicilio"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Domicilio</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className={cn(
                                autoCompletedFields.includes('domicilio') &&
                                  'border-green-200 bg-green-50'
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {/* Campos restantes */}
          {!autoCompletedFields.length && (
            <div className="space-y-4">
              <FormField
                name="nombre"
                control={form.control}
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
                name="domicilio"
                control={form.control}
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
            </div>
          )}

          {/* Resto de campos */}
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
                  <Input {...field} value={field.value || ''} />
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
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              name="valor"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            className="w-full md:w-auto float-right bg-[#0f172a] hover:bg-[#1e293b]"
          >
            Enviar datos
          </Button>
        </form>
      </Form>
    </div>
  )
}
