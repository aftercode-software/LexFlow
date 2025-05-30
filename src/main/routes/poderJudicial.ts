import { ipcMain } from 'electron'
import { loginRecaudador } from '../playwright/manual-login'
import { subirBoletas } from '../playwright/procesar-boletas'
import { EnrichedBoleta } from '../interface/boletas'

export function registerPoderJudicialHandlers() {
  ipcMain.handle(
    'carga:judicial',
    async (_, boletas: EnrichedBoleta[], montoThreshold, modoInhibicion) => {
      console.log('Iniciando carga judicial', boletas)
      subirBoletas(boletas, montoThreshold, modoInhibicion)
    }
  )

  ipcMain.handle('precarga:login', () => loginRecaudador())
}
