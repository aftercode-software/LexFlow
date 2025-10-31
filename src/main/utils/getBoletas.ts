import fs from 'fs/promises'
import path from 'path'
import { BASE_OUTPUT_DIR } from '../../shared/constants/output-dir'

type Tipo = 'automotores' | 'ingresos-brutos' | 'inmobiliarios' | 'multas' | 'sellos'

const TIPOS: readonly Tipo[] = [
  'automotores',
  'ingresos-brutos',
  'inmobiliarios',
  'multas',
  'sellos'
]

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
  porTipo: Record<Tipo, string[]>
  baseDir: string
  dirs: Record<Tipo, string>
}> {
  const baseDir = path.join(BASE_OUTPUT_DIR, 'boletas')

  const dirs = Object.fromEntries(TIPOS.map((t) => [t, path.join(baseDir, t)])) as Record<
    Tipo,
    string
  >

  await Promise.all(Object.values(dirs).map((d) => fs.mkdir(d, { recursive: true })))

  const listas = await Promise.all(TIPOS.map((t) => getPdfNames(dirs[t])))

  const porTipo = Object.fromEntries(TIPOS.map((t, i) => [t, listas[i]])) as Record<Tipo, string[]>

  const todas = Array.from(new Set(listas.flat()))

  return { todas, porTipo, baseDir, dirs }
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
