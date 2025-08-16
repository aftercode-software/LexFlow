import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { recaudadorSchema } from '@renderer/lib/schemas/forms.schemas'
import { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { z } from 'zod'

type Recaudador = z.infer<typeof recaudadorSchema>

interface FormValues {
  recaudador: Recaudador
}

export default function Recaudador() {
  const [recaudadores, setRecaudadores] = useState<Recaudador[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const { control } = useFormContext<FormValues>()

  useEffect(() => {
    const fetchRecaudadores = async () => {
      setIsLoading(true)
      try {
        const recaudadores = (await window.api.getRecaudadores()) as Recaudador[]
        console.log('Recaudadores obtenidos:', recaudadores)
        setRecaudadores(recaudadores)
      } catch (error) {
        console.error('Error al obtener recaudadores:', error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchRecaudadores()
  }, [])
  return (
    <div>
      <FormField
        control={control}
        name="recaudador"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Recaudador</FormLabel>
            <FormControl>
              <Select
                value={JSON.stringify(field.value)}
                onValueChange={(value) => field.onChange(JSON.parse(value))}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un recaudador" />
                </SelectTrigger>
                <SelectContent>
                  {recaudadores.map((recaudador) => (
                    <SelectItem key={recaudador.idNombre} value={JSON.stringify(recaudador)}>
                      {recaudador.idNombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  )
}
