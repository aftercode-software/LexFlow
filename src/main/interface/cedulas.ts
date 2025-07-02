export type EstadoCedula = 'No Generada' |'Generada' | 'Revisada' | 'Subida'
export type TipoEscrito = 'CSM' | 'JMI'
export type TipoTribunal = 'Primero' | 'Segundo' | 'Tercero' 

export interface Cedula {
    cuij: string
    filePath: string 
    tipoEscrito: TipoEscrito
    tipoTribunal: TipoTribunal
    estado: EstadoCedula
}