/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { chromium, Page } from 'playwright'
import { EnrichedBoleta } from '../interface/boletas'

// Procesar una sola boleta
async function procesarBoleta(page: Page, boleta: EnrichedBoleta) {
  await page.waitForTimeout(2000)
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
  await page.locator('#_easyui_combobox_i4_2').click()
  const domicilio = page.locator(
    'xpath=/html/body/div[11]/div[2]/form[1]/table/tbody/tr[7]/td[2]/div/p/span/input[1]'
  )
  await domicilio.fill(boleta.demandado.domicilio)
  const nombre = page.locator(
    'xpath=/html/body/div[11]/div[2]/form[1]/table/tbody/tr[5]/td[3]/div/span/input[1]'
  )
  await nombre.fill(boleta.demandado.nombre)
  const dni = page.locator(
    'xpath=/html/body/div[11]/div[2]/form[1]/table/tbody/tr[6]/td[3]/div/p/span/input[1]'
  )
  await dni.fill(boleta.demandado.numeroDocumento)
  const monto = page.locator(
    'xpath=/html/body/div[11]/div[2]/form[1]/table/tbody/tr[19]/td[2]/div/p/span/input[1]'
  )
  await monto.fill(boleta.monto)
  const objetoImponible = page.locator(
    'xpath=/html/body/div[11]/div[2]/form[1]/table/tbody/tr[20]/td[2]/div/span/input[1]'
  )
  await objetoImponible.fill('boleta.objetoImponible')
  const oficial = page.locator(
    'xpath=/html/body/div[11]/div[2]/form[1]/table/tbody/tr[13]/td[3]/div/span/span/a'
  )
  await oficial.click()
  const stela = page.locator('#_easyui_combobox_i8_0')
  await stela.click()

  const archivoPath = `C://boletas/terceros/${boleta.boleta}.pdf`
  await page.setInputFiles('input#filebox_file_id_1', archivoPath)

  const nombreArchivo = await page
    .locator('input#filebox_file_id_1')
    .evaluate((input) => input.files?.[0]?.name || null)

  console.log(`📎 Archivo cargado: ${nombreArchivo}`)
  await page.locator('input[type="submit"][value="Guardar"]').click()
  const grabar = page.locator('xpath=/html/body/div[11]/div[3]/a[1]/span')
  await grabar.click()
  console.log(`✅ Boleta ${boleta.boleta} completada`)
}

// Flujo principal
export async function subirBoletas(boletas: EnrichedBoleta[]) {
  console.log('boletasMati!', boletas)
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext({ storageState: 'auth.json' })
  const page = await context.newPage()
  await page.goto('https://www.jus.mendoza.gov.ar/tributario/precarga/index.php')

  // Acciones iniciales del lote (solo una vez)
  await page
    .locator('xpath=/html/body/center[3]/div[2]/div[2]/table/tbody/tr/td[2]/span/span/a')
    .click()
  await page.locator('#_easyui_combobox_i1_1').click()
  await page
    .locator('xpath=/html/body/center[3]/div[2]/div[2]/table/tbody/tr/td[4]/span/span')
    .click()
  await page.locator('#_easyui_combobox_i2_1').click()
  await page
    .locator('xpath=/html/body/center[3]/div[2]/div[2]/table/tbody/tr/td[6]/span/span')
    .click()
  await page.locator('#_easyui_combobox_i3_1').click()
  await page.locator('#buttonGuardar').click()

  for (const boleta of boletas.slice(0, 10)) {
    await procesarBoleta(page, boleta)
  }

  console.log('🟢 Lote finalizado. La ventana quedará abierta para verificación.')
  await page.waitForTimeout(60000)
}
