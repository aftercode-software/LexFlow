import Tesseract, { OEM } from 'tesseract.js'

export async function createWorker() {
  const { createWorker } = Tesseract
  const w = await createWorker('spa', OEM.DEFAULT)
  await w.load('spa')
  await w.reinitialize('spa', OEM.LSTM_ONLY)
  await w.setParameters({
    user_defined_dpi: '300',
    preserve_interword_spaces: '1'
  })
  return w
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
