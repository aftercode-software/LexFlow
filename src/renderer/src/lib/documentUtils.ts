export type DocField = 'dni' | 'cuil' | 'cuit'

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

export type Demandado = {
  id: string
  apellido: string
  nombre: string
  apellidoYNombre: string
  domicilio: string
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

  const response = await window.api.searchDemandado(doc)
  console.log('Response from searchDemandado:', response)
  if (!response?.id) {
    return null
  }

  return {
    id: response.id,
    apellido: response.apellido,
    nombre: response.nombre,
    apellidoYNombre: response.apellidoYNombre,
    domicilio: response.domicilio
  }
}

export function numeroALetras(n: number): string {
  console.log('Numero', n, typeof n)
  if (!Number.isFinite(n) || n < 0 || n > 999_999_999) {
    throw new RangeError('El número debe ser un entero positivo menor que 1 000 000 000')
  }
  if (n === 0) return 'Cero'

  const entero = Math.floor(n)
  const centavos = Math.round((n - entero) * 100)

  const unidades = [
    'cero',
    'uno',
    'dos',
    'tres',
    'cuatro',
    'cinco',
    'seis',
    'siete',
    'ocho',
    'nueve',
    'diez',
    'once',
    'doce',
    'trece',
    'catorce',
    'quince',
    'dieciseis',
    'diecisiete',
    'dieciocho',
    'diecinueve',
    'veinte',
    'veintiuno',
    'veintidos',
    'veintitres',
    'veinticuatro',
    'veinticinco',
    'veintiseis',
    'veintisiete',
    'veintiocho',
    'veintinueve'
  ]

  const decenas = ['treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa']

  const centenas = [
    'ciento',
    'doscientos',
    'trescientos',
    'cuatrocientos',
    'quinientos',
    'seiscientos',
    'setecientos',
    'ochocientos',
    'novecientos'
  ]

  const bloqueATexto = (num: number, needUn = false): string => {
    let texto = ''

    if (num === 0) return ''

    if (num < 30) {
      texto = unidades[num]
    } else if (num < 100) {
      const d = Math.floor(num / 10)
      const u = num % 10
      texto = decenas[d - 3] + (u ? ' y ' + unidades[u] : '')
    } else {
      const c = Math.floor(num / 100)
      const resto = num % 100
      if (c === 1 && resto === 0) {
        texto = 'cien'
      } else {
        texto = centenas[c - 1] + (resto ? ' ' + bloqueATexto(resto) : '')
      }
    }

    if (needUn) {
      texto = texto
        .replace(/uno$/, 'un')
        .replace(/veintiuno$/, 'veintiun')
        .replace(/ y uno$/, ' y un')
    }
    return texto
  }

  const millones = Math.floor(entero / 1_000_000)
  const miles = Math.floor((entero % 1_000_000) / 1_000)
  const cientos = entero % 1_000

  const partes: string[] = []

  if (millones) {
    const txtMillones = bloqueATexto(millones, true)
    partes.push(txtMillones + (millones === 1 ? ' millon' : ' millones'))
  }

  if (miles) {
    const txtMiles = bloqueATexto(miles, true)
    partes.push((miles === 1 ? '' : txtMiles + ' ') + 'mil')
  }

  if (cientos) {
    partes.push(bloqueATexto(cientos))
  }

  let frase = partes.join(' ').replace(/\s+/g, ' ').trim()

  if (centavos > 0) {
    const centavosTexto = bloqueATexto(centavos)
    frase += ` con ${centavosTexto} centavos`
  }

  return frase.charAt(0).toUpperCase() + frase.slice(1)
}
