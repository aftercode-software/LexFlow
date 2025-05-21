/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { chromium, BrowserContext } from 'playwright'

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
  const browser = await chromium.launch({ headless: false })
  const context: BrowserContext = await browser.newContext()
  const page = await context.newPage()
  await page.goto('https://www.jus.mendoza.gov.ar/tributario/precarga/users.php')

  console.log(
    '🟡 Iniciá sesión manualmente. El navegador se cerrará cuando detecte los datos o tras 60s.'
  )
  try {
    await page.waitForSelector('input.textbox-text.validatebox-text.validatebox-readonly', {
      timeout: 60000
    })
  } catch {
    await browser.close()
    throw new Error('⛔ Timeout: no se detectó un login exitoso en 60s.')
  }

  await context.storageState({ path: 'auth.json' })
  console.log('✅ auth.json guardado')

  const data: RecaudadorData = {
    recaudador: await page.$eval('input[type="hidden"][name="recnombre"]', (el: HTMLInputElement) =>
      el.value.trim()
    ),
    matricula: await page.$eval('input[type="hidden"][name="recmat"]', (el: HTMLInputElement) =>
      el.value.trim()
    ),
    telefonoFijo: await page.$eval('input[type="hidden"][name="rectelf"]', (el: HTMLInputElement) =>
      el.value.trim()
    ),
    telefonoMovil: await page.$eval(
      'input[type="hidden"][name="rectelm"]',
      (el: HTMLInputElement) => el.value.trim()
    ),
    organismo: await page.$eval(
      'input[type="hidden"][name="recorganismo"]',
      (el: HTMLInputElement) => el.value.trim()
    ),
    descripcion: await page.$eval('input[type="hidden"][name="descorto"]', (el: HTMLInputElement) =>
      el.value.trim()
    ),
    correo: await page.$eval('input[type="hidden"][name="reccorreo"]', (el: HTMLInputElement) =>
      el.value.trim()
    ),
    fechaReporte: await page.$eval(
      '#fechareporte',
      (el: HTMLElement) => el.textContent?.trim() || ''
    )
  }

  console.log('Datos extraídos:', data)

  await browser.close()
  console.log('✅ Datos extraídos y navegador cerrado')
  return data
}
