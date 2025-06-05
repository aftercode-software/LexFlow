/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { chromium, BrowserContext } from 'playwright'
import { findChromeExe } from './procesar-boletas'

interface RecaudadorData {
  recaudador: string
  matricula: string
  telefonoFijo: string
  telefonoMovil: string
  organismo: string
  descripcion: string
  correo: string
  fechaReporte: string
}

export async function loginRecaudador(): Promise<RecaudadorData> {
  const chromePath = findChromeExe()
  if (!chromePath) {
    throw new Error('⛔ No se encontró el ejecutable de Chrome. Asegúrate de que esté instalado.')
  }

  const browser = await chromium.launch({
    headless: false,
    executablePath: chromePath
  })
  const context: BrowserContext = await browser.newContext()
  const page = await context.newPage()

  await page.goto('https://www.jus.mendoza.gov.ar/tributario/precarga/users.php')

  try {
    await page.waitForSelector('input.textbox-text.validatebox-text.validatebox-readonly', {
      timeout: 60000
    })
    await context.storageState({ path: 'auth.json' })
  } catch {
    await browser.close()
    throw new Error('⛔ Timeout: no se detectó un login exitoso en 60 segundos.')
  }

  try {
    await page.waitForFunction(
      () => {
        const hidden = document.querySelector<HTMLInputElement>(
          'input[type="hidden"][name="recnombre"]'
        )
        return hidden !== null && hidden.value.trim().length > 0
      },
      { timeout: 10000 }
    )
  } catch {
    console.warn(
      '⚠️ El campo recnombre tardó más de 10s en llenarse. Intento continuar de todas formas.'
    )
  }

  const recaudadorInput = await page.$('input[type="hidden"][name="recnombre"]')
  const recaudador = recaudadorInput
    ? await recaudadorInput.evaluate((el: HTMLInputElement) => el.value.trim())
    : ''

  const matricula = await page.$eval(
    'input[type="hidden"][name="recmat"]',
    (el: HTMLInputElement) => el.value.trim()
  )
  const telefonoFijo = await page.$eval(
    'input[type="hidden"][name="rectelf"]',
    (el: HTMLInputElement) => el.value.trim()
  )
  const telefonoMovil = await page.$eval(
    'input[type="hidden"][name="rectelm"]',
    (el: HTMLInputElement) => el.value.trim()
  )
  const organismo = await page.$eval(
    'input[type="hidden"][name="recorganismo"]',
    (el: HTMLInputElement) => el.value.trim()
  )
  const descripcion = await page.$eval(
    'input[type="hidden"][name="descorto"]',
    (el: HTMLInputElement) => el.value.trim()
  )
  const correo = await page.$eval(
    'input[type="hidden"][name="reccorreo"]',
    (el: HTMLInputElement) => el.value.trim()
  )

  const fechaReporte = await page.$eval(
    'label#fechareporte',
    (el: HTMLElement) => el.textContent?.trim() || ''
  )

  const data: RecaudadorData = {
    recaudador,
    matricula,
    telefonoFijo,
    telefonoMovil,
    organismo,
    descripcion,
    correo,
    fechaReporte
  }

  await browser.close()
  return data
}
