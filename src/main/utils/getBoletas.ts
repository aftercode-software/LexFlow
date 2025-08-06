import fs from 'fs/promises'
import path from 'path'
import { BASE_OUTPUT_DIR } from '../../shared/constants/output-dir'

export async function getPdfNames(dir: string): Promise<string[]> {
  const files = await fs.readdir(dir)
  return files.filter((f) => f.toLowerCase().endsWith('.pdf')).map((f) => path.parse(f).name)
}

export async function getBoletas(): Promise<{
  profesionales: string[]
  terceros: string[]
  profDir: string
  terDir: string
}> {
  const baseDir = BASE_OUTPUT_DIR + '\\boletas'
  const profDir = path.join(baseDir, 'profesionales')
  const terDir = path.join(baseDir, 'terceros')

  await fs.mkdir(profDir, { recursive: true })
  await fs.mkdir(terDir, { recursive: true })

  const [profesionales, terceros] = await Promise.all([getPdfNames(profDir), getPdfNames(terDir)])

  return { profesionales, terceros, profDir, terDir }
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
