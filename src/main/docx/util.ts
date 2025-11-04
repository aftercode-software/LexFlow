/* eslint-disable @typescript-eslint/no-explicit-any */
import { spawn } from 'child_process'
import { createReport } from 'docx-templates'
import fsPromises from 'fs/promises'
import path from 'path'
import { app } from 'electron'
import { PDFDocument } from 'pdf-lib'
import { BASE_OUTPUT_DIR } from '../../shared/constants/output-dir'

let cachedEscritoTemplate: Buffer | null = null

export async function generateWrittenPdf(data: any): Promise<string> {
  const escritoPath = path.join(BASE_OUTPUT_DIR, 'boletas', 'escritoATM.docx')

  if (!cachedEscritoTemplate) {
    cachedEscritoTemplate = await fsPromises.readFile(escritoPath)
  }
  const template = cachedEscritoTemplate

  const docxBuffer = await createReport({
    template,
    data,
    cmdDelimiter: ['{{', '}}'],
    failFast: true,
    additionalJsContext: {
      cap: (s: unknown) => {
        if (typeof s !== 'string' || s.length === 0) return s as any
        const first = s[0].toLocaleUpperCase('es-AR')
        return first + s.slice(1).toLocaleLowerCase('es-AR')
      },
      esPersonaJuridica: (cuit) => {
        if (typeof cuit !== 'string') return false
        const prefijo = cuit.slice(0, 2)
        return ['30', '33', '34'].includes(prefijo)
      },
      extraerDniDeCuit: (cuit) => {
        if (typeof cuit !== 'string' || cuit.length < 9) return ''
        return cuit.slice(2, -1)
      },
      idFiscal: (cuil, cuit, dni) => {
        const idBase = cuil
          ? `CUIL n° ${cuil}`
          : cuit
            ? `CUIT n° ${cuit}`
            : dni
              ? `DNI n° ${dni}`
              : ''

        if (!cuit) return idBase

        const prefijo = cuit.slice(0, 2)
        const esJuridica = ['30', '33', '34'].includes(prefijo)

        if (!esJuridica) {
          const dniFinal = dni || cuit.slice(2, -1)
          return `CUIT n° ${cuit}, D.N.I: ${dniFinal}`
        }

        return idBase
      }
    }
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
    proc.on('error', reject)
  })
  const pdfPath = path.join(tempDir, `${data.boleta}.pdf`)
  return pdfPath
}

export async function mergePdfs(
  originalPdfPath: string,
  writtenPdfPath: string
): Promise<Uint8Array> {
  const tempOut = path.join(app.getPath('temp'), `merged-${Date.now()}.pdf`)
  try {
    await new Promise<void>((resolve, reject) => {
      const proc = spawn('pdfunite', [originalPdfPath, writtenPdfPath, tempOut])
      proc.on('close', (code) =>
        code === 0 ? resolve() : reject(new Error(`pdfunite exit ${code}`))
      )
      proc.on('error', reject)
    })
    const merged = await fsPromises.readFile(tempOut)
    await fsPromises.unlink(tempOut).catch(() => null)
    return merged
  } catch {
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
}
