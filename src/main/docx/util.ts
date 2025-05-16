import { spawn } from 'child_process'
import { createReport } from 'docx-templates'
import fs from 'fs'
import path from 'path'

const data = {
  tipo: 'Tercero',
  boleta: 'F0029948',
  bruto: '183.757,97',
  demandado: {
    cuil: '30716567199',
    dni: '71656719',
    domicilio: 'JUAN JUSTO Nro:1640 de MAIPU',
    domicilioTipo: 'REAL',
    apellidoYNombre: 'Pl DESARROLLOS SA'
  },
  expediente: '6073/2023',
  fechaEmision: '18/10/2024',
  provincia: 'MENDOZA',
  montoLetras:
    'Ciento Ochenta y Tres Mil Setecientos Cincuenta y Siete con Noventa y Siete Centavos',
  monto: 183757.97,
  recaudador: {
    id: 1,
    nombre: 'Gomez Torre Rodrigo',
    sexo: 'M',
    matricula: '7714',
    telefono: '2616521150',
    celular: '2616521150',
    organismo: 'CAJA FORENSE',
    descripcion: 'CAP',
    email: 'ragomeztorre@gmail.com',
    oficial: 'BENINGAZA ESTELA'
  }
}

export async function compileDocument(): Promise<Uint8Array<ArrayBufferLike>> {
  console.log('Compiling document with data:', data)
  try {
    const template = fs.readFileSync('src/renderer/src/doc/escrito.docx')
    const buffer = await createReport({
      template,
      data: {
        ...data
      },
      cmdDelimiter: ['{{', '}}'],
      failFast: true
    })

    return buffer
  } catch (error) {
    console.log('error explota', error)
    throw new Error(`Error compiling document: ${error}`)
  }
}

export async function convertDocxToPdf(docxPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const outputDir = path.dirname(docxPath)
    console.log('Output directory:', outputDir)

    const libreOffice = spawn('soffice', [
      '--headless',
      '--convert-to',
      'pdf',
      '--outdir',
      outputDir,
      docxPath
    ])

    let stdoutData = ''
    let stderrData = ''
    libreOffice.stdout.on('data', (data) => {
      stdoutData += data.toString()
    })
    libreOffice.stderr.on('data', (data) => {
      stderrData += data.toString()
    })

    libreOffice.on('error', (err) => {
      console.error('Error executing LibreOffice:', err)
      reject(err)
    })
    libreOffice.on('close', (code) => {
      console.log('LibreOffice stdout:', stdoutData)
      console.log('LibreOffice stderr:', stderrData)
      if (code === 0) {
        resolve()
      } else {
        reject(
          new Error(`LibreOffice exited with code ${code}: ${stderrData}`) // eslint-disable-line @typescript-eslint/no-throw-literal
        )
      }
    })
  })
}
