import { app, safeStorage } from 'electron'
import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

export function cropImage(
  imageToCrop: Buffer<ArrayBufferLike>,
  x: number,
  y: number,
  width: number,
  height: number
) {
  const image = sharp(imageToCrop)
  return image.extract({ left: x, top: y, width, height }).toBuffer()
}

export function extraerBoleta(texto: string): string | null {
  const afterBoleta = texto.split(/Boleta/i)[1]
  if (!afterBoleta) return null

  const tokens = afterBoleta.split(/\s+/)

  for (const tok of tokens) {
    const limpio = tok.replace(/[^\p{L}\p{N}]/gu, '')
    if (limpio.length >= 4) return limpio.toUpperCase()
  }

  return null
}

export function extraerMonto(texto: string): number | null {
  const match = texto.match(/\d{1,3}(?:\.\d{3})*(?:,\d{2})?/)
  if (!match) return null

  const bruto = match[0]

  const normalizado = bruto.replace(/\./g, '').replace(',', '.')
  const valor = parseFloat(normalizado)

  return valor
}

export function numeroALetras(n: number): string {
  console.log('Numero', n)
  if (!Number.isFinite(n) || n < 0 || n > 999_999_999) {
    throw new RangeError('El número debe ser un entero positivo menor que 1 000 000 000')
  }
  if (n === 0) return 'Cero'

  // if n is float, round to integer. isFloat doesn't exist
  if (n % 1 !== 0) {
    n = Math.floor(n)
  }

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

  /**
   * Convierte un bloque de tres cifras (000-999) a palabras.
   * Si needUn es true, reemplaza “uno”→“un”, “veintiuno”→“veintiun”, “y uno”→“y un”.
   */
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

  const millones = Math.floor(n / 1_000_000)
  const miles = Math.floor((n % 1_000_000) / 1_000)
  const cientos = n % 1_000

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

  const frase = partes.join(' ').replace(/\s+/g, ' ').trim()
  return frase.charAt(0).toUpperCase() + frase.slice(1)
}

export async function getToken(): Promise<string | null> {
  const tokenFile = path.join(app.getPath('userData'), 'token.enc')
  const file = await fs.readFile(tokenFile)

  const token = safeStorage.isEncryptionAvailable()
    ? safeStorage.decryptString(file)
    : file.toString('utf8')

  return token
}
