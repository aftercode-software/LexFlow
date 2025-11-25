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
import { getSecondToLastPageBuffer } from './pageCount'
import { DatosFormulario } from '../../../shared/interfaces/form'
import sharp from 'sharp'
import { getScannerConfig } from '../../utils/getScannerConfig'

export async function pruebaEscaneoMasivo() {
  const worker = await createWorker()
  const baseDir = 'C:\\Users\\germh\\Downloads\\drive-download-20251022T181617Z-1-001'

  const files = (await fsPromises.readdir(baseDir))
    .filter((f) => f.toLowerCase().endsWith('.pdf'))
    .map((f) => path.join(baseDir, f))

  console.log(`Encontrados ${files.length} PDFs`)

  const resultados = []

  for (const pdfPath of files) {
    try {
      console.log('Procesando:', pdfPath)
      const extractedData = await processExtraction(worker, pdfPath)
      console.log('SALIDA FINAL', extractedData)
    } catch (err) {
      console.error('Error al procesar:', pdfPath, err)
    }
  }

  console.log('✅ Escaneo masivo finalizado.')
  return resultados
}

export async function extractDataFromPdf(arrayBuffer: ArrayBuffer): Promise<{
  data: DatosFormulario
  originalPdfPath: string
  pngPath: string
}> {
  const tmpDir = path.join(app.getPath('temp'), 'scrapper-tmp')
  await fsPromises.mkdir(tmpDir, { recursive: true })

  const originalPdfPath = path.join(tmpDir, `original-${Date.now()}.pdf`)
  await fsPromises.writeFile(originalPdfPath, Buffer.from(arrayBuffer))
  // pruebaEscaneoMasivo()
  const data = await processPDF(originalPdfPath)

  const tempPath = app.getPath('temp')
  const nombreArchivoFijo = 'ultimapage.png'
  const pngPath = path.join(tempPath, nombreArchivoFijo)

  // 2. Leer el archivo de vuelta del disco como un Buffer
  let pngDataUrl = ''
  try {
    const fileBuffer = await fsPromises.readFile(pngPath)
    // 3. Convertir el Buffer a un data URL
    pngDataUrl = `data:image/png;base64,${fileBuffer.toString('base64')}`
  } catch (err) {
    console.error('Error al leer el archivo PNG para Base64:', err)
  }

  return { data, originalPdfPath, pngPath: pngDataUrl }
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
  const lastPage = await getSecondToLastPageBuffer(pdfPath)

  const scannerConfig = await getScannerConfig()

  const datosSuperiorImg = await cropImage(lastPage, scannerConfig.header)
  const mediaImg = await cropImage(lastPage, scannerConfig.media)
  const tablaImg = await cropImage(lastPage, scannerConfig.tabla)
  const montoImg = await cropImage(lastPage, scannerConfig.monto)

  const tmpDir = path.join(app.getPath('temp'), 'scrapper-debug')
  await fsPromises.mkdir(tmpDir, { recursive: true })

  await fsPromises.writeFile(path.join(tmpDir, 'parte-superior.jpg'), datosSuperiorImg)
  await fsPromises.writeFile(path.join(tmpDir, 'parte-media.jpg'), mediaImg)
  await fsPromises.writeFile(path.join(tmpDir, 'parte-monto.jpg'), montoImg)
  await fsPromises.writeFile(path.join(tmpDir, 'parte-tabla.jpg'), tablaImg)

  const tempPath = app.getPath('temp')
  const nombreArchivoFijo = 'ultimapage.png'
  const rutaDeGuardado = path.join(tempPath, nombreArchivoFijo)

  console.log('Guardando página completa en:', rutaDeGuardado)

  await sharp(lastPage).png().toFile(rutaDeGuardado)

  const superiorTxt = await getTextFromImage(worker, datosSuperiorImg, 'header')

  console.log('superiorTxt', superiorTxt)
  const mediaTxt = await getTextFromImage(worker, mediaImg, 'table')
  const tablaTxt = await getTextFromImage(worker, tablaImg, 'table')
  const montoTxt = await getTextFromImage(worker, montoImg, 'table')
  console.log('montoTxt', montoTxt)
  console.log('mediaTxt', mediaTxt)

  const boleta = extraerBoleta(superiorTxt) ?? ''
  const fechaEmision = superiorTxt.match(/\b([0-3]\d\/[01]\d\/(?:19|20)\d{2})\b/)?.[1] ?? ''
  const secuencia = extraerSecuencia(superiorTxt) ?? ''

  const doc = extraerDocumento(superiorTxt)
  const apellidoYNombre = extraerNombreEmplazado(mediaTxt)
  const domicilio = extraerDomicilio(mediaTxt)

  const objeto = extraerObjeto(tablaTxt)
  const bruto = extraerMonto(tablaTxt) ?? 0
  const valorEnLetras = numeroALetras(bruto).toUpperCase()

  console.log('TABLA TEXTO', montoTxt)

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
