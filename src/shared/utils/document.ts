import { Documento } from '../interfaces/demandado'

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

export function extraerDocumento(texto: string | null): Documento {
  if (!texto) return { tipo: 'DNI', valor: '' }
  const CUIT_REGEX = /(20|23|24|27|30|33)-?\d{8}-?\d/

  const matchCuit = texto.match(CUIT_REGEX)
  if (matchCuit) {
    const clean = matchCuit[0].replace(/-/g, '')

    const pref = parseInt(clean.slice(0, 2), 10)
    const tipo = [20, 23, 24, 27].includes(pref) ? 'CUIL' : 'CUIT'
    return { tipo, valor: clean }
  }

  const matchDni = texto.match(/\b\d{7,8}\b/)
  if (matchDni) {
    return { tipo: 'DNI', valor: matchDni[0] }
  }
  return { tipo: 'DNI', valor: '' }
}
