import Tesseract, { OEM } from 'tesseract.js'

export async function createWorker() {
  const { createWorker } = Tesseract
  return await createWorker('spa', OEM.DEFAULT)
}

export const options = {
  quality: 100,
  density: 300,
  format: 'jpg',
  width: 1200,
  height: 1600
}
