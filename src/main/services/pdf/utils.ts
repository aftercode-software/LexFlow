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

  // Si hay más de una aparición, usamos la segunda. Si solo hay una, usamos esa.
  const indexElegido = indices.length > 1 ? indices[1]! : indices[0]!

  // Tomamos un fragmento del texto a partir de la segunda aparición
  const fragmento = texto.slice(indexElegido, indexElegido + 50)

  // Buscamos un número de 7 a 9 cifras cerca de esa palabra
  const match = fragmento.match(/\d{7,9}/)

  return match ? match[0] : null
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
