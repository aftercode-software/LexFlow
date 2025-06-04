import fsPromises from 'fs/promises'
import path from 'path'
import { fromPath } from 'pdf2pic'
import Tesseract, { OEM } from 'tesseract.js'

import { app } from 'electron'
import { FormularioProfesionales, FormularioTerceros } from '../../../shared/interfaces/form'
import { extraerDocumento, numeroALetras } from '../../../shared/utils/document'
import { getTextFromImage } from './ocr'
import { cropImage, extraerBoleta, extraerMonto } from './utils'

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
  console.log('PDF original guardado en:', originalPdfPath)

  const data = await processPDF(originalPdfPath, pdfType)

  return { data, originalPdfPath }
}

export async function processPDF(
  pdfPath: string,
  type: 'profesional' | 'tercero'
): Promise<FormularioProfesionales | FormularioTerceros> {
  const { createWorker } = Tesseract
  const worker = await createWorker('spa', OEM.DEFAULT)

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

  const datosSuperiorImg = await cropImage(convertedPDFPage1, 0, 125, 1200, 50)
  const mediaImg = await cropImage(convertedPDFPage1, 0, 165, 1200, 155)
  const montoImg = await cropImage(convertedPDFPage1, 20, 320, 1180, 230)

  // save it in ./tmp folder
  await fsPromises.writeFile(path.join('./tmp', 'monto-tercero.jpg'), montoImg)

  const recaudadorImg = await cropImage(convertedPDFPage2, 0, 1010, 1200, 40)

  const datosSuperiorTxt = await getTextFromImage(worker, datosSuperiorImg)

  const fechaEmision = datosSuperiorTxt.match(/\b([0-3]\d\/[01]\d\/(?:19|20)\d{2})\b/)?.[1] ?? ''
  const doc = extraerDocumento(datosSuperiorTxt)
  console.log('Documento y yipo:', doc)
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

  console.log({
    nombreCompleto: apellidoYNombre,
    domicilioTipo,
    domicilio,
    provincia,
    expediente
  })

  const montoTxt = await getTextFromImage(worker, montoImg)

  const bruto = extraerMonto(montoTxt) ?? 0
  const valorEnLetras = numeroALetras(bruto).toUpperCase()

  console.log({
    bruto,
    valorEnLetras
  })

  const recaudadorTxt = await getTextFromImage(worker, recaudadorImg)

  console.log('Datos Superior:', datosSuperiorTxt)
  console.log('Media:', mediaTxt)
  console.log('Monto:', montoTxt)
  console.log('Recaudador:', recaudadorTxt)

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
  const parteMonto = await cropImage(convertedPDF, 600, 440, 480, 100)

  // save it in ./tmp folder
  await fsPromises.writeFile(path.join('./tmp', 'monto-profesional.jpg'), parteMonto)

  const datosSuperiorTxt = await getTextFromImage(worker, parteSuperior)

  const fechaEmision = datosSuperiorTxt.match(/\b([0-3]\d\/[01]\d\/(?:19|20)\d{2})\b/)?.[1] ?? ''
  const doc = extraerDocumento(datosSuperiorTxt)

  console.log('Documento y yipo:', doc)
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

  console.log({
    apellidoYNombre,
    domicilioTipo,
    domicilio,
    provincia
  })

  const montoTxt = await getTextFromImage(worker, parteMonto)

  console.log('Monto:', montoTxt)

  const bruto = extraerMonto(montoTxt) ?? 0
  const valorEnLetras = numeroALetras(bruto).toUpperCase()

  console.log({
    bruto,
    valorEnLetras
  })

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
