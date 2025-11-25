import path from 'path'
import Tesseract, { OEM, PSM } from 'tesseract.js'

export async function createWorker() {
  const { createWorker } = Tesseract
  const langPath = path.resolve('./')

  console.log('📂 Buscando archivos de idioma en:', langPath)

  const w = await createWorker(['spa', 'osd'], OEM.DEFAULT, {
    langPath: langPath,
    gzip: false
    // logger: (m) => console.log(m)
  })

  await w.load('spa')
  await w.reinitialize('spa', OEM.LSTM_ONLY)
  await w.setParameters({
    tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
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
