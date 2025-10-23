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

export function extraerBoleta(texto: string, minLen = 8, maxLen = 18): string | null {
  if (!texto) return null

  const norm = normalizarOCR(texto)

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

function parseMontoMixto(raw: string): number | null {
  if (!raw) return null

  const looksNumeric = /^[\dOISl.,]+$/.test(raw)
  const token = looksNumeric ? raw.replace(/O/g, '0').replace(/[Il]/g, '1').replace(/S/g, '5') : raw

  const s = token.replace(/[^\d.,]/g, '')
  if (!s) return null

  if (!/[.,]/.test(s)) {
    const n = Number(s)
    return Number.isFinite(n) ? n : null
  }

  const lastComma = s.lastIndexOf(',')
  const lastDot = s.lastIndexOf('.')

  const pickAsDecimal = (idx: number) =>
    idx >= 0 && s.length - idx - 1 === 2 && /^\d{2}$/.test(s.slice(idx + 1))

  let decimalIdx = -1

  if (pickAsDecimal(lastComma)) decimalIdx = lastComma
  else if (pickAsDecimal(lastDot)) decimalIdx = lastDot
  else decimalIdx = Math.max(lastComma, lastDot)

  if (decimalIdx >= 0) {
    const entero = s.slice(0, decimalIdx).replace(/[.,]/g, '')
    const dec = s.slice(decimalIdx + 1).replace(/[^\d]/g, '')
    const normalized = `${entero}.${dec}`
    const n = Number(normalized)
    return Number.isFinite(n) ? n : null
  }

  const n = Number(s.replace(/[.,]/g, ''))
  return Number.isFinite(n) ? n : null
}

function esPlausibleNumero(str: string): boolean {
  const hasSep = /[.,]/.test(str)
  const digits = str.replace(/[^\d]/g, '')
  return hasSep || digits.length >= 4
}

const NUM_PATTERN = String.raw`(\d{1,3}(?:[.,]\d{3})+(?:[.,]\d{2})?|\d{4,}(?:[.,]\d{2})?|\d{1,3}[.,]\d{2})`

const TOTAL_TOKEN = String.raw`(S\s*U\s*B\s*)?T[0O]T[AI1]L\b`

export function extraerMonto(texto: string): number | null {
  if (!texto) return null

  const t = texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\S\r\n]+/g, ' ')
    .trim()

  const candidatos: number[] = []

  const lineas = t
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
  for (const linea of lineas) {
    const mTot = new RegExp(TOTAL_TOKEN, 'i').exec(linea)
    if (!mTot) continue
    const precedidaPorSUB = !!mTot[1]
    if (precedidaPorSUB) continue

    const numeros = linea.match(new RegExp(NUM_PATTERN, 'g')) || []
    for (let i = numeros.length - 1; i >= 0; i--) {
      const tok = numeros[i]
      if (!esPlausibleNumero(tok)) continue
      const n = parseMontoMixto(tok)
      if (n !== null) {
        candidatos.push(n)
        break
      }
    }
  }

  {
    const reVentana = new RegExp(TOTAL_TOKEN + String.raw`[\s\S]{0,200}?` + NUM_PATTERN, 'gi')
    let m: RegExpExecArray | null
    while ((m = reVentana.exec(t))) {
      const precedidaPorSUB = !!m[1]
      if (precedidaPorSUB) continue
      const tok = m[2]
      if (!tok || !esPlausibleNumero(tok)) continue
      const n = parseMontoMixto(tok)
      if (n !== null) candidatos.push(n)
    }
  }

  if (candidatos.length) {
    return Math.max(...candidatos)
  }

  const m = t.match(new RegExp(NUM_PATTERN, 'g')) || []
  const nums = m
    .filter(esPlausibleNumero)
    .map(parseMontoMixto)
    .filter((x): x is number => x !== null)
  if (nums.length) return Math.max(...nums)

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

type Documento = { tipo: 'CUIT' | 'DNI'; valor: string }

function normalizarOCR(s: string) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[\u2013\u2014\u2212–—]/g, '-')
    .replace(/[“”«»]/g, '"')
    .toUpperCase()
}

function fixDigits(s: string): string {
  return s.replace(/[OQD]/g, '0').replace(/[Il|]/g, '1').replace(/S/g, '5').replace(/B/g, '8')
}

export function extraerDocumento(texto: string | null): Documento {
  if (!texto) return { tipo: 'DNI', valor: '' }

  const norm = normalizarOCR(texto)

  const DIG = `[0-9OQDSIl|B]`
  const NON = `[^0-9OQDSIl|B]{0,3}`
  const cuitFuzzy = new RegExp(`\\b(20|23|24|27|30|33)(${NON}${DIG}){9}\\b`, 'g')

  type Hit = { raw: string; start: number; fixed: string }
  const hits: Hit[] = []
  for (const m of norm.matchAll(cuitFuzzy)) {
    const raw = m[0]
    const start = m.index ?? 0
    const fixed = fixDigits(raw).replace(/\D+/g, '')
    if (fixed.length === 11) hits.push({ raw, start, fixed })
  }

  if (hits.length) {
    const emIdx = norm.search(/EMPLAZA/)
    if (emIdx >= 0) {
      hits.sort((a, b) => Math.abs(a.start - emIdx) - Math.abs(b.start - emIdx))
    } else {
      hits.sort((a, b) => a.start - b.start)
    }
    return { tipo: 'CUIT', valor: hits[0].fixed }
  }

  const dniMatch = norm.match(new RegExp(`\\b${DIG}{7,8}\\b`, 'g'))
  if (dniMatch?.length) {
    const fixed = fixDigits(dniMatch[0]).replace(/\D+/g, '')
    if (fixed.length >= 7 && fixed.length <= 8) {
      return { tipo: 'DNI', valor: fixed }
    }
  }

  return { tipo: 'DNI', valor: '' }
}

export function extraerNombreEmplazado(mediaTxt: string): string {
  if (!mediaTxt) return ''
  const t = normalizarOCR(mediaTxt)

  const inicio = t.search(/E[MN]?[A-Z]{0,2}PLAZA(?:RA)?/)
  if (inicio === -1) return ''
  const frag = t.slice(inicio)

  const corte = frag.search(/\b(DOMICILIO|NATURALEZA|EXPTE|HOJA)\b/)
  const bloque = (corte >= 0 ? frag.slice(0, corte) : frag).replace(/\s+/g, ' ')

  let m = bloque.match(/-\s*([A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑ\s\.]{3,}?)(?=\s*[:;,.\-]|$)/i)
  if (m?.[1]) {
    return m[1].replace(/[.,]/g, '').replace(/\s+/g, ' ').trim()
  }

  m = bloque.match(
    /\b(20|23|24|27|30|33)\s*[-–]?\s*\d{7,8}\s*[-–]?\s*\d\s*[-–]\s*([A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑ\s\.]{3,})/i
  )
  if (m?.[2]) {
    return m[2].replace(/[.,]/g, '').replace(/\s+/g, ' ').trim()
  }

  return ''
}

export function extraerDomicilio(texto: string): string {
  if (!texto) return ''

  const t = texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/\s+/g, ' ')

  const regex = /\b[SD]OM[I1]C[I1]L[I1]O\b\s*(?:EN\s*)?([\s\S]+?)(?=\s+\bPROVINCIA\b|$)/i

  const match = t.match(regex)
  if (!match?.[1]) return ''

  return match[1]
    .replace(/[\n\r]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/[.,]/g, ' ')
    .trim()
}

export function extraerSecuencia(texto: string): string | null {
  if (!texto) return null

  const t = texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\S\r\n]+/g, ' ')
    .trim()

  const LABEL = String.raw`S\s*E\s*C(?:\s*U\s*E\s*N\s*C\s*I\s*A)?\.?`

  const NUM_CON_ESPACIOS = String.raw`\d(?:\s?\d){2,}`

  const re = new RegExp(
    LABEL + String.raw`\s*[:=\-–—]*\s*(` + NUM_CON_ESPACIOS + String.raw`)`,
    'gi'
  )

  let m: RegExpExecArray | null
  let ultimo: string | null = null

  while ((m = re.exec(t))) {
    const crudo = m[1]
    const soloDigitos = crudo.replace(/\D/g, '')
    if (soloDigitos.length >= 3) {
      ultimo = soloDigitos
    }
  }

  return ultimo
}

function normalizeObjetoToken(raw: string): string | null {
  if (!raw) return null

  let t = raw
    .toUpperCase()
    .replace(/^[`'"]/g, '')
    .replace(/[^A-Z0-9]/g, '')

  if (!t) return null

  t = t.replace(/^O(?=[A-Z0-9])/, '0').replace(/(?<=\d)O(?=\d)/g, '0')

  t = t.replace(/S/g, '5').replace(/[IL]/g, '1').replace(/Z/g, '2')

  if (/^ON[A-Z0-9]/.test(t)) t = '0' + t.slice(2)

  if (t.length < 7 || t.length > 10) return null
  if (!/[A-Z]/.test(t) || !/\d/.test(t)) return null

  if (!t.startsWith('0') && t.startsWith('O')) t = '0' + t.slice(1)

  return t
}

function pickMostFrequent(cands: string[]): string | null {
  if (!cands.length) return null
  const freq = new Map<string, number>()
  for (const c of cands) freq.set(c, (freq.get(c) ?? 0) + 1)
  let best = '',
    bestCount = -1
  for (const [tok, count] of freq) {
    if (count > bestCount || (count === bestCount && tok.length > best.length)) {
      best = tok
      bestCount = count
    }
  }
  return best || null
}

export function extraerObjeto(texto: string): string | null {
  if (!texto) return null

  const t = texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()

  const candidatos: string[] = []

  {
    const re = /EMISI[O0]N\s+PATENTE\s+([A-Z0-9]{5,16})\b/g
    let m: RegExpExecArray | null
    while ((m = re.exec(t))) {
      const norm = normalizeObjetoToken(m[1])
      if (norm) candidatos.push(norm)
    }
  }

  {
    const re = /\bOBJET[O0]\b\s*[:\-]?\s*([A-Z0-9]{5,16})\b/g
    let m: RegExpExecArray | null
    while ((m = re.exec(t))) {
      const norm = normalizeObjetoToken(m[1])
      if (norm) candidatos.push(norm)
    }
  }

  {
    const keys = [
      String.raw`AUT[O0]M[O0]T[O0]R\s+PATENTE`,
      String.raw`INGRES[O0]S?\s+BRUT[O0]S?`,
      String.raw`INM[O0]BILIAR[I1][O0]\s+PADR[O0]N`,
      String.raw`TASA\s+DE\s+JUSTICIA\s+AUT[O0]S?`,
      String.raw`MULTAS?`,
      String.raw`SELLO`
    ]
    const afterN = String.raw`(?:N|N[°*º°]|NRO|NUM(?:ERO)?)?\s*[:=\-]?\s*([A-Z0-9]{5,16})\b`
    for (const k of keys) {
      const re = new RegExp(k + String.raw`\s+` + afterN, 'g')
      let m: RegExpExecArray | null
      while ((m = re.exec(t))) {
        const norm = normalizeObjetoToken(m[1])
        if (norm) candidatos.push(norm)
      }
    }
  }

  if (candidatos.length === 0) {
    const near = /(?:EMISI[O0]N|PATENTE|OBJET[O0])[\s\S]{0,40}\b([A-Z0-9]{7,12})\b/g
    let m: RegExpExecArray | null
    while ((m = near.exec(t))) {
      const norm = normalizeObjetoToken(m[1])
      if (norm) candidatos.push(norm)
    }
  }

  return pickMostFrequent(candidatos)
}
