import { useState, useRef, useEffect } from 'react'
import { UseFormReturn } from 'react-hook-form'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent
} from '@/components/ui/accordion'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Search, CheckCircle2, AlertCircle } from 'lucide-react'
import { validateDocument, buscarDemandado } from '@renderer/utils/document'
import { cn } from '@/lib/utils'
import { z } from 'zod'
import { baseFormSchema } from '@renderer/lib/schemas/forms.schemas'
import { DocField } from '@shared/interfaces/demandado'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { extraerDocumento } from '@shared/utils/document'

type FormValues = z.infer<typeof baseFormSchema>

export default function Demandado({ form }: { form: UseFormReturn<FormValues> }) {
  const {
    watch,
    getValues,
    setValue,
    control,
    formState: { errors }
  } = form

  const [currentField, setCurrentField] = useState<DocField>('dni')
  const [isSearching, setIsSearching] = useState(false)
  const [documentFound, setDocumentFound] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [warningMessage, setWarningMessage] = useState('')
  const [autoFields, setAutoFields] = useState<string[]>([])
  const [accordionOpen, setAccordionOpen] = useState<string>('')
  const previousValue = useRef('')

  const tipo = watch('tipo')
  const dni = watch('demandado.dni')
  const cuil = watch('demandado.cuil')
  const cuit = watch('demandado.cuit')

  useEffect(() => {
    let field: DocField = 'dni'
    if (cuit?.trim()) field = 'cuit'
    setCurrentField(field)
    previousValue.current = ''
    setDocumentFound(false)
    setAutoFields([])
    setShowWarning(false)
  }, [dni, cuil, cuit])

  useEffect(() => {
    const path = `demandado.${currentField}` as const
    const val = getValues(path)
    setValue(path, val ?? '', { shouldDirty: false, shouldTouch: false })
  }, [currentField, getValues, setValue])

  const handleSearch = async () => {
    const fieldName = `demandado.${currentField}` as const
    const raw = getValues(fieldName) ?? ''
    const value = raw.trim()
    const { valid, error } = validateDocument(currentField, value)
    if (!valid) {
      setShowWarning(true)
      setWarningMessage(error!)
      setDocumentFound(false)
      return
    }
    if (value === previousValue.current && documentFound) return
    previousValue.current = value

    setIsSearching(true)
    setShowWarning(false)
    setDocumentFound(false)
    setAutoFields([])

    try {
      const data = await buscarDemandado(value, currentField)
      if (data) {
        setValue('demandado.apellido', data.apellido)
        setValue('demandado.nombre', data.nombre)
        setValue('demandado.nombreCompleto', data.apellidoYNombre)
        setValue('demandado.domicilio', data.domicilio)
        setValue('demandado.domicilioTipo', data.domicilioTipo ?? 'REAL')
        setAutoFields(['apellido', 'nombre', 'nombreCompleto', 'domicilio', 'domicilioTipo'])
        setAccordionOpen('auto')
        setDocumentFound(true)
      } else {
        setWarningMessage(`${currentField.toUpperCase()} no encontrado.`)
        setShowWarning(true)
      }
    } catch {
      setWarningMessage('Error al buscar demandado.')
      setShowWarning(true)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Error de búsqueda */}
      {showWarning && (
        <Alert variant="destructive" className="text-red-600 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" color="#dc2626" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{warningMessage}</AlertDescription>
        </Alert>
      )}

      {/* Documento dinámico */}
      <FormField
        name={`demandado.${currentField}` as const}
        control={control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{currentField === 'dni' ? 'DNI' : 'CUIT'}</FormLabel>
            <div className="flex items-center gap-2">
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ''}
                  className={cn(documentFound && 'border-green-500')}
                  onChange={(e) => {
                    field.onChange(e)
                    setDocumentFound(false)
                  }}
                  onBlur={() => {
                    field.onBlur()
                    handleSearch()
                    // detectar automáticamente tipo de documento según contenido
                    const doc = extraerDocumento(field.value ?? null)
                    const newField = doc.tipo.toLowerCase() as DocField
                    if (newField !== currentField) {
                      // mover valor al campo correcto y limpiar el anterior
                      setValue(`demandado.${newField}`, field.value, { shouldDirty: true })
                      setValue(`demandado.${currentField}`, null)
                      setCurrentField(newField)
                    }
                  }}
                />
              </FormControl>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleSearch}
                disabled={
                  isSearching || (field.value ?? '').length < (currentField === 'dni' ? 7 : 11)
                }
              >
                {isSearching ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            <FormMessage>{errors.demandado?.[currentField]?.message}</FormMessage>
          </FormItem>
        )}
      />

      {tipo === 'Profesional' && (
        <FormField
          name="demandado.matricula"
          control={control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Matrícula</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage>{errors.demandado?.matricula?.message}</FormMessage>
            </FormItem>
          )}
        />
      )}

      {/* Autocompletados */}
      {autoFields.length > 0 ? (
        <Accordion
          type="single"
          collapsible
          value={accordionOpen}
          onValueChange={(v) => setAccordionOpen(v || '')}
        >
          <AccordionItem value="auto">
            <AccordionTrigger>
              <div className="text-green-600 text-sm flex items-center font-semibold">
                <CheckCircle2 className="h-4 w-4 mr-1" /> Datos autocompletados
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-4 gap-4">
                {/* Fila 1 */}
                <div className="col-span-1">
                  <FormField
                    name="demandado.apellido"
                    control={control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Apellido</FormLabel>
                        <FormControl>
                          <Input {...field} className="border-green-200 bg-green-50" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-1">
                  <FormField
                    name="demandado.nombre"
                    control={control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input {...field} className="border-green-200 bg-green-50" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-2">
                  <FormField
                    name="demandado.nombreCompleto"
                    control={control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre completo</FormLabel>
                        <FormControl>
                          <Input {...field} className="border-green-200 bg-green-50" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Fila 2 */}
                <div className="col-span-1">
                  <FormField
                    name="demandado.domicilioTipo"
                    control={control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo domicilio</FormLabel>
                        <FormControl>
                          <Select value={field.value ?? ''} onValueChange={field.onChange}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Seleccione tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="REAL">REAL</SelectItem>
                              <SelectItem value="ESPECIAL">ESPECIAL</SelectItem>
                              <SelectItem value="FISCAL">FISCAL</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <div className="col-span-3">
                  <FormField
                    name="demandado.domicilio"
                    control={control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Domicilio</FormLabel>
                        <FormControl>
                          <Input {...field} className="border-green-200 bg-green-50" />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {/* Fila 1 */}
          <div className="col-span-1">
            <FormField
              name="demandado.apellido"
              control={control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellido</FormLabel>
                  <FormControl>
                    <Input {...field} className="" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-1">
            <FormField
              name="demandado.nombre"
              control={control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input {...field} className="" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-2">
            <FormField
              name="demandado.nombreCompleto"
              control={control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre completo</FormLabel>
                  <FormControl>
                    <Input {...field} className="" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          {/* Fila 2 */}
          <div className="col-span-1">
            <FormField
              name="demandado.domicilioTipo"
              control={control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo domicilio</FormLabel>
                  <FormControl>
                    <Select value={field.value ?? ''} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Seleccione tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="REAL">REAL</SelectItem>
                        <SelectItem value="ESPECIAL">ESPECIAL</SelectItem>
                        <SelectItem value="FISCAL">FISCAL</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>

          <div className="col-span-3">
            <FormField
              name="demandado.domicilio"
              control={control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Domicilio</FormLabel>
                  <FormControl>
                    <Input {...field} className="" />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
      )}
    </div>
  )
}
