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

export function extraerBoletaCSM(texto: string, minLen = 10, maxLen = 18): string | null {
  if (!texto) return null

  const norm = normalizarOCR(texto)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // sin tildes
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

  // 0) PRIORIDAD: luego de “Boleta de deuda” / “Resolución n …”, tolerante a OCR y mojibake
  //   - capta opcional "ATM" y lo descarta (solo devuelve dígitos)
  //   - deja una ventana corta de caracteres de separación
  {
    const rxContexto =
      /(boleta\s*de\s*deuda|resoluci\w*n\s*n[º°*:\-"]?)\s*[/\-:\s]*\s*(atm)?\s*([0-9OQDSIl|B]{8,24})/gi

    for (const m of norm.matchAll(rxContexto)) {
      // m[2] es "atm" opcional, m[3] el número con ruido OCR
      pushIfOk(m[3])
    }
  }

  // 0.b) Si aparece el token ATM pegado al número en cualquier lado, también lo intento
  if (candidatos.length === 0) {
    const rxATM = /\batm\s*([0-9OQDSIl|B]{8,24})\b/gi
    for (const m of norm.matchAll(rxATM)) pushIfOk(m[1])
  }

  // 1) patrón clásico “BOLETA N° …”
  if (candidatos.length === 0) {
    const rxClasico = /boleta\s*n?[°º*:\-"]?\s*([0-9OQDSIl|B\s]{6,24})/gi
    for (const m of norm.matchAll(rxClasico)) pushIfOk(m[1] ?? '')
  }

  // 2) fallback: secuencias que parecen boletas (empiezan en 20…)
  if (candidatos.length === 0) {
    const rxSoloNum = /\b20[0-9OQDSIl|B]{10,16}\b/gi
    for (const m of norm.matchAll(rxSoloNum)) pushIfOk(m[0])
  }

  // 3) último recurso: cualquier número largo 10–14/18 y que empiece en 20
  if (candidatos.length === 0) {
    const rxLargos = /\b[0-9]{10,24}\b/g
    for (const m of norm.matchAll(rxLargos)) {
      const tok = m[0]
      if (/^20[0-9]{9,23}$/.test(tok)) pushIfOk(tok)
    }
  }

  if (!candidatos.length) return null

  // ordeno por longitud desc, luego por el que empieza con 20
  candidatos.sort((a, b) => {
    if (b.length !== a.length) return b.length - a.length
    const ap = /^20/.test(a) ? 1 : 0
    const bp = /^20/.test(b) ? 1 : 0
    return bp - ap
  })

  return candidatos[0]
}

export function extraerBoleta(texto: string, minLen = 10, maxLen = 18): string | null {
  if (!texto) return null
  const norm = normalizarOCR(texto)

  // 1) patrón clásico
  const rx = /BOLETA\s*N?[°º*:\-"]?\s*([0-9OODSIl|B\s]{6,24})/gi
  const candidatos: string[] = []
  for (const m of norm.matchAll(rx)) {
    const fijo = (m[1] ?? '')
      .replace(/[OQD]/g, '0')
      .replace(/[S]/g, '5')
      .replace(/[Il|]/g, '1')
      .replace(/[B]/g, '8')
      .replace(/\s+/g, '')
      .replace(/[^\d]/g, '')
    if (fijo.length >= minLen && fijo.length <= maxLen) candidatos.push(fijo)
  }

  // 2) fallback: buscar secuencias que *parecen* boletas (13–14 dígitos empezando en 20…)
  if (candidatos.length === 0) {
    const rxSoloNum = /\b20[\dOQDSIl|B]{10,12}\b/g
    for (const m of norm.matchAll(rxSoloNum)) {
      const fijo = m[0]
        .replace(/[OQD]/g, '0')
        .replace(/[S]/g, '5')
        .replace(/[Il|]/g, '1')
        .replace(/[B]/g, '8')
      if (/^20\d{11,13}$/.test(fijo)) candidatos.push(fijo)
    }
  }

  // 3) último recurso: tomar el número “tipo boleta” más largo
  if (candidatos.length === 0) {
    const m = norm.match(/\b\d{10,14}\b/g) || []
    for (const tok of m) {
      if (/^20\d{9,13}$/.test(tok)) candidatos.push(tok)
    }
  }

  if (!candidatos.length) return null
  candidatos.sort((a, b) => b.length - a.length)
  return candidatos[0]
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
    // Ya no devolvemos Math.max(...candidatos)
    // Vamos a re-escanear por contexto y puntuar:
    type Cand = { n: number; score: number; raw: string }
    const scored: Cand[] = []

    const lines = t.split(/\r?\n/)
    for (const line of lines) {
      const isTotal = /\bT[0O]T[AI1]L\b/i.test(line) && !/\bSUB\s*T[0O]T[AI1]L\b/i.test(line)
      const nums = line.match(new RegExp(NUM_PATTERN, 'g')) || []
      for (const tok of nums) {
        if (!esPlausibleNumero(tok)) continue
        const n = parseMontoMixto(tok)
        if (n == null) continue
        let score = 0
        if (isTotal) score += 2
        if (/[.,]\d{2}\b/.test(tok)) score += 3 // decimal de 2 dígitos
        if (/\d{1,3}([.,]\d{3})+([.,]\d{2})?\b/.test(tok)) score += 1 // miles correctos
        if (!/[.,]/.test(tok) && String(Math.trunc(n)).length >= 7) score -= 3 // entero enorme

        scored.push({ n, score, raw: tok })
      }
    }

    if (scored.length) {
      scored.sort((a, b) => b.score - a.score || b.n - a.n)
      return scored[0].n
    }
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

  const T = texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[|¦•·│▏▕]+/g, ' ')
    .toUpperCase()

  // Tomo desde DOMICILIO...
  const m = T.match(/\bD[0O]M[I1]C[ I1]L[I1]O\b\s*([\s\S]+?)(?=$|\r?\n)/i)
  let s = m?.[1] ?? ''

  if (!s) return ''

  // Cortes duros si aparece NAT/INAT, OBJETO, EMISION, etc.
  const stopMarkers = [
    /\bI?N?ATURALEZA\b/, // NATURALEZA / INATURALEZA / NAT...
    /\bOBJET[O0]\b/,
    /\bEMISION\b/,
    /\bSECUENCIA\b/,
    /\bFECHA\b/,
    /\bEXPTE\b/,
    /\bHOJA\b/,
    /\bCUIT\b/,
    /\bDNI\b/
  ]

  let cut = s.length
  for (const r of stopMarkers) {
    const mm = s.search(r)
    if (mm >= 0 && mm < cut) cut = mm
  }
  s = s.slice(0, cut)

  // Limpieza y normalización
  return s
    .replace(/[\n\r]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s*-\s*(?=-|$)/g, ' ')
    .replace(/[.,](?=\s|$)/g, '')
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

function normalizeObjetoToken(
  raw: string,
  opts: { mode?: 'alnum' | 'numeric'; min?: number; max?: number } = {}
): string | null {
  const mode = opts.mode ?? 'alnum'
  const min = opts.min ?? 7
  const max = opts.max ?? 12
  if (!raw) return null

  // Base: limpieza y correcciones OCR de letras que suelen ser dígitos
  let t = raw
    .toUpperCase()
    .replace(/^[`'"]/g, '')
    .replace(/[^A-Z0-9]/g, '')

  // Correcciones OCR comunes
  t = t.replace(/[OQD]/g, '0').replace(/S/g, '5').replace(/B/g, '8')

  if (!t) return null

  // Evitar "IMPORTE" y variantes
  const tLettersOnly = raw.toUpperCase().replace(/[^A-Z]/g, '')
  if (/^I?MPORTE$/.test(tLettersOnly)) return null

  if (mode === 'numeric') {
    // Para INMOBILIARIO: solo dígitos (después de correcciones), longitudes más permisivas
    const digits = t.replace(/\D/g, '')
    if (digits.length < 5 || digits.length > 16) return null
    return digits
  } else {
    // Alfanumérico: 7–12, debe tener al menos una letra y un dígito
    if (t.length < min || t.length > max) return null
    if (!/[A-Z]/.test(t) || !/\d/.test(t)) return null
    // Corrección inicial común (si empieza con O -> 0) ya cubierta por reemplazos
    return t
  }
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
  const T = texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
  const candidatos: string[] = []

  // 1) Después de EMISION PATENTE (alfanumérico)
  {
    const re = /EMISION\s+PATENTE\s+([A-Z0-9]{5,16})\b/g
    let m: RegExpExecArray | null
    while ((m = re.exec(T))) {
      const norm = normalizeObjetoToken(m[1], { mode: 'alnum' })
      if (norm) candidatos.push(norm)
    }
  }

  // 2) Formato explícito OBJETO: (alfanumérico)
  {
    const re = /\bOBJET[O0]\b\s*[:\-]?\s*([A-Z0-9]{5,16})\b/g
    let m: RegExpExecArray | null
    while ((m = re.exec(T))) {
      const norm = normalizeObjetoToken(m[1], { mode: 'alnum' })
      if (norm) candidatos.push(norm)
    }
  }

  // 3) Claves comunes con N° (INMOBILIARIO solo numérico; resto alfanumérico)
  {
    type KeySpec = { pat: string; mode: 'alnum' | 'numeric' }
    const keys: KeySpec[] = [
      { pat: String.raw`AUT[O0]M[O0]T[O0]R\s+PATENTE`, mode: 'alnum' },
      { pat: String.raw`INGRES[O0]S?\s+BRUT[O0]S?`, mode: 'alnum' },
      { pat: String.raw`INM[O0]BILIAR[I1][O0]\s+PADR[O0]N`, mode: 'numeric' }, // ← acá forzamos numérico
      { pat: String.raw`TASA\s+DE\s+JUSTICIA\s+AUT[O0]S?`, mode: 'alnum' },
      { pat: String.raw`MULTAS?`, mode: 'alnum' },
      { pat: String.raw`SELLO`, mode: 'alnum' }
    ]
    const afterN = String.raw`(?:N|N[°*º°]|NRO|NUM(?:ERO)?)?\s*[:=\-]?\s*([A-Z0-9]{5,16})\b`

    for (const k of keys) {
      const re = new RegExp(k.pat + String.raw`\s+` + afterN, 'g')
      let m: RegExpExecArray | null
      while ((m = re.exec(T))) {
        const norm = normalizeObjetoToken(m[1], { mode: k.mode })
        if (norm) candidatos.push(norm)
      }
    }
  }

  // 4) Ventana cerca de palabras clave (fallback alfanumérico)
  if (!candidatos.length) {
    const near =
      /(?:EMISION|PATENTE|OBJET[O0]|AUTOMOTOR|AUTOMOTORES)[\s\S]{0,40}\b([A-Z0-9]{7,12})\b/g
    let m: RegExpExecArray | null
    while ((m = near.exec(T))) {
      const norm = normalizeObjetoToken(m[1], { mode: 'alnum' })
      if (norm) candidatos.push(norm)
    }
  }

  return pickMostFrequent(candidatos)
}
