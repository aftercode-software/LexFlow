// src/components/DemandadoSection.tsx
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
import { validateDocument, buscarDemandado } from '@renderer/lib/documentUtils'
import { cn } from '@/lib/utils'
import { z } from 'zod'
import { baseFormSchema } from '@renderer/lib/schemas/forms.schemas'

type FormValues = z.infer<typeof baseFormSchema>

export default function Demandado({ form }: { form: UseFormReturn<FormValues> }) {
  const {
    watch,
    getValues,
    setValue,
    control,
    formState: { errors }
  } = form

  const [currentField, setCurrentField] = useState<'dni' | 'cuil'>(
    getValues('demandado.cuil') === getValues('demandado.dni') ? 'dni' : 'cuil'
  )
  const [isSearching, setIsSearching] = useState(false)
  const [documentFound, setDocumentFound] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [warningMessage, setWarningMessage] = useState('')
  const [autoCompletedFields, setAutoCompletedFields] = useState<string[]>([])
  const [accordionOpen, setAccordionOpen] = useState<string>('')
  const previousValue = useRef('')

  // Cuando cambian los props de DNI/CUIL reiniciamos estado
  useEffect(() => {
    const newField = getValues('demandado.cuil') === getValues('demandado.dni') ? 'dni' : 'cuil'
    setCurrentField(newField)
    previousValue.current = ''
    setDocumentFound(false)
    setAutoCompletedFields([])
    setShowWarning(false)
  }, [watch('demandado.dni'), watch('demandado.cuil')])

  const handleSearchByDocumento = async () => {
    const fieldName = currentField === 'dni' ? 'demandado.dni' : 'demandado.cuil'
    const rawValue = getValues(fieldName)
    const docValue = (rawValue ?? '').trim()
    console.log('Buscando documento:', docValue)
    // validación cliente
    const { valid, error } = validateDocument(currentField, docValue)
    if (!valid) {
      setShowWarning(true)
      setWarningMessage(error!)
      setDocumentFound(false)
      return
    }
    if (docValue === previousValue.current && documentFound) return
    previousValue.current = docValue

    setIsSearching(true)
    setShowWarning(false)
    setDocumentFound(false)
    setAutoCompletedFields([])

    try {
      const data = await buscarDemandado(docValue, currentField)
      if (data) {
        setValue('demandado.apellido', data.apellido)
        setValue('demandado.nombre', data.nombre)
        setValue('demandado.nombreCompleto', data.apellidoYNombre)
        setValue('demandado.domicilio', data.domicilio)
        setAutoCompletedFields(['apellido', 'nombre', 'nombreCompleto', 'domicilio'])
        setAccordionOpen('auto-completed')
        setDocumentFound(true)
      } else {
        // si falla CUIL, cambio a DNI
        if (currentField === 'cuil') {
          setCurrentField('dni')
          setWarningMessage(
            'CUIL no encontrado. Cambié a DNI, verifica el número y vuelve a buscar.'
          )
        } else {
          setWarningMessage('Documento no encontrado.')
        }
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
      {showWarning && (
        <Alert variant="destructive" className="text-red-600 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" color="#dc2626 " />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{warningMessage}</AlertDescription>
        </Alert>
      )}

      <FormField
        name={`demandado.${currentField}`}
        control={control}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{currentField === 'dni' ? 'DNI' : 'CUIL / CUIT'}</FormLabel>
            <div className="flex items-center gap-2">
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? ''}
                  className={cn(documentFound && 'border-green-500 focus:ring-green-500')}
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
                  isSearching || (field.value ?? '').length < (currentField === 'dni' ? 7 : 10)
                }
              >
                {isSearching ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors[currentField] && <FormMessage>{errors[currentField]?.message}</FormMessage>}
          </FormItem>
        )}
      />

      {/* Auto-completados dentro de un Accordion */}
      {autoCompletedFields.length > 0 && (
        <Accordion
          type="single"
          collapsible
          value={accordionOpen}
          onValueChange={(v) => setAccordionOpen(v || '')}
        >
          <AccordionItem value="auto-completed">
            <AccordionTrigger>
              <div className="text-green-600 text-sm flex items-center font-semibold">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Datos autocompletados
              </div>
            </AccordionTrigger>
            <AccordionContent className="grid grid-cols-2 md:grid-cols-2 gap-4">
              {(['apellido', 'nombre', 'nombreCompleto', 'domicilio'] as const).map((key) => (
                <FormField
                  key={key}
                  name={`demandado.${key}`}
                  control={control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {key === 'nombreCompleto'
                          ? 'Nombre completo'
                          : key.charAt(0).toUpperCase() + key.slice(1)}
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className={cn(
                            autoCompletedFields.includes(key) && 'border-green-200 bg-green-50'
                          )}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}

      {/* Si no hay autocompletados, dejo que el usuario escriba manual */}
      {autoCompletedFields.length === 0 && (
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
          {(['apellido', 'nombre', 'nombreCompleto', 'domicilio'] as const).map((key) => (
            <FormField
              key={key}
              name={`demandado.${key}`}
              control={control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {key === 'nombreCompleto'
                      ? 'Nombre completo'
                      : key.charAt(0).toUpperCase() + key.slice(1)}
                  </FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
