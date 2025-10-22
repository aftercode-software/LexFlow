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

/** Extrae el número de BOLETA de texto OCR ruidoso */
export function extraerBoleta(texto: string, minLen = 8, maxLen = 18): string | null {
  if (!texto) return null

  let norm = texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2013\u2014\u2212–—]/g, '-')
    .replace(/[“”"']/g, '"')
    .toUpperCase()

  const rx = /BOLETA\s*N?[°º*:\-"]?\s*([0-9OODSIl|B\s]{6,24})/g

  const candidatos: string[] = []
  for (const m of norm.matchAll(rx)) {
    const crudo = m[1] ?? ''
    const fijo = crudo
      .replace(/[OQD]/g, '0')
      .replace(/[S]/g, '5')
      .replace(/[Il|]/g, '1')
      .replace(/[B]/g, '8')
      .replace(/\s+/g, '')
      .replace(/[^\d]/g, '')

    if (fijo.length >= minLen && fijo.length <= maxLen) {
      candidatos.push(fijo)
    }
  }

  if (candidatos.length === 0) {
    const rxPos = /BOLETA/g
    let m: RegExpExecArray | null
    while ((m = rxPos.exec(norm))) {
      const frag = norm.slice(m.index, m.index + 60)
      const mNum = frag.match(/[0-9OODSIl|B\s]{6,24}/)
      if (mNum) {
        const fijo = mNum[0]
          .replace(/[OQD]/g, '0')
          .replace(/[S]/g, '5')
          .replace(/[Il|]/g, '1')
          .replace(/[B]/g, '8')
          .replace(/\s+/g, '')
          .replace(/[^\d]/g, '')
        if (fijo.length >= minLen && fijo.length <= maxLen) candidatos.push(fijo)
      }
    }
  }

  if (candidatos.length === 0) return null

  candidatos.sort((a, b) => b.length - a.length)
  return candidatos[0] || null
}

export function extraerMonto(texto: string): number | null {
  if (!texto) return null

  // Normalizar OCR
  const t = texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/O/g, '0')
    .replace(/I/g, '1')
    .replace(/S/g, '5')
    .replace(/[^\dA-Z.,:\n\s]/g, ' ')
    .replace(/\s+/g, ' ')

  // 1️⃣ Buscar líneas que contengan TOTAL o similar
  const totalRegex = /T[0O]T[AI1]L[^0-9]{0,10}([\d.,]{4,})/g
  const totales: number[] = []

  for (const m of t.matchAll(totalRegex)) {
    const monto = m[1]
    const normalizado = monto.replace(/\./g, '').replace(',', '.')
    const valor = parseFloat(normalizado)
    if (!isNaN(valor) && valor > 100) totales.push(valor)
  }

  // 2️⃣ Si hay algún "Total", tomamos el último (el más probable)
  if (totales.length > 0) return totales.at(-1)!

  // 3️⃣ Fallback: cualquier importe válido del texto (tu método original)
  const matches = t.match(/\d{1,3}(?:\.\d{3})*(?:,\d{2})/g)
  if (!matches) return null

  const posibles = matches
    .map((m) => parseFloat(m.replace(/\./g, '').replace(',', '.')))
    .filter((v) => !isNaN(v) && v > 100)

  if (posibles.length === 0) return null

  // Devuelve el mayor, ya que TOTAL suele ser el más alto
  return Math.max(...posibles)
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
