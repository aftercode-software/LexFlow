import fs from 'fs'
import path from 'path'
import { fromPath } from 'pdf2pic'
import Tesseract, { OEM } from 'tesseract.js'
import { DatosProfesional, DatosTercero, PDFType } from '../../types'
import { getTextFromImage } from './ocr'
import { cropImage, extraerBoleta, extraerMonto } from './utils'

export async function extractDataFromPdf(arrayBuffer: ArrayBuffer) {
  try {
    const tempFilePath = path.join(process.cwd() + '/tmp', 'temp.pdf')
    fs.writeFileSync(tempFilePath, Buffer.from(arrayBuffer))

    const extractedText = await processPDF(tempFilePath, PDFType.PROFESIONAL)

    fs.unlinkSync(tempFilePath)
    return extractedText
  } catch (error) {
    console.error('Error processing PDF:', error)
    return { error: 'Failed to process PDF' }
  }
}

export async function processPDF(
  pdfPath: string,
  type: PDFType.PROFESIONAL
): Promise<DatosProfesional>
export async function processPDF(pdfPath: string, type: PDFType.TERCERO): Promise<DatosTercero>

export async function processPDF(
  pdfPath: string,
  type: PDFType
): Promise<DatosProfesional | DatosTercero> {
  const { createWorker } = Tesseract
  const worker = await createWorker('spa', OEM.DEFAULT)

  let extractedData: DatosProfesional | DatosTercero | null = null

  if (type === PDFType.PROFESIONAL) {
    extractedData = (await processProfesionalPDF(worker, pdfPath)) as DatosProfesional
  } else if (type === PDFType.TERCERO) {
    extractedData = (await processTerceroPDF(worker, pdfPath)) as DatosTercero
  }
  await worker.terminate()

  if (!extractedData) {
    throw new Error('No se pudo extraer información del PDF.')
  }

  return extractedData
}

async function processTerceroPDF(worker: Tesseract.Worker, pdfPath: string): Promise<DatosTercero> {
  const options = {
    quality: 100,
    density: 300,
    format: 'jpg',
    width: 1200,
    height: 1600
  }
  const storeAsImage = fromPath(pdfPath, options)
  const { buffer: convertedPDFPage1 } = await storeAsImage(1, {
    responseType: 'buffer'
  })
  const { buffer: convertedPDFPage2 } = await storeAsImage(2, {
    responseType: 'buffer'
  })

  if (!convertedPDFPage1 || !convertedPDFPage2) {
    throw new Error('Error converting PDF to image')
  }

  const tempPath = path.join(process.cwd(), '/tmp/page2.jpg')
  await fs.promises.writeFile(tempPath, convertedPDFPage2)

  const datosSuperiorImg = await cropImage(convertedPDFPage1, 0, 125, 1200, 50)
  const mediaImg = await cropImage(convertedPDFPage1, 0, 165, 1200, 155)
  const montoImg = await cropImage(convertedPDFPage1, 20, 320, 1180, 40)
  const recaudadorImg = await cropImage(convertedPDFPage2, 0, 1010, 1200, 40)

  // Save recaudador img to a temporary file
  const tempRecaudadorPath = path.join(process.cwd(), '/tmp/recaudador.jpg')
  await fs.promises.writeFile(tempRecaudadorPath, recaudadorImg)

  const datosSuperiorTxt = await getTextFromImage(worker, datosSuperiorImg)

  const fechaEmision = datosSuperiorTxt.match(/\b([0-3]\d\/[01]\d\/(?:19|20)\d{2})\b/)?.[1] ?? ''
  const dniMatch = datosSuperiorTxt.match(/\b(?:\d{2}-?)?(\d{8})(?:-?\d)?\b/)
  const dni = dniMatch?.[1] ?? null

  const cuil = dniMatch ? dniMatch[0].replace(/-/g, '') : null

  const boleta = extraerBoleta(datosSuperiorTxt) ?? ''

  console.log({
    fechaEmision,
    dni,
    cuil,
    boleta
  })

  const mediaTxt = await getTextFromImage(worker, mediaImg)

  const nombre =
    mediaTxt
      .match(/EMPLAZA\s+a\s+([\s\S]+?)\s+con\s+domicilio/i)?.[1]
      .replace(/[\n\r]+/g, ' ')
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
      .replace(/[^\p{L}]/gu, '') //   quita bytes raros
      .toUpperCase() ?? ''

  const expediente = mediaTxt.match(/Exp[:.]?\s*([0-9\/-]+)/i)?.[1] ?? ''

  console.log({
    name,
    domicilioTipo,
    domicilio,
    provincia,
    expediente
  })

  const montoTxt = await getTextFromImage(worker, montoImg)

  const { bruto, valor } = extraerMonto(montoTxt) ?? {
    bruto: '',
    valor: 0
  }

  console.log({
    bruto,
    valor
  })

  const recaudadorTxt = await getTextFromImage(worker, recaudadorImg)

  console.log('Datos Superior:', datosSuperiorTxt)
  console.log('Media:', mediaTxt)
  console.log('Monto:', montoTxt)
  console.log('Recaudador:', recaudadorTxt)

  return {
    fechaEmision,
    dni,
    cuil,
    boleta,
    nombre,
    domicilioTipo,
    domicilio,
    provincia,
    expediente,
    bruto,
    valor
  }
}
async function processProfesionalPDF(
  worker: Tesseract.Worker,
  pdfPath: string
): Promise<DatosProfesional> {
  const options = {
    quality: 100,
    density: 300,
    saveFilename: 'temp',
    format: 'jpg',
    width: 1200,
    height: 1600,
    responseType: 'buffer'
  }
  const storeAsImage = fromPath(pdfPath, options)
  const { buffer: convertedPDF } = await storeAsImage(1, {
    responseType: 'buffer'
  })

  if (!convertedPDF) {
    throw new Error('Error converting PDF to image')
  }

  const parteSuperior = await cropImage(convertedPDF, 0, 105, 1200, 50)
  const parteMedia = await cropImage(convertedPDF, 0, 145, 1200, 145)
  const parteMonto = await cropImage(convertedPDF, 600, 440, 480, 30)

  const datosSuperiorTxt = await getTextFromImage(worker, parteSuperior)

  const fechaEmision = datosSuperiorTxt.match(/\b([0-3]\d\/[01]\d\/(?:19|20)\d{2})\b/)?.[1] ?? ''
  const dniMatch = datosSuperiorTxt.match(/\b(?:\d{2}-?)?(\d{8})(?:-?\d)?\b/)
  const dni = dniMatch?.[1] ?? null

  const cuil = dniMatch ? dniMatch[0].replace(/-/g, '') : ''

  const boleta = extraerBoleta(datosSuperiorTxt) ?? ''

  console.log({
    fechaEmision,
    dni,
    cuil,
    boleta
  })

  const mediaTxt = await getTextFromImage(worker, parteMedia)

  const nombre =
    mediaTxt
      .match(/EMPLAZA\s+a\s+([\s\S]+?)\s+con\s+domicilio/i)?.[1]
      .replace(/\(Mat.*?\)/gi, '')
      .replace(/[\n\r]+/g, ' ')
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

  console.log({
    nombre,
    domicilioTipo,
    domicilio,
    provincia
  })

  const montoTxt = await getTextFromImage(worker, parteMonto)

  const { bruto, valor } = extraerMonto(montoTxt) ?? {
    bruto: '',
    valor: 0
  }

  console.log({
    bruto,
    valor
  })

  return {
    fechaEmision,
    dni,
    cuil,
    boleta,
    nombre,
    domicilioTipo,
    domicilio,
    provincia,
    bruto,
    valor
  }
}
