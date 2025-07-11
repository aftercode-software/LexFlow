import { Demandado, DocField } from '@shared/interfaces/demandado'
import { toast } from 'sonner'

const specialCharsRegex = /[|°&?!@#$%^*()_+\-=[\]{};':"\\,.<>/?]/

export function hasInvalidChars(value: string): boolean {
  return specialCharsRegex.test(value)
}

export function isLengthValid(field: DocField, value: string): boolean {
  if (field === 'dni') {
    return value.length >= 7
  } else {
    return value.length >= 10
  }
}

export function validateDocument(
  field: DocField,
  value: string
): { valid: boolean; error?: string } {
  if (hasInvalidChars(value)) {
    return {
      valid: false,
      error: `${field.toUpperCase()} contiene caracteres especiales.`
    }
  }
  console.log('Validando longitud:', field, value)
  if (!isLengthValid(field, value)) {
    return {
      valid: false,
      error:
        field === 'dni'
          ? 'El DNI debe tener al menos 7 dígitos.'
          : 'El CUIL debe tener al menos 10 dígitos.'
    }
  }
  return { valid: true }
}

export async function buscarDemandado(valor: string, field: DocField): Promise<Demandado | null> {
  const doc = valor.trim()
  if (!doc) {
    throw new Error('El documento está vacío.')
  }

  const { valid, error } = validateDocument(field, doc)
  if (!valid) {
    throw new Error(error)
  }

  try {
    const response = await window.api.searchDemandado(doc)
    console.log('Response from searchDemandado:', response)

    if (response?.status === 404) {
      toast.warning('Demandado no encontrado')
      return null
    }

    if (response.ok) {
      toast.success('Demandado encontrado')
      return {
        id: response.data.id,
        apellido: response.data.apellido,
        nombre: response.data.nombre,
        apellidoYNombre: response.data.apellidoYNombre,
        domicilioTipo: response.data.domicilioTipo,
        domicilio: response.data.domicilio
      }
    }

    return null
  } catch {
    toast.error('Error al buscar demandado')
    return null
  }
}
