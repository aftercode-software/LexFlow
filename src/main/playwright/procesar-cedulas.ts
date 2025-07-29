import { chromium, Page } from 'playwright'
import fs from 'fs'
import path from 'path'
import { CedulaFiltrada, TipoEscrito, TipoTribunal } from '../../shared/interfaces/cedulas'

export async function subirCedulas(cedulas: CedulaFiltrada[], tipoEscrito: TipoEscrito,
  tribunal: 'primer' | 'segundo' | 'tercer'
) {
  const chromePath = findChromeExe()
  if (!chromePath) {
    console.error('Chrome no encontrado.')
    return
  }

  const browser = await chromium.launch({ headless: false, executablePath: chromePath })
  const context = await browser.newContext({ storageState: 'auth.json' })
  const page = await context.newPage()

  await page.goto('https://www.jus.mendoza.gov.ar/tributario/precarga/lotes.php')
  await page.waitForTimeout(2000)

  const tribunalIndex = mapTribunalToIndex(tribunal)

  const tipoEscritoIndex = mapTipoEscritoToIndex(cedulas[0].tipoEscrito)

  await page.click('xpath=/html/body/center[3]/div[2]/div[2]/table/tbody/tr/td[2]/span/span')
  await page.waitForTimeout(1000)
  await page.click(`#_easyui_combobox_i1_${tribunalIndex}`)

  await page.click('xpath=/html/body/center[3]/div[2]/div[2]/table/tbody/tr/td[4]/span/span/a')
  await page.waitForTimeout(1000)
  await page.click(`#_easyui_combobox_i2_${tipoEscritoIndex}`)

  await page.click('xpath=/html/body/center[3]/div[2]/div[2]/table/tbody/tr/td[5]/a[1]/span/span')
  await page.waitForTimeout(3000)

  const cantidad = Math.min(cedulas.length, 50)
  for (const cedula of cedulas.slice(0, cantidad)) {
    await procesarCedula(page, cedula)
    await page.waitForTimeout(1000)
  }

  await page.waitForTimeout(30000)
}

async function procesarCedula(page: Page, cedula: CedulaFiltrada) {
  console.log(`Procesando CUIJ: ${cedula.cuij}`)

  await page.click('xpath=/html/body/center[3]/div[3]/div[2]/div[1]/a[1]/span/span[1]')
  await page.waitForTimeout(1500)

  await page.locator('xpath=/html/body/div[5]/div[2]/form/table/tbody/tr[2]/td/span/input[1]')
    .fill(cedula.cuij)

  await page.locator('xpath=/html/body/div[5]/div[2]/form/table/tbody/tr[8]/td/form/span[1]/input[1]')
    .setInputFiles(cedula.filePath)

  await page.click('xpath=/html/body/div[5]/div[2]/form/table/tbody/tr[8]/td/form/input[2]')
  console.log(`✅ Cédula ${cedula.cuij} subida correctamente`)
}


function mapTribunalToIndex(tribunal: 'primer' | 'segundo' | 'tercer'): number {
  switch (tribunal) {
    case 'primer': return 1
    case 'segundo': return 2
    case 'tercer': return 3
  }
}

function mapTipoEscritoToIndex(tipo: TipoEscrito): number {
  switch (tipo) {
    case 'CSM': return 14
    case 'JMI': return 15 
  }
}

function findChromeExe(): string | null {
  const programFiles = process.env['PROGRAMFILES'] || 'C:\\Program Files'
  const programFilesx86 = process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)'

  const chrome64 = path.join(programFiles, 'Google', 'Chrome', 'Application', 'chrome.exe')
  const chrome32 = path.join(programFilesx86, 'Google', 'Chrome', 'Application', 'chrome.exe')

  return fs.existsSync(chrome64) ? chrome64 : fs.existsSync(chrome32) ? chrome32 : null
}
