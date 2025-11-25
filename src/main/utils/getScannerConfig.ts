import { getToken } from '../services/auth'
import { backend } from './backend-fetch'
import { jwtDecode } from 'jwt-decode'

interface CustomTokenPayload {
  sub: string
  email: string | null
  profesional: {
    id: string
    nombre: string
    organism: string
  }
  estudioId: string | null
  sheetId: string | null

  exp?: number
  iat?: number
}

interface ScannerArea {
  h: number
  w: number
  x: number
  y: number
}

interface ScannerConfig {
  media: ScannerArea
  monto: ScannerArea
  tabla: ScannerArea
  header: ScannerArea
}

export async function getScannerConfig(): Promise<ScannerConfig> {
  const token = await getToken()

  if (!token) {
    throw new Error('No se encontró el token de autenticación')
  }

  try {
    const decoded = jwtDecode<CustomTokenPayload>(token)

    const profesionalId = decoded.profesional.id

    const response = await backend.get(`/profesional/scan/${profesionalId}`)

    console.log('response', response.data.config_data)
    return response.data.config_data
  } catch (error) {
    console.error('Error al decodificar token o consultar backend:', error)
    throw error
  }
}
