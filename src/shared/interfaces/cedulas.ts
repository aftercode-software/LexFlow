// src/shared/interfaces/cedulasFiltradas.ts

export type TipoEscrito = 'CSM' | 'JMI'
export type TipoTribunal = 'Primero' | 'Segundo' | 'Tercero'
export type EstadoCedula = 'No iniciada' | 'Generada' | 'Notificada' | string // ampliable según backend

export interface CedulaFiltrada {
  cuij: string
  estado: EstadoCedula
  tipoEscrito: TipoEscrito
  tipoTribunal: TipoTribunal
  filePath: string
}
export function mapCedulasContribuidas(
  backendData: any[],
  tribunal: TipoTribunal
): CedulaFiltrada[] {
  return backendData.map((cedula) => ({
    cuij: cedula.cuij,
    estado: cedula.cedula,
    tipoEscrito: 'CSM', 
    tipoTribunal: tribunal,
    filePath: `C:\\cedulas\\CSM\\${tribunal}\\${cedula.cuij}.pdf`
  }))
}
