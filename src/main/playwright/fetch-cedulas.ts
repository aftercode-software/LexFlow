import fs from 'fs/promises'
import path from 'path'

const CEDULAS_DIR = 'C:\\cedulas\\CSM' //

export async function getCedulaCuijs(): Promise<string[]> {
  const files = await fs.readdir(CEDULAS_DIR)
  return files
    .filter((f) => f.toLowerCase().endsWith('.pdf'))
    .map((f) => path.parse(f).name)
}
