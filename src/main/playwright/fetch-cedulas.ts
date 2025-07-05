import fs from 'fs/promises'
import path from 'path'

export async function getPdfNames(dir: string): Promise<string[]> {
  const files = await fs.readdir(dir)
  return files
    .filter((f) => f.toLowerCase().endsWith('.pdf'))
    .map((f) => path.parse(f).name)
}

export async function scanCedulas(): Promise<{
  cuijsPrimero: string[]
  cuijsSegundo: string[]
  cuijsTercero: string[]
  primeroDir: string
  segundoDir: string
  terceroDir: string
}> {
  const baseDir = 'C:\\cedulas\\CSM'
  const primeroDir = path.join(baseDir, 'Primero')
  const segundoDir = path.join(baseDir, 'Segundo')
  const terceroDir = path.join(baseDir, 'Tercero')

  const [cuijsPrimero, cuijsSegundo, cuijsTercero] = await Promise.all([
    getPdfNames(primeroDir),
    getPdfNames(segundoDir),
    getPdfNames(terceroDir)
  ])
  console.log('Primer:', cuijsPrimero)
    console.log('Tercero:', cuijsTercero)
    
console.log('Segundo:', cuijsSegundo)

  return {
    cuijsPrimero,
    cuijsSegundo,
    cuijsTercero,
    primeroDir,
    segundoDir,
    terceroDir
  }
}
export async function fetchCedulasFromServer(cuijs: string[], token: string): Promise<any[]> {
  const res = await fetch('https://scrapper-back-two.vercel.app/api/boletas/filtrar/csm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ cuijs })
  })

  if (!res.ok) {
    throw new Error(`Servidor respondió con ${res.status}: ${res.statusText}`)
  }

  return res.json()
}