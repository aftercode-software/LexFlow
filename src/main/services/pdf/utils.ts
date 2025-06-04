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
  const matches = texto.match(/\d{1,3}(?:\.\d{3})*(?:,\d{2})/g)
  if (!matches || matches.length === 0) return null

  for (const monto of matches) {
    const normalizado = monto.replace(/\./g, '').replace(',', '.')
    const valor = parseFloat(normalizado)
    if (!isNaN(valor) && valor > 100) {
      return valor // Se asume que el capital adeudado es un valor mayor a 100
    }
  }

  return null // Si no encuentra un valor razonable
}
