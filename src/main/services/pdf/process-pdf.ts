import fsPromises from 'fs/promises'
import path from 'path'
import { fromPath } from 'pdf2pic'

import { app } from 'electron'
import { FormularioProfesionales, FormularioTerceros } from '../../../shared/interfaces/form'
import { extraerDocumento, numeroALetras } from '../../../shared/utils/document'
import { getTextFromImage } from './ocr'
import { cropImage, extraerBoleta, extraerMonto } from './utils'
import { createWorker, options } from '../tesseract'

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
  const storeAsImage = fromPath(pdfPath, options)

  const { buffer: convertedPage1 } = await storeAsImage(1, { responseType: 'buffer' })
  const { buffer: convertedPage2 } = await storeAsImage(2, { responseType: 'buffer' })

  if (!convertedPage1 || !convertedPage2) {
    throw new Error('Error convirtiendo PDF a imagen (Tercero).')
  }

  // 1) Cortamos regiones de la página 1 (cada crop retorna un Buffer)
  const datosSuperiorImg = await cropImage(convertedPage1, 0, 125, 1200, 100)
  const mediaImg = await cropImage(convertedPage1, 0, 165, 1200, 155)
  const montoImg = await cropImage(convertedPage1, 20, 320, 1180, 230)

  // 3) Extraemos texto de cada parte usando Tesseract directamente sobre el Buffer
  const datosSuperiorTxt = await getTextFromImage(worker, datosSuperiorImg)

  const fechaEmision = datosSuperiorTxt.match(/\b([0-3]\d\/[01]\d\/(?:19|20)\d{2})\b/)?.[1] ?? ''
  const doc = extraerDocumento(datosSuperiorTxt)

  const boleta = extraerBoleta(datosSuperiorTxt) ?? ''

  const mediaTxt = await getTextFromImage(worker, mediaImg)

  const apellidoYNombre =
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
      .replace(/[^\p{L}]/gu, '')
      .toUpperCase() ?? ''

  const expediente = mediaTxt.match(/Exp[:.]?\s*([0-9/-]+)/i)?.[1] ?? ''

  const montoTxt = await getTextFromImage(worker, montoImg)
  const bruto = extraerMonto(montoTxt) ?? 0
  const valorEnLetras = numeroALetras(bruto).toUpperCase()

  return {
    fechaEmision,
    documento: doc?.valor,
    tipoDocumento: doc?.tipo,
    boleta,
    apellidoYNombre,
    domicilioTipo,
    domicilio: domicilio + ' - ' + provincia,
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
  const options = {
    quality: 100,
    density: 300,
    format: 'jpg',
    width: 1200,
    height: 1600,
    responseType: 'buffer'
  }
  const storeAsImage = fromPath(pdfPath, options)

  const { buffer: convertedPage } = await storeAsImage(1, { responseType: 'buffer' })
  if (!convertedPage) {
    throw new Error('Error convirtiendo PDF a imagen (Profesional).')
  }

  // Cortamos las regiones necesarias
  const parteSuperior = await cropImage(convertedPage, 0, 105, 1200, 100)
  const parteMedia = await cropImage(convertedPage, 0, 145, 1200, 145)
  const parteMonto = await cropImage(convertedPage, 600, 440, 480, 100)

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
