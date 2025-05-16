import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { useAuth } from '@renderer/context/AuthContext'
import { recaudadorSchema } from '@renderer/lib/schemas/modulo-pdf.schema'
import React, { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { z } from 'zod'

/* 
{
        "id": 1,
        "nombre": "Gomez Torre Rodrigo",
        "matricula": 7714,
        "telefono": "2616521150",
        "celular": "2616521150",
        "organismo": "CAJA FORENSE",
        "descripcion": "CAP",
        "email": "ragomeztorre@gmail.com",
        "oficial": "BENINGAZA ESTELA"
    },

*/
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
                    <SelectItem key={recaudador.id} value={JSON.stringify(recaudador)}>
                      {recaudador.nombre}
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
