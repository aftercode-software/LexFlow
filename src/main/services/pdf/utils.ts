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
  const ocurrencias = texto.matchAll(/Boleta/gi)
  const indices = Array.from(ocurrencias, (m) => m.index).filter((i) => i !== undefined)

  if (indices.length === 0) return null

  const indexElegido = indices.length > 1 ? indices[1]! : indices[0]!
  const fragmento = texto.slice(indexElegido, indexElegido + 50)
  const match = fragmento.match(/[A-Z]?\d{7,9}/i)

  return match ? match[0] : null
}

export function extraerMonto(texto: string): number | null {
  const matches = texto.match(/\d{1,3}(?:\.\d{3})*(?:,\d{2})/g)
  if (!matches || matches.length === 0) return null

  for (const monto of matches) {
    const normalizado = monto.replace(/\./g, '').replace(',', '.')
    const valor = parseFloat(normalizado)
    if (!isNaN(valor) && valor > 100) {
      return valor
    }
  }

  return null
}

export function extraerCUIJ(texto: string): string | null {
  const regex = /CUIJ\s*[^0-9]*([0-9]{1,2}-[0-9]{6,8}-[0-9])/i
  const match = texto.match(regex)
  return match ? match[1].trim() : null
}

export function extraerNumeroJuicio(texto: string): string | null {
  const regex = /Expte\.?\s*[^0-9]*\(?\s*([0-9]+-[0-9]+)\)?/i
  const match = texto.match(regex)
  if (match?.[1]) {
    const [, numero] = match[1].split('-')
    if (numero) {
      match[1] = numero
    }
  }
  return match ? match[1].trim() : null
}
