export function normalizeOCR(s: string): string {
  if (!s) return ''

  return s

    .replace(/Ã±/g, 'ñ')
    .replace(/Ã‘/g, 'Ñ')
    .replace(/Ã¡/g, 'á')
    .replace(/Ã/g, 'Á')
    .replace(/Ã©/g, 'é')
    .replace(/Ã‰/g, 'É')
    .replace(/Ã­/g, 'í')
    .replace(/Ã/g, 'Í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ã“/g, 'Ó')
    .replace(/Ãº/g, 'ú')
    .replace(/Ãš/g, 'Ú')
    .replace(/Ãœ/g, 'Ü')
    .replace(/Ã§/g, 'ç')

    .replace(/├ü/g, 'Á')
    .replace(/├í/g, 'á')
    .replace(/├®/g, 'é')
    .replace(/├⌐/g, 'é')
    .replace(/├¡/g, 'í')
    .replace(/├│/g, 'ó')
    .replace(/├║/g, 'ú')
    .replace(/├æ/g, 'Ñ')
    .replace(/├▒/g, 'ñ')
    .replace(/├ë/g, 'É')
    .replace(/├/g, '')

    .replace(/ΓÇö/g, '-')

    .replace(/[|¦•·│▏▕├─┬┤┘└╔╗╚╝═╟╢╠╣╦╩╬_¬°]/g, ' ')
    .replace(/[“”«»]/g, '"')
    .replace(/[\u2013\u2014\u2212–—]/g, '-')
    .replace(/\u00A0/g, ' ')

    .replace(/\s{2,}/g, ' ')
    .trim()
}

export function upperNoAccents(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/\s+$/g, '')
}

export function parseMontoMixto(tok: string): number | null {
  if (!tok) return null

  const t = tok.replace(/[\s]/g, '').replace(/[^0-9.,]/g, '')
  if (!t) return null

  const lastComma = t.lastIndexOf(',')
  const lastDot = t.lastIndexOf('.')

  let normalized: string

  if (lastComma === -1 && lastDot === -1) {
    if (t.length > 5 && t.length < 12) {
      normalized = t.slice(0, -2) + '.' + t.slice(-2)
    } else {
      normalized = t
    }
  } else if (lastComma > lastDot) {
    const decPart = t.slice(lastComma + 1)
    if (decPart.length === 3 && t.length > 6) {
      normalized = t.replace(/[.,]/g, '')
    } else {
      const intPart = t.slice(0, lastComma).replace(/[.,]/g, '')
      normalized = intPart + '.' + decPart
    }
  } else {
    const decPart = t.slice(lastDot + 1)
    if (decPart.length === 3 && t.length > 6) {
      normalized = t.replace(/[.,]/g, '')
    } else {
      const intPart = t.slice(0, lastDot).replace(/[.,]/g, '')
      normalized = intPart + '.' + decPart
    }
  }

  const n = Number(normalized)
  return Number.isFinite(n) ? n : null
}

export function cleanSpaces(s: string): string {
  return s
    .replace(/[ \t]+/g, ' ')
    .replace(/\s*\n\s*/g, '\n')
    .trim()
}

export function normalizeOCRStrong(s: string): string {
  if (!s) return ''
  return s

    .replace(/ΓÇö/g, '—')
    .replace(/├ü/g, 'Á')
    .replace(/├í/g, 'á')
    .replace(/├®/g, 'é')
    .replace(/├│/g, 'ó')
    .replace(/├║/g, 'ú')
    .replace(/Ã‘/gi, 'Ñ')
    .replace(/Ã±/g, 'ñ')
    .replace(/Ã¡/g, 'á')
    .replace(/Ã©/g, 'é')
    .replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/Ãœ/g, 'Ü')

    .replace(/[|¦•·│▏▕├─┬┤┘└╔╗╚╝═╟╢╠╣╦╩╬]/g, ' ')
    .replace(/[“”«»]/g, '"')
    .replace(/[\u2013\u2014\u2212–—]/g, '-')
    .replace(/\u00A0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim()
}
