import { chromium, Page } from 'playwright'
import { EnrichedBoleta } from '../../shared/interfaces/boletas'
import path from 'path'
import fs from 'fs'
import { BASE_OUTPUT_DIR } from '../../shared/constants/output-dir'

async function procesarBoleta(page: Page, boleta: EnrichedBoleta, oficial2: boolean) {
  
  await page.waitForTimeout(4000)
  await page.locator('text="Nuevo Registro"').click()
  await page.waitForSelector('.window:visible', { timeout: 5000 })

  const boletaInput = page.locator(
    '.window:visible label:has-text("Boleta") ~ span input.textbox-text'
  )
  await boletaInput.click()
  await boletaInput.fill(boleta.boleta)

  const apellido = page.locator(
    'xpath=/html/body/div[11]/div[2]/form[1]/table/tbody/tr[5]/td[2]/div/span/input[1]'
  )

  await apellido.fill(boleta.demandado.apellido)
  await page
    .locator('xpath=/html/body/div[11]/div[2]/form[1]/table/tbody/tr[6]/td[2]/div/span/span')
    .click()
  if (boleta.demandado.tipoDocumento === 'CUIT') {
    const cuitSelect = page.locator('#_easyui_combobox_i4_4')
    await cuitSelect.click()
  } else {
    const dniSelect = page.locator('#_easyui_combobox_i4_2')
    await dniSelect.click()
  }
  const domicilio = page.locator(
    'xpath=/html/body/div[11]/div[2]/form[1]/table/tbody/tr[7]/td[2]/div/p/span/input[1]'
  )
  console.log(`Debug: boleta.demandado.domicilio =`, boleta.demandado.domicilio)
  await domicilio.fill(boleta.demandado.domicilio)
  const nombre = page.locator(
    'xpath=/html/body/div[11]/div[2]/form[1]/table/tbody/tr[5]/td[3]/div/span/input[1]'
  )
  console.log(`Debug: boleta.demandado.nombre =`, boleta.demandado.nombre)
  await nombre.fill(boleta.demandado.nombre)
  const documento = page.locator(
    'xpath=/html/body/div[11]/div[2]/form[1]/table/tbody/tr[6]/td[3]/div/p/span/input[1]'
  )
  console.log(`Debug: boleta.demandado.numeroDocumento =`, boleta.demandado.numeroDocumento)
  await documento.fill(boleta.demandado.numeroDocumento)
  const monto = page.locator(
    'xpath=/html/body/div[11]/div[2]/form[1]/table/tbody/tr[19]/td[2]/div/p/span/input[1]'
  )
  await page.waitForTimeout(2500)

  console.log(`Debug: boleta.monto =`, boleta.monto)
  await monto.fill(String(boleta.monto))
  const objetoImponible = page.locator(
    'xpath=/html/body/div[11]/div[2]/form[1]/table/tbody/tr[20]/td[2]/div/span/input[1]'
  )
  if (boleta.tipo === 'Multas') {
    await objetoImponible.fill(`MULTAS N° ${boleta.objeto}`.toUpperCase())
  } else  if (boleta.tipo === 'Automotores') {
    await objetoImponible.fill(
      `AUTOMOTOR PATENTE  N° ${boleta.objeto} `.toUpperCase()
    )
  } else if (boleta.tipo === 'Inmobiliarios') {
    await objetoImponible.fill(
      `INMOBILIARIO PADRÓN N° ${boleta.objeto}`.toUpperCase()
    )
  } else if (boleta.tipo === 'Ingresos-brutos') {
    await objetoImponible.fill(
      `INGRESOS BRUTOS N° ${boleta.objeto}`.toUpperCase()
    )
  } else if (boleta.tipo === 'Sellos') {
    await objetoImponible.fill(
      `SELLO N° ${boleta.objeto}`.toUpperCase()
    )
  }

  const tributo = page.locator('xpath=/html/body/div[11]/div[2]/form[1]/table/tbody/tr[19]/td[3]/div/span/input[1]').click()
  await page.waitForTimeout(2500)
  if (boleta.tipo === 'Multas') {
      await page.locator('#_easyui_combobox_i7_4').click()
  } else{
    await page.locator('#_easyui_combobox_i7_1').click()
  }
  const oficial = page.locator(
    'xpath=/html/body/div[11]/div[2]/form[1]/table/tbody/tr[13]/td[3]/div/span/span/a'
  )
  await oficial.click()
  await page.locator('#_easyui_combobox_i8_2').click()

  await page.waitForTimeout(2500)

  if (boleta.tipo === 'Multas') {
    const archivoPath = `${BASE_OUTPUT_DIR}/boletas/multas/ATM${boleta.boleta}.pdf`
    await page.setInputFiles('input#filebox_file_id_1', archivoPath)
  } else {
    const archivoPath = `${BASE_OUTPUT_DIR}/boletas/otros/ATM${boleta.boleta}.pdf`
    await page.setInputFiles('input#filebox_file_id_1', archivoPath)
  }

  // await page.locator('input[type="submit"][value="Guardar"]').click()
  // await page.waitForTimeout(1500)
  // await page.locator('xpath=/html/body/div[13]/div[3]/a/span/span').click()
  // await page.waitForTimeout(1500)
  // const grabar = page.locator('xpath=/html/body/div[11]/div[3]/a[1]/span')
  // await grabar.click()
  // console.log(`✅ Boleta ${boleta.boleta} completada`)
}

// Flujo principal
export async function subirBoletas(
  boletas: EnrichedBoleta[],
  montoThreshold: number,
  modoInhibicion: string,
  oficial2: boolean
) {
  console.log('montoThreshold', montoThreshold)
  const chromePath = findChromeExe()
  if (!chromePath) {
    console.error('No se encontró la ruta de Chrome. Asegúrate de que esté instalado.')
    return
  }

  const browser = await chromium.launch({
    headless: false,
    executablePath: chromePath
  })
  const context = await browser.newContext({ storageState: 'auth.json' })
  const page = await context.newPage()
  await page.goto('https://www.jus.mendoza.gov.ar/tributario/precarga/index.php')
  await page.mouse.wheel(0, 50)
  await page.waitForTimeout(4000)


  await page.waitForTimeout(1000)
  await page
    .locator('xpath=/html/body/center[3]/div[2]/div[2]/table/tbody/tr/td[7]/a[2]/span/span')
    .click()
  await page.waitForTimeout(2000)
  await page
    .locator('xpath=/html/body/center[3]/div[2]/div[2]/table/tbody/tr/td[2]/span/span/a')
    .click()
  await page.waitForTimeout(2000)
  await page.locator('#_easyui_combobox_i1_1').click()
  await page
    .locator('xpath=/html/body/center[3]/div[2]/div[2]/table/tbody/tr/td[4]/span/span')
    .click()
  await page.waitForTimeout(2000)
  await page.locator('#_easyui_combobox_i2_1').click()
  await page.waitForTimeout(2000)
  await page
    .locator('xpath=/html/body/center[3]/div[2]/div[2]/table/tbody/tr/td[6]/span/span')
    .click()
  await page.waitForTimeout(1000)
  if (modoInhibicion === 'con') {
    await page.locator('#_easyui_combobox_i3_1').click()
  } else {
    await page.locator('#_easyui_combobox_i3_9').click()
  }
  await page.waitForTimeout(4000)
  await page.locator('#buttonGuardar').click()
  await page.waitForTimeout(3000)
  const maxIterations = Math.min(boletas.length, 25)
  const tipos = new Set<string>()

  for (const boleta of boletas.slice(0, maxIterations)) {
     tipos.add(boleta.tipo)
    await procesarBoleta(page, boleta, oficial2)
  }
  console.log('Tipos de boleta detectados:', Array.from(tipos))

  await page.waitForTimeout(60000)
}

export function findChromeExe(): string | null {
  const programFiles = process.env['PROGRAMFILES'] || 'C:\\Program Files'
  const programFilesx86 = process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)'

  const chrome64 = path.join(programFiles, 'Google', 'Chrome', 'Application', 'chrome.exe')
  const chrome32 = path.join(programFilesx86, 'Google', 'Chrome', 'Application', 'chrome.exe')

  if (fs.existsSync(chrome64)) {
    return chrome64
  } else if (fs.existsSync(chrome32)) {
    return chrome32
  } else {
    return null
  }
}
