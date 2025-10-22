import fsPromises from 'fs/promises'
import path from 'path'
import { fromPath } from 'pdf2pic'

import { app } from 'electron'
import { FormularioProfesionales, FormularioTerceros } from '../../../shared/interfaces/form'
import { numeroALetras } from '../../../shared/utils/document'
import { getTextFromImage } from './ocr'
import { cropImage, extraerBoleta, extraerMonto } from './utils'
import { createWorker, options } from '../tesseract'
import { getLastPageBuffer } from './pageCount'

export async function extractDataFromPdf(
  arrayBuffer: ArrayBuffer,
  pdfType: 'profesional' | 'tercero'
): Promise<{
  data: FormularioProfesionales | FormularioTerceros
  originalPdfPath: string
}> {
  const tmpDir = path.join(app.getPath('temp'), 'scrapper-tmp')
  await fsPromises.mkdir(tmpDir, { recursive: true })

  const originalPdfPath = path.join(tmpDir, `original-${Date.now()}.pdf`)
  await fsPromises.writeFile(originalPdfPath, Buffer.from(arrayBuffer))

  const data = await processPDF(originalPdfPath, pdfType)

  return { data, originalPdfPath }
}

export async function processPDF(
  pdfPath: string,
  type: 'profesional' | 'tercero'
): Promise<FormularioProfesionales | FormularioTerceros> {
  const worker = await createWorker()
  let extractedData: FormularioProfesionales | FormularioTerceros | null = null

  if (type === 'profesional') {
    extractedData = (await processProfesionalPDF(worker, pdfPath)) as FormularioProfesionales
  } else if (type === 'tercero') {
    extractedData = (await processTerceroPDF(worker, pdfPath)) as FormularioTerceros
  }
  await worker.terminate()

  if (!extractedData) {
    throw new Error('No se pudo extraer información del PDF.')
  }

  return extractedData
}

async function processTerceroPDF(
  worker: Tesseract.Worker,
  pdfPath: string
): Promise<FormularioTerceros> {
  const lastPage = await getLastPageBuffer(pdfPath)

  // Cortamos las regiones necesarias
  const datosSuperiorImg = await cropImage(lastPage, 0, 0, 1200, 500)
  const mediaImg = await cropImage(lastPage, 0, 150, 1200, 200)
  const montoImg = await cropImage(lastPage, 20, 320, 1180, 850)

  const tmpDir = path.join(app.getPath('temp'), 'scrapper-debug')
  await fsPromises.mkdir(tmpDir, { recursive: true })

  await fsPromises.writeFile(path.join(tmpDir, 'parte-superior.jpg'), datosSuperiorImg)
  await fsPromises.writeFile(path.join(tmpDir, 'parte-media.jpg'), mediaImg)
  await fsPromises.writeFile(path.join(tmpDir, 'parte-monto.jpg'), montoImg)

  const superiorTxt = await getTextFromImage(worker, datosSuperiorImg)
  const mediaTxt = await getTextFromImage(worker, mediaImg)
  const montoTxt = await getTextFromImage(worker, montoImg)

  // 3) Extraemos texto de cada parte usando Tesseract directamente sobre el Buffer
  console.log('dato', montoTxt)

  const fechaEmision = superiorTxt.match(/\b([0-3]\d\/[01]\d\/(?:19|20)\d{2})\b/)?.[1] ?? ''
  const doc = extraerDocumento(superiorTxt)

  const boleta = extraerBoleta(superiorTxt) ?? ''

  const apellidoYNombre = extraerNombreEmplazado(mediaTxt)

  const domicilioTipo = mediaTxt.match(/domicilio\s+(\w+)/i)?.[1].toUpperCase() ?? 'REAL'

  const domicilio = extraerDomicilio(mediaTxt)

  const expediente = mediaTxt.match(/Exp[:.]?\s*([0-9/-]+)/i)?.[1] ?? ''

  const bruto = extraerMonto(montoTxt) ?? 0
  const valorEnLetras = numeroALetras(bruto).toUpperCase()

  return {
    fechaEmision,
    documento: doc?.valor,
    tipoDocumento: doc?.tipo,
    boleta,
    apellidoYNombre,
    domicilioTipo,
    domicilio: domicilio,
    expediente,
    bruto,
    valorEnLetras,
    tipo: 'Tercero'
  }
}

async function processProfesionalPDF(
  worker: Tesseract.Worker,
  pdfPath: string
): Promise<FormularioProfesionales> {
  // Opciones para convertir página 1 a buffer JPEG en memoria

  const lastPage = await getLastPageBuffer(pdfPath)

  // Cortamos las regiones necesarias
  const parteSuperior = await cropImage(lastPage, 0, 105, 1200, 100)
  const parteMedia = await cropImage(lastPage, 0, 145, 1200, 145)
  const parteMonto = await cropImage(lastPage, 600, 440, 480, 100)

  const tmpDir = path.join(app.getPath('temp'), 'scrapper-debug')
  await fsPromises.mkdir(tmpDir, { recursive: true })

  await fsPromises.writeFile(path.join(tmpDir, 'parte-superior.jpg'), parteSuperior)
  await fsPromises.writeFile(path.join(tmpDir, 'parte-media.jpg'), parteMedia)
  await fsPromises.writeFile(path.join(tmpDir, 'parte-monto.jpg'), parteMonto)

  console.log('Imágenes guardadas en:', tmpDir)

  // Extraemos texto usando Tesseract sobre Buffer
  const datosSuperiorTxt = await getTextFromImage(worker, parteSuperior)

  const fechaEmision = datosSuperiorTxt.match(/\b([0-3]\d\/[01]\d\/(?:19|20)\d{2})\b/)?.[1] ?? ''
  const doc = extraerDocumento(datosSuperiorTxt)

  const boleta = extraerBoleta(datosSuperiorTxt) ?? ''

  const mediaTxt = await getTextFromImage(worker, parteMedia)
  const matricula = mediaTxt.match(/\(Mat\.\s*0*([1-9][0-9]*)\)/i)?.[1] ?? ''

  const apellidoYNombre =
    mediaTxt
      .match(/EMPLAZA\s+a\s+([\s\S]+?)\s+\(Mat\./i)?.[1]
      ?.replace(/[\n\r]+/g, ' ')
      .replace(/[.,]/g, '')
      .replace(/\s+/g, ' ')
      .trim() ?? ''

  const domicilioTipo = mediaTxt.match(/domicilio\s+(\w+)/i)?.[1].toUpperCase() ?? ''

  const domicilio =
    mediaTxt
      .match(/en\s+([\s\S]+?)\s+provincia/i)?.[1]
      .replace(/[\n\r]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim() ?? ''

  const provincia =
    mediaTxt
      .match(/provincia\s+de\s+([A-Z\xC0-\xFF]+)/i)?.[1]
      .replace(/[^\p{L}]/gu, '')
      .toUpperCase() ?? ''

  const montoTxt = await getTextFromImage(worker, parteMonto)
  const bruto = extraerMonto(montoTxt) ?? 0
  const valorEnLetras = numeroALetras(bruto).toUpperCase()

  return {
    fechaEmision,
    documento: doc.valor,
    tipoDocumento: doc.tipo,
    matricula,
    boleta,
    apellidoYNombre,
    domicilioTipo,
    domicilio: domicilio + ' - ' + provincia,
    bruto,
    valorEnLetras,
    tipo: 'Profesional'
  }
}

type Documento = { tipo: 'CUIT' | 'DNI'; valor: string }

function normalizarOCR(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // sin tildes
    .replace(/[\u2013\u2014\u2212–—]/g, '-') // guiones varios
    .replace(/[“”«»]/g, '"')
    .toUpperCase()
}

// Corrige confusiones letra↔dígito
function fixDigits(s: string): string {
  return s.replace(/[OQD]/g, '0').replace(/[Il|]/g, '1').replace(/S/g, '5').replace(/B/g, '8')
}

/**
 * Extrae CUIT/DNI de texto OCR, priorizando el CUIT cercano a "EMPLAZA(RÁ)".
 * Devuelve CUIT/DNI **sin guiones**.
 */
export function extraerDocumento(texto: string | null): Documento {
  if (!texto) return { tipo: 'DNI', valor: '' }

  const norm = normalizarOCR(texto)

  // --- Buscar CUIT con ruido entre dígitos ---
  // Prefijos válidos y luego 9 dígitos, permitiendo hasta 3 no-dígitos entre cada dígito.
  // Usamos clases que incluyen posibles confusiones de dígitos en OCR.
  const DIG = `[0-9OQDSIl|B]`
  const NON = `[^0-9OQDSIl|B]{0,3}`
  const cuitFuzzy = new RegExp(
    `\\b(20|23|24|27|30|33)(${NON}${DIG}){9}\\b`, // 2 (prefijo) + 9 dígitos (con ruido)
    'g'
  )

  type Hit = { raw: string; start: number; fixed: string }
  const hits: Hit[] = []
  for (const m of norm.matchAll(cuitFuzzy)) {
    const raw = m[0]
    const start = m.index ?? 0
    const fixed = fixDigits(raw).replace(/\D+/g, '') // solo números
    if (fixed.length === 11) hits.push({ raw, start, fixed })
  }

  if (hits.length) {
    // Si existe "EMPLAZA" en el texto, priorizamos el CUIT más cercano a ese bloque
    const emIdx = norm.search(/EMPLAZA/)
    if (emIdx >= 0) {
      hits.sort((a, b) => Math.abs(a.start - emIdx) - Math.abs(b.start - emIdx))
    } else {
      // Si no, priorizamos por primer aparición
      hits.sort((a, b) => a.start - b.start)
    }
    return { tipo: 'CUIT', valor: hits[0].fixed }
  }

  // --- Fallback: DNI 7–8 dígitos (también con confusiones) ---
  const dniMatch = norm.match(new RegExp(`\\b${DIG}{7,8}\\b`, 'g'))
  if (dniMatch?.length) {
    const fixed = fixDigits(dniMatch[0]).replace(/\D+/g, '')
    if (fixed.length >= 7 && fixed.length <= 8) {
      return { tipo: 'DNI', valor: fixed }
    }
  }

  return { tipo: 'DNI', valor: '' }
}

function normOCR(s: string) {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // saca tildes
    .replace(/[\u2013\u2014\u2212–—]/g, '-') // normaliza guiones
    .replace(/[“”«»]/g, '"')
    .toUpperCase()
}

export function extraerNombreEmplazado(mediaTxt: string): string {
  if (!mediaTxt) return ''
  const t = normOCR(mediaTxt)

  // 1) Ubicá el comienzo de "EMPLAZA" tolerando ruido (EM/EN + hasta 2 letras basura + PLAZA + RA/RÁ opcional)
  //    Cubrimos: EMPLAZA, ENPLAZA, EMIPLAZARA, etc.
  const inicio = t.search(/E[MN]?[A-Z]{0,2}PLAZA(?:RA)?/)
  if (inicio === -1) return ''
  const frag = t.slice(inicio)

  // 2) Cortá hasta DOMICILIO/NATURALEZA/EXPTE/HOJA o fin
  const corte = frag.search(/\b(DOMICILIO|NATURALEZA|EXPTE|HOJA)\b/)
  const bloque = (corte >= 0 ? frag.slice(0, corte) : frag).replace(/\s+/g, ' ')

  // 3) Tomá lo que va después del guion como nombre,
  //    permitiendo que termine con : ; , . o fin de cadena.
  let m = bloque.match(/-\s*([A-ZÁÉÍÓÚÜÑ][A-ZÁÉÍÓÚÜÑ\s\.]{3,}?)(?=\s*[:;,.\-]|$)/i)
  if (m?.[1]) {
    return m[1].replace(/[.,]/g, '').replace(/\s+/g, ' ').trim()
  }

  // 4) Fallback: CUIT + guion + nombre (por si el OCR rompió "EMPLAZA")
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

  // Patrón tolerante:
  // - Busca DOMICILIO / SOMICILIO / DOMIClLIO, etc.
  // - No exige "en"
  // - Captura todo hasta "PROVINCIA" o fin
  const regex = /\b[SD]OM[I1]C[I1]L[I1]O\b\s*(?:EN\s*)?([\s\S]+?)(?=\s+\bPROVINCIA\b|$)/i

  const match = t.match(regex)
  if (!match?.[1]) return ''

  return match[1]
    .replace(/[\n\r]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/[.,]/g, ' ')
    .trim()
}
