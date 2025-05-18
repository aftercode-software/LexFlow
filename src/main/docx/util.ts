/* eslint-disable @typescript-eslint/no-explicit-any */
import { spawn } from 'child_process'
import { createReport } from 'docx-templates'
import fsPromises from 'fs/promises'
import fs from 'fs'
import path from 'path'
import { app } from 'electron'

import { PDFDocument } from 'pdf-lib'

export async function compileDocument(data: any): Promise<Uint8Array<ArrayBufferLike>> {
  console.log('Compiling document with data:', data)
  try {
    const template = fs.readFileSync('src/renderer/src/doc/escrito.docx')
    const buffer = await createReport({
      template,
      data: {
        ...data
      },
      cmdDelimiter: ['{{', '}}'],
      failFast: true
    })

    return buffer
  } catch (error) {
    console.log('error explota', error)
    throw new Error(`Error compiling document: ${error}`)
  }
}

export async function convertDocxToPdf(docxPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const outputDir = path.dirname(docxPath)
    console.log('Output directory:', outputDir)

    const libreOffice = spawn('soffice', [
      '--headless',
      '--convert-to',
      'pdf',
      '--outdir',
      outputDir,
      docxPath
    ])

    let stdoutData = ''
    let stderrData = ''
    libreOffice.stdout.on('data', (data) => {
      stdoutData += data.toString()
    })
    libreOffice.stderr.on('data', (data) => {
      stderrData += data.toString()
    })

    libreOffice.on('error', (err) => {
      console.error('Error executing LibreOffice:', err)
      reject(err)
    })
    libreOffice.on('close', (code) => {
      console.log('LibreOffice stdout:', stdoutData)
      console.log('LibreOffice stderr:', stderrData)
      if (code === 0) {
        resolve()
      } else {
        reject(new Error(`LibreOffice exited with code ${code}: ${stderrData}`))
      }
    })
  })
}

export async function generateWrittenPdf(data: any): Promise<string> {
  const template = fs.readFileSync('src/renderer/src/doc/escrito.docx')
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
