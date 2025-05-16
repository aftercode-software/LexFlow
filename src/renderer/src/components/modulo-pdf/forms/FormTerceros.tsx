/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { formularioTerceroSchema } from '@/lib/schemas/modulo-pdf.schema'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { buscarDemandado, validateDocument } from '@renderer/lib/documentUtils'
import { AlertCircle, CheckCircle2, Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

type FormValues = z.infer<typeof formularioTerceroSchema>

export default function FormTerceros({
  fechaEmision,
  dni,
  cuil,
  boleta,
  nombreCompleto,
  domicilio,
  provincia,
  expediente,
  bruto,
  valorEnLetras
}: {
  fechaEmision: string
  dni: string | null
  cuil: string | null
  boleta: string
  nombre: string
  apellido: string
  nombreCompleto: string
  domicilio: string
  provincia: string
  expediente: string | null
  bruto: number
  valorEnLetras: string
}) {
  const [isSearching, setIsSearching] = useState(false)
  const [documentFound, setDocumentFound] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [warningMessage, setWarningMessage] = useState('')
  const [autoCompletedFields, setAutoCompletedFields] = useState<string[]>([])
  const [accordionOpen, setAccordionOpen] = useState<string>('')
  const previousValue = useRef<string>('')
  const [currentField, setCurrentField] = useState<'dni' | 'cuil'>(cuil === dni ? 'dni' : 'cuil')

  const form = useForm<FormValues>({
    resolver: zodResolver(formularioTerceroSchema),
    defaultValues: {
      boleta,
      fechaEmision,
      dni,
      cuil,
      nombre: '',
      apellido: '',
      nombreCompleto,
      domicilio,
      provincia,
      expediente,
      bruto,
      valorEnLetras
    }
  })

  useEffect(() => {
    form.reset({
      boleta,
      fechaEmision,
      dni,
      cuil,
      nombreCompleto,
      domicilio,
      provincia,
      expediente,
      bruto,
      valorEnLetras
    })
    const newCurrentField = cuil === dni ? 'dni' : 'cuil'
    if (newCurrentField !== currentField) {
      setCurrentField(newCurrentField)
      // Si el campo actual cambia debido a props, reseteamos el valor previo
      // para permitir una nueva búsqueda si el número es el mismo pero el tipo cambió.
      previousValue.current = ''
    }
    // Limpiar estados de búsqueda si las props cambian
    setDocumentFound(false)
    setAutoCompletedFields([])
    setShowWarning(false)
  }, [
    boleta,
    fechaEmision,
    dni,
    cuil,
    nombreCompleto,
    domicilio,
    provincia,
    expediente,
    bruto,
    valorEnLetras,
    form,
    currentField
  ])

  const handleSearchByDocumento = async () => {
    const docValue = form.getValues(currentField)?.trim() || ''

    // Validación temprana en el cliente para feedback inmediato (opcional, ya que buscarDemandado valida)
    const { valid, error: clientValidationError } = validateDocument(currentField, docValue)
    if (!valid) {
      setShowWarning(true)
      setWarningMessage(
        clientValidationError || `Formato de ${currentField.toUpperCase()} incorrecto.`
      )
      setDocumentFound(false)
      setAutoCompletedFields([])
      return
    }

    // Evitar búsqueda si el valor no cambió y ya se encontró previamente.
    if (docValue === previousValue.current && documentFound) {
      return
    }
    previousValue.current = docValue

    setIsSearching(true)
    setShowWarning(false)
    setDocumentFound(false)
    setAutoCompletedFields([]) // Limpiar campos autocompletados antes de nueva búsqueda

    try {
      const demandadoData = await buscarDemandado(docValue, currentField)
      console.log('demandadoData', demandadoData)

      if (demandadoData) {
        form.setValue('nombre', demandadoData.nombre)
        form.setValue('apellido', demandadoData.apellido)
        form.setValue('nombreCompleto', demandadoData.apellidoYNombre)
        form.setValue('domicilio', demandadoData.domicilio)
        // Podrías querer setear el DNI/CUIL si la API lo devuelve y es diferente al buscado
        // form.setValue(currentField, docValue); // Asegura que el valor usado para la búsqueda esté en el campo

        setAutoCompletedFields(['nombre', 'apellido', 'nombreCompleto', 'domicilio'])
        setAccordionOpen('auto-completed')
        setDocumentFound(true)
      } else {
        setDocumentFound(false)
        setAutoCompletedFields([])
        if (currentField === 'cuil') {
          // Si falló con CUIL, cambia a DNI y permite al usuario reintentar.
          // El valor actual del input (que era CUIL) se mantendrá,
          // y ahora se tratará como DNI en la próxima búsqueda.
          setCurrentField('dni')
          // Opcionalmente, podrías limpiar el valor del campo 'dni' si no quieres que herede el valor de 'cuil'
          // form.setValue('dni', ''); // Descomentar si quieres limpiar el campo DNI
          setWarningMessage(
            'CUIL no encontrado. Se cambió el tipo de documento a DNI. Verifique el número y presione buscar si corresponde.'
          )
          setShowWarning(true)
        } else {
          // Falló con DNI (o era DNI desde el inicio y falló)
          setWarningMessage('Documento no encontrado.')
          setShowWarning(true)
        }
      }
    } catch (err: any) {
      console.error('Error al buscar demandado:', err)
      setDocumentFound(false)
      setAutoCompletedFields([])
      setShowWarning(true)
      setWarningMessage('El demandado no se encuentra en la base de datos.')
    } finally {
      setIsSearching(false)
    }
  }

  // Efecto para advertir sobre caracteres inválidos en DNI mientras se escribe
  useEffect(() => {
    const subscription = form.watch((values, { name, type }) => {
      if (name === 'dni' && type === 'change') {
        const dniValue = values.dni || ''
        if (dniValue.length >= 7) {
          // O la longitud mínima que consideres para DNI
          const specialCharsRegex = /[|°&?!@#$%^*()_+\-=[\]{};':"\\,.<>/?]/
          const hasSpecialChars = specialCharsRegex.test(dniValue)
          // Solo muestra la advertencia de caracteres especiales si no hay otra advertencia activa
          // o si la advertencia actual no es sobre documento no encontrado/error de API.
          if (
            hasSpecialChars &&
            (!showWarning || warningMessage !== 'El DNI contiene caracteres especiales.')
          ) {
            // No sobreescribir advertencias más importantes (ej: no encontrado)
            if (!documentFound && !isSearching) {
              setShowWarning(true)
              setWarningMessage('El DNI contiene caracteres especiales no permitidos.')
            }
          } else if (
            !hasSpecialChars &&
            warningMessage === 'El DNI contiene caracteres especiales no permitidos.'
          ) {
            // Si se corrigieron los caracteres especiales, y esa era la advertencia, la quita.
            setShowWarning(false)
            setWarningMessage('')
          }
        } else if (warningMessage === 'El DNI contiene caracteres especiales no permitidos.') {
          // Si el DNI es muy corto y la advertencia era por caracteres, la quita.
          setShowWarning(false)
          setWarningMessage('')
        }
      }
    })
    return () => subscription.unsubscribe()
  }, [form, showWarning, warningMessage, documentFound, isSearching]) // Añadidas dependencias

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
    <div className="bg-white border rounded-lg p-6">
      {showWarning && (
        <Alert variant="default" className="mb-6 bg-amber-50 border-amber-200 text-amber-800">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{warningMessage}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* boleta + fecha */}
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

          {/* campo único: DNI o CUIL */}
          <div className="relative">
            <FormField
              name={currentField}
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{currentField === 'dni' ? 'DNI' : 'CUIT'}</FormLabel>
                  <div className="flex items-center gap-2">
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        className={cn(
                          documentFound && 'border-green-500 focus-visible:ring-green-500'
                        )}
                        onChange={(e) => {
                          field.onChange(e)
                          setDocumentFound(false)
                        }}
                        onBlur={() => {
                          field.onBlur()
                          handleSearchByDocumento()
                        }}
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleSearchByDocumento}
                      disabled={
                        isSearching ||
                        !form.getValues(currentField) ||
                        (form.getValues(currentField) ?? '').length <
                          (currentField === 'dni' ? 7 : 10)
                      }
                    >
                      {isSearching ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  {documentFound && (
                    <div className="text-green-600 text-sm flex items-center mt-1">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Demandado encontrado
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* auto-completados */}
          {autoCompletedFields.length > 0 && (
            <Accordion
              type="single"
              collapsible
              value={accordionOpen}
              onValueChange={(value) => setAccordionOpen(value || '')}
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
                      name="apellido"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Apellido</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className={cn(
                                autoCompletedFields.includes('apellido') &&
                                  'border-green-200 bg-green-50'
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="nombreCompleto"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre completo</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              className={cn(
                                autoCompletedFields.includes('nombreCompleto') &&
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

          {/* campos restantes */}
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
                name="apellido"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                name="nombreCompleto"
                control={form.control}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre completo</FormLabel>
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
        </form>
      </Form>
    </div>
  )
}
