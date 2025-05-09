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

export function extraerMonto(texto: string): { bruto: string; valor: number } | null {
  const match = texto.match(/\d{1,3}(?:\.\d{3})*(?:,\d{2})?/)
  if (!match) return null

  const bruto = match[0]

  const normalizado = bruto.replace(/\./g, '').replace(',', '.')
  const valor = parseFloat(normalizado)

  return { bruto, valor }
}
