import path from 'path'
import fsPromises from 'fs/promises'
import { app } from 'electron'

import { fromPath } from 'pdf2pic'
import { cropImage, extraerBoleta, extraerCUIJ, extraerNumeroJuicio } from './utils'
import { getTextFromImage } from './ocr'
import { createWorker, options, optionsCSM } from '../tesseract'

export async function extractDataFromCsm(arrayBuffer: ArrayBuffer) {
  const tmpDir = path.join(app.getPath('temp'), 'scrapper-tmp')
  await fsPromises.mkdir(tmpDir, { recursive: true })

  const originalPdfPath = path.join(tmpDir, `csm-${Date.now()}.pdf`)
  await fsPromises.writeFile(originalPdfPath, Buffer.from(arrayBuffer))

  const data = await processCMSPDF(originalPdfPath)
  return { data, originalPdfPath }
}

export async function processCMSPDF(tempPath: string) {
  const storeAsImage = fromPath(tempPath, optionsCSM)
  const worker = await createWorker()

  const { buffer: convertedPage1 } = await storeAsImage(1, { responseType: 'buffer' })
  const { buffer: convertedPage2 } = await storeAsImage(2, { responseType: 'buffer' })

  if (!convertedPage1 || !convertedPage2) {
    throw new Error('Error convirtiendo PDF a imagen (CSM).')
  }

  const seccionSuperior = await cropImage(convertedPage1, 0, 200, 600, 400)
  const seccionSuperiorPath = path.join(
    path.dirname(tempPath),
    `seccion-superior-${Date.now()}.png`
  )
  const tmpDir = path.join(app.getPath('temp'), 'scrapper-debug')

  await fsPromises.writeFile(path.join(tmpDir, 'csm-superior.jpg'), seccionSuperior)

  await fsPromises.writeFile(seccionSuperiorPath, seccionSuperior)
  console.log('Sección Superior guardada en:', seccionSuperiorPath)
  const datosSuperior = await getTextFromImage(worker, seccionSuperior)

  console.log('Datos Superior:', datosSuperior)

  const cuij = extraerCUIJ(datosSuperior)
  const boleta = extraerBoleta(datosSuperior)
  console.log('CUIJ:', cuij)
  console.log('Número de Juicio:', boleta)
  return {
    cuij,
    boleta
  }
}
