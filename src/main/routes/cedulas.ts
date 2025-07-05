// import { ipcMain } from 'electron'
// import fetch from 'node-fetch'
// import { getCedulaCuijs } from '../playwright/fetch-cedulas'
// import { mapCedulaToEnriched } from '../../shared/interfaces/cedulasFiltradas'

// export function registerCedulaHandlers() {
//   ipcMain.handle('cedulas:get-filtradas', async () => {
//     try {
//       const cuijs = await getCedulaCuijs()

//       const res = await fetch('https://scrapper-back-two.vercel.app/api/boletas/filtrar/csm', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ cuijs })
//       })

//       if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)

//       const data = await res.json()
//       return data.map(mapCedulaToEnriched)
//     } catch (err) {
//       console.error('Error al obtener cédulas filtradas:', err)
//       return { error: true, message: String(err) }
//     }
//   })
// }
