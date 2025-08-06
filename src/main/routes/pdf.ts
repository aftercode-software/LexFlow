import { ipcMain, shell } from 'electron'
import path from 'path'
import { generateWrittenPdf, mergePdfs } from '../docx/util'
import { extractDataFromPdf } from '../services/pdf/process-pdf'
import fsPromises from 'fs/promises'
import { extractDataFromCsm } from '../services/pdf/process-csm'
import { BASE_OUTPUT_DIR } from '../../shared/constants/output-dir'

export function registerPdfHandlers() {
  ipcMain.handle(
    'pdf:extract-data',
    async (_, arrayBuffer: ArrayBuffer, pdfType: 'profesional' | 'tercero') => {
      const { data, originalPdfPath } = await extractDataFromPdf(arrayBuffer, pdfType)
      return { data, originalPdfPath }
    }
  )

  ipcMain.handle('generateDocument', async (_, { data, originalPdfPath }) => {
    const writtenPdfPath = await generateWrittenPdf(data)

    const mergedBytes = await mergePdfs(originalPdfPath, writtenPdfPath)

    const outputDir =
      data.tipo === 'Profesional'
        ? `${BASE_OUTPUT_DIR}\\boletas\\profesionales`
        : `${BASE_OUTPUT_DIR}\\boletas\\terceros`
    await fsPromises.mkdir(outputDir, { recursive: true })

    const finalPath = path.join(outputDir, `${data.boleta}.pdf`)
    await fsPromises.writeFile(finalPath, mergedBytes)

    return { success: true, path: finalPath }
  })

  ipcMain.handle('open-pdf', (_evt, pdfPath: string) => {
    return shell.openPath(pdfPath)
  })

  ipcMain.handle('pdf:csm:extract-data', async (_, arrayBuffer: ArrayBuffer) => {
    console.log('Procesando PDF CSM...')
    const { data, originalPdfPath } = await extractDataFromCsm(arrayBuffer)
    return { data, originalPdfPath }
  })
}
