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
}
export function mapCedulaFiltrada(
  boletas: {
    cuij: string
    cedula: EstadoCedula
    boleta: string
    demandado: string
    juicio: string
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
    filePath: `C:\\cedulas\\CSM\\${tribunal}\\${cedula.cuij}.pdf`
  }))
}
