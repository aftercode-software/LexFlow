import { ipcMain } from 'electron'
import { subirCedulas } from '../playwright/procesar-cedulas'
import { CedulaFiltrada, TipoEscrito } from '../../shared/interfaces/cedulas'

export function registerPoderJudicialCedulasHandlers() {
  ipcMain.handle(
    'carga:cedulas',
    async (
      _,
      cedulas: CedulaFiltrada[],
      tipoEscrito: TipoEscrito,
      tribunal: 'primer' | 'segundo' | 'tercer'
    ) => {
      try {
        await subirCedulas(cedulas, tipoEscrito, tribunal)
        return { success: true }
      } catch (error) {
        console.error('❌ Error al subir cédulas:', error)
        return { success: false, error }
      }
    }
  )
}
