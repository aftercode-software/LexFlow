/* eslint-disable @typescript-eslint/explicit-function-return-type */
import { getToken } from './pdf/utils'

export async function getRecaudadores() {
  const token = await getToken()
  if (!token) throw new Error('No hay token de autenticación')

  const res = await fetch('https://scrapper-back-two.vercel.app/api/recaudadores', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`
    }
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Error ${res.status}: ${text}`)
  }

  return res.json()
}
