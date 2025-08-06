/* eslint-disable @typescript-eslint/no-explicit-any */
import { ipcMain } from 'electron'
import { mapCedulaFiltrada } from '../../shared/interfaces/cedulas'
import { BASE_OUTPUT_DIR } from '../../shared/constants/output-dir'
import fsPromises from 'fs/promises'
import path from 'path'
import { getCSMBoletas } from '../utils/getBoletas'
import { backend } from '../utils/backend-fetch'

export function registerCedulaHandlers() {
  ipcMain.handle('cedulas:get-filtradas', async (_, matricula: number) => {
    try {
      const { primer, segundo, tercer } = await getCSMBoletas()
      const res = await backend.post('/boletas/filtrar/csm', {
        cuijs: [...primer, ...segundo, ...tercer]
      })

      const filtradasPrimer = mapCedulaFiltrada(
        res.data.filter((cedula: any) => primer.includes(cedula.cuij)),
        'primer'
      )
      const filtradasSegundo = mapCedulaFiltrada(
        res.data.filter((cedula: any) => segundo.includes(cedula.cuij)),
        'segundo'
      )
      const filtradasTercer = mapCedulaFiltrada(
        res.data.filter((cedula: any) => tercer.includes(cedula.cuij)),
        'tercer'
      )

      const todas = [...filtradasPrimer, ...filtradasSegundo, ...filtradasTercer]

      const filtradasPorMatricula = todas.filter(
        (cedula) => Number(cedula.recaudador?.matricula) === Number(matricula)
      )

      return filtradasPorMatricula
    } catch (err) {
      console.error('❌ Error al traer cédulas filtradas:', err)
      return []
    }
  })

  ipcMain.handle('pdf:save-csm', async (_, { pdfPath, cuij, tribunal }) => {
    try {
      console.log(`Guardando PDF CSM: ${cuij} en tribunal ${tribunal}...`)
      console.log(`Ruta del PDF: ${pdfPath}`)
      const outputDir = BASE_OUTPUT_DIR + `\\cedulas\\${tribunal}`
      await fsPromises.mkdir(outputDir, { recursive: true })

      const fileName = `${cuij}.pdf`
      const finalPath = path.join(outputDir, fileName)

      await fsPromises.copyFile(pdfPath, finalPath)
      await fsPromises.unlink(pdfPath)
      console.log(`PDF CSM guardado en: ${finalPath}`)
      return { success: true, path: finalPath }
    } catch (err) {
      console.error('❌ Error al guardar el PDF:', err)
      return { success: false, error: err }
    }
  })
}
