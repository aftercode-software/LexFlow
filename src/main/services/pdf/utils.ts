import sharp from 'sharp'

export function cropImage(
  imageToCrop: Buffer<ArrayBufferLike>,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<Buffer<ArrayBufferLike>> {
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
  const matches = texto.match(/\d{1,3}(?:\.\d{3})*(?:,\d{2})?/g)

  const monto = matches ? matches[matches.length - 1] : null
  if (!monto) return null

  const normalizado = monto.replace(/\./g, '').replace(',', '.')
  const valor = parseFloat(normalizado)

  return valor
}

interface Documento {
  tipo: 'DNI' | 'CUIL' | 'CUIT'
  valor: string
}

export function extraerDocumento(texto: string): Documento {
  console.log('No se encontró DNI o CUIT en el texto:', texto)
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
