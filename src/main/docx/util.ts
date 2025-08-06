/* eslint-disable @typescript-eslint/no-explicit-any */
import { spawn } from 'child_process'
import { createReport } from 'docx-templates'
import fsPromises from 'fs/promises'
import fs from 'fs'
import path from 'path'
import { app } from 'electron'
import { PDFDocument } from 'pdf-lib'
import { BASE_OUTPUT_DIR } from '../../shared/constants/output-dir'

export async function generateWrittenPdf(data: any): Promise<string> {
  const escritoPath = `${BASE_OUTPUT_DIR}\\boletas\\escrito.docx`
  const template = fs.readFileSync(escritoPath)
  const docxBuffer = await createReport({
    template,
    data,
    cmdDelimiter: ['{{', '}}'],
    failFast: true
  })

  const tempDir = path.join(app.getPath('temp'), 'boletas-temp')
  await fsPromises.mkdir(tempDir, { recursive: true })

  const docxPath = path.join(tempDir, `${data.boleta}.docx`)
  await fsPromises.writeFile(docxPath, docxBuffer)

  await new Promise<void>((resolve, reject) => {
    const proc = spawn('soffice', [
      '--headless',
      '--convert-to',
      'pdf',
      '--outdir',
      tempDir,
      docxPath
    ])
    proc.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`soffice exit ${code}`))))
  })

  const pdfPath = path.join(tempDir, `${data.boleta}.pdf`)
  return pdfPath
}

export async function mergePdfs(
  originalPdfPath: string,
  writtenPdfPath: string
): Promise<Uint8Array> {
  const [origBytes, writtenBytes] = await Promise.all([
    fsPromises.readFile(originalPdfPath),
    fsPromises.readFile(writtenPdfPath)
  ])

  const mergedDoc = await PDFDocument.create()
  const [origDoc, writtenDoc] = await Promise.all([
    PDFDocument.load(origBytes),
    PDFDocument.load(writtenBytes)
  ])

  const origPages = await mergedDoc.copyPages(origDoc, origDoc.getPageIndices())
  const writtenPages = await mergedDoc.copyPages(writtenDoc, writtenDoc.getPageIndices())
  origPages.forEach((p) => mergedDoc.addPage(p))
  writtenPages.forEach((p) => mergedDoc.addPage(p))

  return mergedDoc.save()
}
