/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { chromium, Page } from 'playwright'
import { EnrichedBoleta } from '../interface/boletas'

// Procesar una sola boleta
async function procesarBoleta(page: Page, boleta: EnrichedBoleta) {
  await page.waitForTimeout(4000)
  await page.locator('text="Nuevo Registro"').click()
  await page.waitForSelector('.window:visible', { timeout: 5000 })

  const boletaInput = page.locator(
    '.window:visible label:has-text("Boleta") ~ span input.textbox-text'
  )
  await boletaInput.click()
  console.log(`Debug: completo=`, boleta)
  await boletaInput.fill(boleta.boleta)

  const apellido = page.locator(
    'xpath=/html/body/div[11]/div[2]/form[1]/table/tbody/tr[5]/td[2]/div/span/input[1]'
  )
  console.log(`Debug: NUEVO NOMBRE =`, boleta.demandado)
  console.log(`Debug: NOMBRE COMPLETO =`, boleta.demandado.apellidoYNombre)

  console.log(`Debug: boleta.demandado.apellido =`, boleta.demandado.apellido)
  await apellido.fill(boleta.demandado.apellido)
  await page
    .locator('xpath=/html/body/div[11]/div[2]/form[1]/table/tbody/tr[6]/td[2]/div/span/span')
    .click()
  await page.locator('#_easyui_combobox_i4_2').click()
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
  const dni = page.locator(
    'xpath=/html/body/div[11]/div[2]/form[1]/table/tbody/tr[6]/td[3]/div/p/span/input[1]'
  )
  console.log(`Debug: boleta.demandado.numeroDocumento =`, boleta.demandado.numeroDocumento)
  await dni.fill(boleta.demandado.numeroDocumento)
  const monto = page.locator(
    'xpath=/html/body/div[11]/div[2]/form[1]/table/tbody/tr[19]/td[2]/div/p/span/input[1]'
  )
  console.log(`Debug: boleta.monto =`, boleta.monto)
  await monto.fill(boleta.monto)
  const objetoImponible = page.locator(
    'xpath=/html/body/div[11]/div[2]/form[1]/table/tbody/tr[20]/td[2]/div/span/input[1]'
  )
  if (boleta.tipo === 'Profesional') {
    console.log(
      `Debug: objetoImponible para Profesional =`,
      `APORTES, MATRICULA:${boleta.demandado.matricula}`
    )
    await objetoImponible.fill(`APORTES, MATRICULA:${boleta.demandado.matricula}`)
  } else {
    console.log(
      `Debug: objetoImponible para Tercero =`,
      `EXPEDIENTE: ${boleta.numeroJuicio} - ${boleta.juzgado}`
    )
    await objetoImponible.fill(`EXPEDIENTE: ${boleta.numeroJuicio} - ${boleta.juzgado} `)
  }
  const oficial = page.locator(
    'xpath=/html/body/div[11]/div[2]/form[1]/table/tbody/tr[13]/td[3]/div/span/span/a'
  )
  await oficial.click()
  const stela = page.locator('#_easyui_combobox_i8_0')
  await stela.click()

  if (boleta.tipo === 'Profesional') {
    const archivoPath = `C://boletas/profesionales/${boleta.boleta}.pdf`
    await page.setInputFiles('input#filebox_file_id_1', archivoPath)
  } else {
    const archivoPath = `C://boletas/terceros/${boleta.boleta}.pdf`
    await page.setInputFiles('input#filebox_file_id_1', archivoPath)
  }

  const nombreArchivo = await page
    .locator('input#filebox_file_id_1')
    .evaluate((input: any) => input.files?.[0]?.name || null)

  console.log(`📎 Archivo cargado: ${nombreArchivo}`)
  await page.locator('input[type="submit"][value="Guardar"]').click()
  await page.waitForTimeout(4000)
  await page.locator('xpath=/html/body/div[13]/div[3]/a/span/span').click()
  await page.waitForTimeout(4000)
  const grabar = page.locator('xpath=/html/body/div[11]/div[3]/a[1]/span')
  await grabar.click()
  console.log(`✅ Boleta ${boleta.boleta} completada`)
}

// Flujo principal
export async function subirBoletas(
  boletas: EnrichedBoleta[],
  montoThreshold: number,
  modoInhibicion: string
) {
  console.log(
    'boletasMati!',
    boletas,
    'montoThreshold: correcto',
    montoThreshold,
    'modoInhibicion:',
    modoInhibicion
  )
  const browser = await chromium.launch({ headless: false })
  const context = await browser.newContext({ storageState: 'auth.json' })
  const page = await context.newPage()
  await page.goto('https://www.jus.mendoza.gov.ar/tributario/precarga/index.php')

  // Acciones iniciales del lote (solo una vez)
  await page
    .locator('xpath=/html/body/center[3]/div[2]/div[2]/table/tbody/tr/td[7]/a[2]/span/span')
    .click()
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
  if (modoInhibicion === 'con') {
    await page.locator('#_easyui_combobox_i3_1').click()
  } else {
    await page.locator('#_easyui_combobox_i3_9').click()
  }
  await page.locator('#buttonGuardar').click()
  const maxIterations = Math.min(boletas.length, 25)
  for (const boleta of boletas.slice(0, maxIterations)) {
    await procesarBoleta(page, boleta)
  }
  console.log('🟢 Lote finalizado. La ventana quedará abierta para verificación.')
  await page.waitForTimeout(60000)
}
