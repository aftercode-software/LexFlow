/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from 'fs/promises'
import path from 'path'
import { BASE_OUTPUT_DIR } from '../../shared/constants/output-dir'
import { backend } from '../utils/backend-fetch'

export async function getPdfNames(dir: string): Promise<string[]> {
  const files = await fs.readdir(dir)
  return files.filter((f) => f.toLowerCase().endsWith('.pdf')).map((f) => path.parse(f).name)
}
