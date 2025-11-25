import sharp from 'sharp'
import { cleanSpaces, normalizeOCR, parseMontoMixto, upperNoAccents } from './helpers'

interface CropConfig {
  x: number
  y: number
  w: number
  h: number
}

export function cropImageCedula(
  imageToCrop: Buffer<ArrayBufferLike>,
  x: number,
  y: number,
  width: number,
  height: number
): Promise<Buffer<ArrayBufferLike>> {
  const image = sharp(imageToCrop)
  return image.extract({ left: x, top: y, width, height }).toBuffer()
}

export async function cropImage(imageBuffer: Buffer, config: CropConfig): Promise<Buffer> {
  const image = sharp(imageBuffer)
  const metadata = await image.metadata()

  if (!metadata.width || !metadata.height) {
    throw new Error('No se pudieron leer las dimensiones de la imagen')
  }

  const fullW = metadata.width
  const fullH = metadata.height

  const left = Math.floor(fullW * config.x)
  const top = Math.floor(fullH * config.y)
  let width = Math.floor(fullW * config.w)
  let height = Math.floor(fullH * config.h)

  if (left + width > fullW) width = fullW - left
  if (top + height > fullH) height = fullH - top

  return image
    .extract({ left, top, width, height })

    .grayscale()
    .normalize()
    .threshold(160)

    .resize({
      width: width * 2,
      kernel: sharp.kernel.lanczos3
    })
    .sharpen()

    .toBuffer()
}

export async function recortarCuartoDerecho(lastPage: Buffer<ArrayBufferLike>) {
  const metadata = await sharp(lastPage).metadata()

  if (!metadata.width || !metadata.height) {
    throw new Error('No se pudieron leer las dimensiones de la imagen')
  }

  const fullWidth = metadata.width
  const fullHeight = metadata.height

  const cropWidth = Math.round(fullWidth / 4)
  const cropLeft = fullWidth - cropWidth

  const cropHeight = Math.round(fullHeight / 1.2)

  const cropTop = fullHeight - cropHeight

  console.log(`Recortando en: x=${cropLeft}, y=${cropTop}, w=${cropWidth}, h=${cropHeight}`)

  const montoImg = await cropImageCedula(lastPage, cropLeft, cropTop, cropWidth, cropHeight)

  return montoImg
}

export function extraerBoletaCSM(texto: string, minLen = 10, maxLen = 18): string | null {
  if (!texto) return null

  const norm = normalizeOCR(texto)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  const candidatos: string[] = []

  const fix = (raw: string) =>
    raw
      .replace(/[OQD]/gi, '0')
      .replace(/[S]/gi, '5')
      .replace(/[Il|]/g, '1')
      .replace(/[B]/g, '8')
      .replace(/\s+/g, '')
      .replace(/[^\d]/g, '')

  const pushIfOk = (n: string) => {
    const fijo = fix(n)
    if (fijo.length >= minLen && fijo.length <= maxLen) candidatos.push(fijo)
  }

  {
    const rxContexto =
      /(boleta\s*de\s*deuda|resoluci\w*n\s*n[º°*:\-"]?)\s*[/\-:\s]*\s*(atm)?\s*([0-9OQDSIl|B]{8,24})/gi

    for (const m of norm.matchAll(rxContexto)) {
      pushIfOk(m[3])
    }
  }

  if (candidatos.length === 0) {
    const rxATM = /\batm\s*([0-9OQDSIl|B]{8,24})\b/gi
    for (const m of norm.matchAll(rxATM)) pushIfOk(m[1])
  }

  if (candidatos.length === 0) {
    const rxClasico = /boleta\s*n?[°º*:\-"]?\s*([0-9OQDSIl|B\s]{6,24})/gi
    for (const m of norm.matchAll(rxClasico)) pushIfOk(m[1] ?? '')
  }

  if (candidatos.length === 0) {
    const rxSoloNum = /\b20[0-9OQDSIl|B]{10,16}\b/gi
    for (const m of norm.matchAll(rxSoloNum)) pushIfOk(m[0])
  }

  if (candidatos.length === 0) {
    const rxLargos = /\b[0-9]{10,24}\b/g
    for (const m of norm.matchAll(rxLargos)) {
      const tok = m[0]
      if (/^20[0-9]{9,23}$/.test(tok)) pushIfOk(tok)
    }
  }

  if (!candidatos.length) return null

  candidatos.sort((a, b) => {
    if (b.length !== a.length) return b.length - a.length
    const ap = /^20/.test(a) ? 1 : 0
    const bp = /^20/.test(b) ? 1 : 0
    return bp - ap
  })

  return candidatos[0]
}

export function extraerBoleta(texto: string): string | null {
  if (!texto) return null
  const norm = normalizeOCR(texto)

  const rx = /BOLETA\s*N?[°º*:\-"]?\s*([0-9OQDSIl|B]{10,18})(?!\S)/i
  const m = norm.match(rx)

  const clean = (s: string) =>
    s.replace(/[OQD]/g, '0').replace(/[S]/g, '5').replace(/[Il|]/g, '1').replace(/[B]/g, '8')

  if (m?.[1]) {
    let fijo = clean(m[1])

    if (fijo.length > 13 && fijo.startsWith('20')) fijo = fijo.slice(0, 13)
    if (fijo.length >= 10 && fijo.length <= 14) return fijo
  }

  const m2 = norm.match(/\b20[0-9OQDSIl|B]{10,13}\b/)
  if (m2) {
    let fijo = clean(m2[0])
    if (fijo.length > 13) fijo = fijo.slice(0, 13)
    return fijo
  }

  return null
}

const NUM_PATTERN = String.raw`\b(?:\d+(?:[.,]\s?\d{3})+|\d+)(?:[.,]\s?\d{1,2})?\b`

function esPlausibleNumero(tok: string): boolean {
  const hasSep = /[.,]/.test(tok)
  const digits = tok.replace(/[^\d]/g, '')
  return hasSep || digits.length >= 4
}

const SON_PESOS_RE = /\bS[O0]N\s+.{0,15}\bP[A-Z]{0,4}S[O0]S?\b/i

const TOTAL_RE = /(?<!SUB\s*)T[O0]T[AI1]L\b/i

const CENTAVOS_RE = /\bC(?:E|É|3|A)NTA[A-Z]{0,4}S\b/i

export function extraerMonto(texto: string): number | null {
  if (!texto) return null

  const t = cleanSpaces(normalizeOCR(texto))

  const mSon = SON_PESOS_RE.exec(t)
  const mCentavos = CENTAVOS_RE.exec(t)

  let endIdx = Infinity
  if (mSon) endIdx = mSon.index
  if (mCentavos && mCentavos.index < endIdx) {
    endIdx = mCentavos.index
  }

  if (endIdx === Infinity) {
    const mSonLax = /S[O0]N\s+P(?:E|É|3|A)S[O0]S?\s*:?/i.exec(t)
    if (mSonLax) endIdx = mSonLax.index
    else return null
  }

  let totalMatch: RegExpExecArray | null = null
  const re = new RegExp(TOTAL_RE, TOTAL_RE.flags + 'g')
  let m: RegExpExecArray | null
  while ((m = re.exec(t)) !== null) {
    if (m.index < endIdx) {
      totalMatch = m
    } else {
      break
    }
  }

  if (!totalMatch) return null

  const start = totalMatch.index + totalMatch[0].length
  const win = t.slice(start, endIdx)

  const toks = win.match(new RegExp(NUM_PATTERN, 'g')) || []

  const numerosPlausibles = toks
    .filter(esPlausibleNumero)
    .map(parseMontoMixto)
    .filter((n): n is number => n != null && n > 0)

  if (numerosPlausibles.length === 0) return null

  return Math.max(...numerosPlausibles)
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

function fixDigits(s: string): string {
  return s.replace(/[OQD]/g, '0').replace(/[Il|]/g, '1').replace(/S/g, '5').replace(/B/g, '8')
}

export function extraerDocumento(texto: string | null): Documento {
  if (!texto) return { tipo: 'DNI', valor: '' }

  const norm = normalizeOCR(texto)

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

  const clean = normalizeOCR(mediaTxt)

  const startPattern = /EMPLAZAR.{0,3}\s+/i
  const endPattern = /\s+(?:DOMICILIO|NATURALEZA|OBJETO|FECHA)/i

  const startMatch = clean.match(startPattern)
  if (!startMatch) return ''

  let bloque = clean.slice(startMatch.index! + startMatch[0].length)

  const endMatch = bloque.match(endPattern)
  if (endMatch) {
    bloque = bloque.slice(0, endMatch.index)
  }

  const cuitRegex = /(?:^|[\s\D])1?(?:20|23|24|27|30|33|34)[\s.\-]*\d{7,8}[\s.\-]*\d/

  const matchCuit = bloque.match(cuitRegex)

  let nombre = ''

  if (matchCuit) {
    const indexEndCuit = (matchCuit.index || 0) + matchCuit[0].length
    nombre = bloque.slice(indexEndCuit)

    // Limpieza inicial de prefijos sucios (- QUIMAN)
    nombre = nombre.replace(/^[\s\-\.–|]+/, '').trim()
  } else {
    // Fallback
    nombre = bloque.replace(/^[\d\-\.\s]+/, '').trim()
  }

  // --- CORRECCIÓN FINAL DE BASURA (. se) ---
  // Elimina cualquier secuencia al final que empiece con punto o simbolo
  // y siga con minúsculas o cosas que no son letras mayúsculas de nombres
  return nombre
    .replace(/\s*[\.,]\s*[a-z].*$/i, '') // Elimina ". se"
    .replace(/[^A-Z0-9ÁÉÍÓÚÜÑ\s\.]+$/i, '') // Elimina símbolos raros al final
    .trim()
}

export function extraerDomicilio(texto: string): string {
  if (!texto) return ''
  const raw = normalizeOCR(texto)

  // 1. Encontrar dónde empieza
  const lineRe = /DOMICILIO[^\n]*/i
  const lineMatch = lineRe.exec(raw)
  if (!lineMatch) return ''

  // Tomamos desde DOMICILIO en adelante (sin cortar por salto de linea aun)
  let s = raw.slice(lineMatch.index).replace(/DOMICILIO\b\s*[:|-]?\s*/i, '')

  // 2. STOP WORDS (Corte duro si encuentra el siguiente campo)
  const stops = [
    /\bNATURALEZA\b/i,
    /\bOBJETO\b/i,
    /\bEMISION\b/i,
    /\bFECHA\b/i,
    /\bEXPTE\b/i,
    /\bHOJA\b/i,
    /\bCUIT\b/i,
    /\bDNI\b/i
  ]
  for (const r of stops) {
    const i = s.search(r)
    if (i >= 0) s = s.slice(0, i)
  }

  // 3. LIMPIEZA DE INICIO (El problema del "A CERRO NEGRO")
  // Elimina caracteres sueltos (letras o simbolos) al inicio seguidos de espacio
  // Ej: "A " o "- " o "| "
  s = s.replace(/^[\W_]*[A-Z]?\s+(?=[A-Z0-9])/i, '')

  // 4. LIMPIEZA DE FINAL (El problema de "peines aun...")
  // Buscamos el ancla geográfica final. Casi siempre termina en "MENDOZA".
  // Buscamos "PROVINCIA DE MENDOZA" o solo "MENDOZA" al final de la dirección
  const anclaMendoza = /(PROVINCIA\s+DE\s+MENDOZA|MENDOZA)/i
  const matchMendoza = s.match(anclaMendoza)

  if (matchMendoza) {
    // Cortamos JUSTO después de que termina la palabra Mendoza
    const finIndex = matchMendoza.index! + matchMendoza[0].length
    s = s.slice(0, finIndex)
  }

  // Limpieza cosmética final
  s = s
    .replace(/[|]/g, ' ')
    .replace(/\s-\s/g, ' - ')
    .replace(/[.,](?=\s|$)/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()

  // Fix común: "CAPITAL CAPITAL" -> "CAPITAL"
  s = s.replace(/\b(CAPITAL)\s+\1\b/gi, '$1')

  return s
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

type ObjetoPick = {
  todos: string[]
  mejor: string | null
}

function normalizeObjetoToken(
  raw: string,
  opts: { mode?: 'alnum' | 'numeric'; min?: number; max?: number } = {}
): string | null {
  const mode = opts.mode ?? 'alnum'
  const min = opts.min ?? 5
  const max = opts.max ?? 16
  if (!raw) return null
  let t = fixDigits(upperNoAccents(raw)).replace(/[^A-Z0-9]/g, '')
  if (!t) return null
  if (mode === 'numeric') t = t.replace(/\D/g, '')
  if (t.length < min || t.length > max) return null
  if (mode === 'alnum' && (!/[A-Z]/.test(t) || !/\d/.test(t))) return null
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

export function extraerObjetos(texto: string): ObjetoPick {
  const todos: string[] = []
  if (!texto) return { todos, mejor: null }

  const raw = normalizeOCR(texto)
  const T = upperNoAccents(raw)

  {
    const re = /OBJETO[^\n]*\n([\s\S]{0,600})/i
    const m = re.exec(T)
    if (m) {
      const bloque = m[1].split(/\r?\n/).slice(0, 10)
      for (const line of bloque) {
        const cand = line.match(/\b([A-Z0-9]{5,16})\b/g) || []
        for (const c of cand) {
          const normNum = normalizeObjetoToken(c, { mode: 'numeric' })
          const normAln = normalizeObjetoToken(c, { mode: 'alnum' })
          if (normNum) todos.push(normNum)
          else if (normAln) todos.push(normAln)
        }
      }
    }
  }

  {
    const re = /\bEMISION(?:\s+MASIVA)?[^\n]*?\b([A-Z0-9]{5,16})\b/gi
    let m: RegExpExecArray | null
    while ((m = re.exec(T))) {
      const c = m[1]
      const normNum = normalizeObjetoToken(c, { mode: 'numeric' })
      const normAln = normalizeObjetoToken(c, { mode: 'alnum' })
      if (normNum) todos.push(normNum)
      else if (normAln) todos.push(normAln)
    }
  }

  {
    const re = /\b(?:N|N[°º*]|NRO|NUM(?:ERO)?)\s*[:=-]?\s*([A-Z0-9]{5,16})\b/gi
    let m: RegExpExecArray | null
    while ((m = re.exec(T))) {
      const c = m[1]
      const normNum = normalizeObjetoToken(c, { mode: 'numeric' })
      const normAln = normalizeObjetoToken(c, { mode: 'alnum' })
      if (normNum) todos.push(normNum)
      else if (normAln) todos.push(normAln)
    }
  }

  {
    const near =
      /(PATENTE|AUTOMOTOR|INMOBILIARIO|INGRESOS\s+BRUTOS|SELLO|MULTAS?)[\s\S]{0,60}\b([A-Z0-9]{5,16})\b/gi
    let m: RegExpExecArray | null
    while ((m = near.exec(T))) {
      const c = m[2]
      const normNum = normalizeObjetoToken(c, {
        mode: /INMOBILIAR/.test(m[1]) ? 'numeric' : 'alnum'
      })
      if (normNum) todos.push(normNum)
    }
  }

  const normTodos = todos.filter(Boolean)
  const mejor = pickMostFrequent(normTodos)

  return { todos: Array.from(new Set(normTodos)), mejor }
}

export function extraerObjeto(texto: string): string | null {
  return extraerObjetos(texto).mejor
}
