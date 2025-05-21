import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { Progress } from '@/components/ui/progress'
import { Download, FileText, Upload } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@renderer/context/PoderJudicialContext'

type TipoBoleta = 'Profesional' | 'Tercero'

interface Boleta {
  id: number
  tanda?: string
  tipo: TipoBoleta
  demandado: string
  recaudador: string
  numeroJuicio?: string
  juzgado?: string
  expediente?: string
  fechaInicioDemanda: string
  monto: number
  montoEnLetras: string
  fechaSentencia?: string
  observaciones?: string
  estado: string
  fechaSubida: string
  nombreArchivo: string
}

export default function BoletasTable() {
  const { userData, logout, isAuthenticated } = useAuth()
  const [profesionales, setProfesionales] = useState<Boleta[]>([])
  const [terceros, setTerceros] = useState<Boleta[]>([])

  useEffect(() => {
    const fetchBoletas = async () => {
      const matricula = Number(userData?.matricula)
      console.log('matricula', matricula)
      const { profesionales, terceros } = await window.api.getBoletasToUpload(matricula)
      console.log('boletas', profesionales, terceros)
      setProfesionales(profesionales)
      setTerceros(terceros)
    }

    fetchBoletas()
  }, [])

  const [tabActiva, setTabActiva] = useState<TipoBoleta>('Profesional')

  const contadorProfesionales = profesionales.length
  const contadorTerceros = terceros.length

  const porcentajeProfesionales = (contadorProfesionales / 25) * 100
  const porcentajeTerceros = (contadorTerceros / 25) * 100

  const formatearMonto = (monto: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(monto)
  }

  return (
    <div className="flex min-h-screen bg-gray-50 p-6">
      <div className="flex-1 ">
        <div className="flex justify-between items-center mb-6">
          <aside className="flex flex-col">
            {isAuthenticated ? (
              <>
                <h1 className="text-2xl font-bold">{userData?.recaudador}</h1>
                <p className="text-sm text-gray-500">Mostrando boletas del recaudador logueado</p>
              </>
            ) : (
              <p className="text-sm text-gray-500">
                No estás logueado. Por favor, inicia sesión con un recaudador sus boletas.
              </p>
            )}
          </aside>

          <Button className="bg-gray-900 hover:bg-aftercode" disabled={!isAuthenticated}>
            <Upload className="mr-2 h-4 w-4" />
            Subir {tabActiva === 'Profesional' ? 'profesionales' : 'terceros'}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between mb-2">
              <h3 className="font-medium">Boletas Profesionales</h3>
              <span className="text-sm font-medium">{contadorProfesionales}/25</span>
            </div>
            <Progress value={porcentajeProfesionales} className="h-2" />
            <p className="text-sm text-gray-500 mt-2">
              {contadorProfesionales} boletas disponibles para subir
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between mb-2">
              <h3 className="font-medium">Boletas Terceros</h3>
              <span className="text-sm font-medium">{contadorTerceros}/25</span>
            </div>
            <Progress value={porcentajeTerceros} className="h-2" />
            <p className="text-sm text-gray-500 mt-2">
              {contadorTerceros} boletas disponibles para subir
            </p>
          </div>
        </div>

        {/* Tabs y tabla */}
        <Tabs
          defaultValue="Profesional"
          value={tabActiva}
          onValueChange={(value) => setTabActiva(value as TipoBoleta)}
          className="bg-white rounded-lg border border-gray-200"
        >
          <TabsList className="w-full border-b border-gray-200 rounded-t-lg rounded-b-none">
            <TabsTrigger value="Profesional" className="flex-1">
              Profesionales
            </TabsTrigger>
            <TabsTrigger value="Tercero" className="flex-1">
              Terceros
            </TabsTrigger>
          </TabsList>

          <TabsContent value="Profesional" className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Boleta</TableHead>
                    <TableHead>Demandado</TableHead>
                    <TableHead>Recaudador</TableHead>
                    <TableHead>Fecha Demanda</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Archivo</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profesionales.map((boleta) => (
                    <TableRow key={boleta.id}>
                      <TableCell className="font-medium">{boleta.id}</TableCell>
                      <TableCell>{boleta.demandado}</TableCell>
                      <TableCell>{boleta.recaudador}</TableCell>
                      <TableCell>{boleta.fechaInicioDemanda}</TableCell>
                      <TableCell>{formatearMonto(boleta.monto)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          {boleta.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <FileText className="mr-2 h-4 w-4 text-gray-400" />
                          {boleta.nombreArchivo}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {profesionales.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  No se encontraron boletas profesionales
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="Tercero" className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Boleta</TableHead>
                    <TableHead>Demandado</TableHead>
                    <TableHead>Recaudador</TableHead>
                    <TableHead>Expediente</TableHead>
                    <TableHead>Fecha Demanda</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Archivo</TableHead>
                    <TableHead>Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {terceros.map((boleta) => (
                    <TableRow key={boleta.id}>
                      <TableCell className="font-medium">{boleta.id}</TableCell>
                      <TableCell>{boleta.demandado}</TableCell>
                      <TableCell>{boleta.recaudador}</TableCell>
                      <TableCell>{boleta.expediente || '-'}</TableCell>
                      <TableCell>{boleta.fechaInicioDemanda}</TableCell>
                      <TableCell>{formatearMonto(boleta.monto)}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200"
                        >
                          {boleta.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <FileText className="mr-2 h-4 w-4 text-gray-400" />
                          {boleta.nombreArchivo}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {terceros.length === 0 && (
                <div className="py-8 text-center text-gray-500">
                  No se encontraron boletas de terceros
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
