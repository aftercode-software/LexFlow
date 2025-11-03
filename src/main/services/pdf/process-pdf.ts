import fsPromises from 'fs/promises'
import path from 'path'
import { app } from 'electron'
import { numeroALetras } from '../../../shared/utils/document'
import { getTextFromImage } from './ocr'
import {
  cropImage,
  extraerBoleta,
  extraerDocumento,
  extraerDomicilio,
  extraerMonto,
  extraerNombreEmplazado,
  extraerObjeto,
  extraerSecuencia
} from './utils'
import { createWorker } from '../tesseract'
import { getLastPageBuffer } from './pageCount'
import { DatosFormulario } from '../../../shared/interfaces/form'

// export async function pruebaEscaneoMasivo() {
//   const worker = await createWorker()
//   const baseDir = 'C:\\Users\\germh\\Downloads\\drive-download-20251022T181617Z-1-001'

//   const files = (await fsPromises.readdir(baseDir))
//     .filter((f) => f.toLowerCase().endsWith('.pdf'))
//     .map((f) => path.join(baseDir, f))

//   console.log(`Encontrados ${files.length} PDFs`)

//   const resultados = []

//   for (const pdfPath of files) {
//     try {
//       console.log('Procesando:', pdfPath)
//       const extractedData = await processExtraction(worker, pdfPath)
//       console.log('SALIDA FINAL', extractedData)
//     } catch (err) {
//       console.error('Error al procesar:', pdfPath, err)
//     }
//   }

//   console.log('✅ Escaneo masivo finalizado.')
//   return resultados
// }
export async function extractDataFromPdf(
  arrayBuffer: ArrayBuffer
): Promise<{
  data: DatosFormulario
  originalPdfPath: string
}> {
  const tmpDir = path.join(app.getPath('temp'), 'scrapper-tmp')
  await fsPromises.mkdir(tmpDir, { recursive: true })

  const originalPdfPath = path.join(tmpDir, `original-${Date.now()}.pdf`)
  await fsPromises.writeFile(originalPdfPath, Buffer.from(arrayBuffer))

  const data = await processPDF(originalPdfPath)
  // pruebaEscaneoMasivo()
  return { data, originalPdfPath }
}

export async function processPDF(pdfPath: string): Promise<DatosFormulario> {
  const worker = await createWorker()
  let extractedData: DatosFormulario | null = null

  extractedData = await processExtraction(worker, pdfPath)

  await worker.terminate()

  if (!extractedData) {
    throw new Error('No se pudo extraer información del PDF.')
  }

  return extractedData
}

async function processExtraction(
  worker: Tesseract.Worker,
  pdfPath: string
): Promise<DatosFormulario> {
  const lastPage = await getLastPageBuffer(pdfPath)

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

  const boleta = extraerBoleta(superiorTxt) ?? ''
  const fechaEmision = superiorTxt.match(/\b([0-3]\d\/[01]\d\/(?:19|20)\d{2})\b/)?.[1] ?? ''
  const secuencia = extraerSecuencia(superiorTxt) ?? ''

  const doc = extraerDocumento(superiorTxt)
  const apellidoYNombre = extraerNombreEmplazado(mediaTxt)
  const domicilio = extraerDomicilio(mediaTxt)

  const objeto = extraerObjeto(montoTxt)
  const bruto = extraerMonto(montoTxt) ?? 0
  const valorEnLetras = numeroALetras(bruto).toUpperCase()

  // console.log('TEXTOS OBTENIDOS', superiorTxt, mediaTxt, montoTxt)
  return {
    boleta,
    fechaEmision,
    secuencia,
    tipoDocumento: doc?.tipo,
    documento: doc?.valor,
    apellidoYNombre,
    domicilio,
    objeto,
    bruto,
    valorEnLetras
  }
}
