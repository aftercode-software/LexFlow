export type TipoEscrito = 'CSM' | 'JMI'
export type TipoTribunal = 'Primero' | 'Segundo' | 'Tercero'
export type EstadoCedula = 'No iniciada' | 'Generada' | 'Notificada' | string // ampliable según backend

export interface CedulaFiltrada {
  boleta: string
  demandado: string
  juicio: string
  cuij: string
  estado: EstadoCedula
  tipoEscrito: TipoEscrito
  tipoTribunal: string
  filePath: string
  recaudador?: {
    id: number
    nombre: string
    matricula: number
    idNombre: string
    [key: string]: any
  }
}
export function mapCedulaFiltrada(
  boletas: {
    cuij: string
    cedula: EstadoCedula
    boleta: string
    demandado: string
    juicio: string
    recaudador?: {
      id: number
      nombre: string
      matricula: number
      idNombre: string
      [key: string]: any
    }
  }[],
  tribunal: string
): CedulaFiltrada[] {
  return boletas.map((cedula) => ({
    boleta: cedula.boleta,
    demandado: cedula.demandado,
    juicio: cedula.juicio,
    cuij: cedula.cuij,
    estado: cedula.cedula,
    tipoEscrito: 'CSM',
    tipoTribunal: tribunal,
    filePath: `C:\\cedulas\\CSM\\${tribunal}\\${cedula.cuij}.pdf`,
    recaudador: cedula.recaudador 
  }))
}
