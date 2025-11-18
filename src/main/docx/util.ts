/* eslint-disable @typescript-eslint/no-explicit-any */
import { spawn } from 'child_process'
import { createReport } from 'docx-templates'
import fsPromises from 'fs/promises'
import path from 'path'
import { app, BrowserWindow } from 'electron'
import { PDFDocument } from 'pdf-lib'
import { BASE_OUTPUT_DIR } from '../../shared/constants/output-dir'
import mammoth from 'mammoth'

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

  const { value: rawHtml } = await mammoth.convertToHtml({ buffer: docxBuffer })

  console.log('html', rawHtml)
  const customStyles = `
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.5;
          font-size: 12pt;
          padding-left: 1.5cm;
        }

        p {
          text-align: justify;
          margin-bottom: 12px;
          text-indent: 80px;
        }

        ol {
          text-align: justify;
          padding-left: 40px;
          margin-bottom: 12px;
        }
        li {
          margin-bottom: 4px;
        }

        body > p:nth-of-type(1) {
          text-align: right;
          font-weight: bold;
          margin-bottom: 25px;
          text-indent: 0;
        }

        body > p:nth-of-type(3) {
          text-align: left;
          font-weight: bold;
          margin-bottom: 20px;
          text-indent: 0 !important;
        }

        body > p:nth-last-of-type(4) {
          line-height: 0.5;
        }
        body > p:nth-last-of-type(3) {
          line-height: 0.5;
        }

        body > p:nth-last-of-type(2) {
          text-align: right;
          font-weight: bold;
          margin-left: 0;
          margin-right: 50px;
          text-indent: 0;
        }

        body > p:nth-last-of-type(1) {
          text-align: right;
          margin-left: 0;
          margin-right: 50px;
          margin-bottom: 0;
          margin-top: 10px;
          text-indent: 0;
        }

        img {
          width: 120px !important;
          height: 120px !important;
          object-fit: contain;
        }
      </style>
    `
  // Envolvemos el HTML de mammoth con nuestros estilos
  const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          ${customStyles}
        </head>
        <body>
          ${rawHtml}
        </body>
      </html>
    `

  const pdfBytes = await new Promise<Buffer>((resolve, reject) => {
    // Creamos una ventana invisible
    const offscreenWindow = new BrowserWindow({
      show: false,
      webPreferences: {
        // La seguridad de Electron puede bloquear 'data:' URLs,
        // esto es más seguro si el HTML es complejo
        nodeIntegration: false,
        contextIsolation: true
      }
    })

    // Cargamos nuestro HTML generado
    // Usamos data:text/html;charset=utf-8, para manejar acentos
    offscreenWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)

    offscreenWindow.webContents.on('did-finish-load', async () => {
      try {
        // "Imprimimos" la página a PDF
        const pdf = await offscreenWindow.webContents.printToPDF({
          margins: {
            marginType: 'printableArea'
          },
          printBackground: true,
          pageSize: 'A4'
        })
        resolve(pdf)
      } catch (err) {
        reject(err)
      } finally {
        // Cerramos la ventana invisible
        offscreenWindow.close()
      }
    })

    offscreenWindow.webContents.on('did-fail-load', (e, code, desc) => {
      reject(new Error(`Ventana invisible falló al cargar: ${desc}`))
      offscreenWindow.close()
    })
  })

  // --- Guardar el PDF ---
  const tempDir = path.join(app.getPath('temp'), 'boletas-temp')
  await fsPromises.mkdir(tempDir, { recursive: true })

  const pdfPath = path.join(tempDir, `${data.boleta}.pdf`)
  await fsPromises.writeFile(pdfPath, pdfBytes)

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
