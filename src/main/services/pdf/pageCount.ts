import fs from 'fs/promises'
import { fromPath } from 'pdf2pic'

const options = {
  quality: 100,
  density: 300,
  format: 'jpg',
  width: 1200,
  height: 1600,
  responseType: 'buffer'
}

async function countPdfPagesRegex(pdfPath: string): Promise<number | null> {
  const buf = await fs.readFile(pdfPath)
  const txt = buf.toString('latin1')
  const m = txt.match(/\/Type\s*\/Page\b/g)
  return m ? m.length : null
}

async function findLastPageByTrial(pdfPath: string, max = 50): Promise<number> {
  const toImage = fromPath(pdfPath, options)
  let lastOk = 0
  for (let p = 1; p <= max; p++) {
    try {
      const { buffer } = await toImage(p, { responseType: 'buffer' })
      if (!buffer || !Buffer.isBuffer(buffer) || buffer.length === 0) break
      lastOk = p
    } catch {
      break
    }
  }
  if (lastOk === 0) throw new Error('No se pudo rasterizar ninguna página del PDF.')
  return lastOk
}

export async function getSecondToLastPageBuffer(pdfPath: string): Promise<Buffer> {
  const toImage = fromPath(pdfPath, options)

  let pageCount = await countPdfPagesRegex(pdfPath)

  if (!pageCount || pageCount < 1) {
    pageCount = await findLastPageByTrial(pdfPath, 50)
  }

  let targetPageNumber: number

  if (pageCount === 1) {
    targetPageNumber = 1
  } else if (pageCount === 2) {
    targetPageNumber = 2
  } else if (pageCount >= 3) {
    targetPageNumber = pageCount - 2
  } else {
    throw new Error('El PDF tiene un número de páginas inesperado.')
  }

  const { buffer: targetPageBuffer } = await toImage(targetPageNumber, {
    responseType: 'buffer'
  })
  if (!targetPageBuffer) throw new Error('Error convirtiendo la página deseada a imagen.')
  return targetPageBuffer as Buffer
}
