import fs from 'fs/promises'
import path from 'path'
import { BASE_OUTPUT_DIR } from '../../shared/constants/output-dir'

export async function getPdfNames(dir: string): Promise<string[]> {
  const files = await fs.readdir(dir)

  return files
    .filter((f) => f.toLowerCase().endsWith('.pdf'))
    .map((f) => {
      const name = path.parse(f).name
      return name.startsWith('ATM') ? name.slice(3) : name
    })
}

export async function getBoletas(): Promise<{
  todas: string[]
  multas: string[]
  baseDir: string
  multasDir: string
  otrosDir: string
}> {
  const baseDir = path.join(BASE_OUTPUT_DIR, 'boletas')
  const multasDir = path.join(baseDir, 'multas')
  const otrosDir = path.join(baseDir, 'otros')

  await fs.mkdir(multasDir, { recursive: true })
  await fs.mkdir(otrosDir, { recursive: true })

  const [multas, otras] = await Promise.all([getPdfNames(multasDir), getPdfNames(otrosDir)])

  const todas = Array.from(new Set([...multas, ...otras]))

  return { todas, multas, baseDir, multasDir, otrosDir }
}

export async function getCSMBoletas(): Promise<{
  primer: string[]
  segundo: string[]
  tercer: string[]
  primerDir: string
  segundoDir: string
  tercerDir: string
}> {
  const baseDir = BASE_OUTPUT_DIR + '\\cedulas'
  const primerDir = path.join(baseDir, 'primer')
  const segundoDir = path.join(baseDir, 'segundo')
  const tercerDir = path.join(baseDir, 'tercer')

  await fs.mkdir(primerDir, { recursive: true })
  await fs.mkdir(segundoDir, { recursive: true })
  await fs.mkdir(tercerDir, { recursive: true })

  const [primer, segundo, tercer] = await Promise.all([
    getPdfNames(primerDir),
    getPdfNames(segundoDir),
    getPdfNames(tercerDir)
  ])

  return { primer, segundo, tercer, primerDir, segundoDir, tercerDir }
}
