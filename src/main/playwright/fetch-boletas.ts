/* eslint-disable @typescript-eslint/explicit-function-return-type */
import fs from 'fs/promises'
import path from 'path'

export async function getPdfNames(dir: string): Promise<string[]> {
  const files = await fs.readdir(dir)
  return files.filter((f) => f.toLowerCase().endsWith('.pdf')).map((f) => path.parse(f).name)
}

export async function scanBoletas(): Promise<{
  profesionales: string[]
  terceros: string[]
  profDir: string
  terDir: string
}> {
  const baseDir = 'C:\\boletas'
  const profDir = path.join(baseDir, 'profesionales')
  const terDir = path.join(baseDir, 'terceros')

  const [profesionales, terceros] = await Promise.all([getPdfNames(profDir), getPdfNames(terDir)])

  return { profesionales, terceros, profDir, terDir }
}
/**
 * Llama al servidor pasándole los arrays de nombres y la matrícula,
 * y devuelve la data cruda que retorna el endpoint.
 */
export async function fetchBoletasFromServer(profesionales, terceros, matricula) {
  const res = await fetch('https://tu-servidor.com/api/boletas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profesionales, terceros, matricula })
  })
  if (!res.ok) {
    throw new Error(`Servidor respondió con ${res.status}: ${res.statusText}`)
  }
  return res.json() // { profesionales: [...], terceros: [...] }
}
