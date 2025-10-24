import Tesseract, { OEM } from 'tesseract.js'

export async function createWorker() {
  const { createWorker } = Tesseract
  return await createWorker('spa', OEM.DEFAULT)
}

export const options = {
  quality: 100,
  density: 450,
  format: 'jpg',
  width: 1200,
  height: 1600
}

export const optionsCSM = {
  quality: 100,
  density: 450,
  format: 'jpg',
  width: 1600,
  height: 1131
}
