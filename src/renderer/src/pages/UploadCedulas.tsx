import React, { useEffect, useMemo, useState } from 'react'
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
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@renderer/context/PoderJudicialContext'
import { toast } from 'sonner'
import { CedulaFiltrada, TipoEscrito } from '@shared/interfaces/cedulas'
import { FileText, Upload } from 'lucide-react'
import { TribunalKey } from '@shared/interfaces/boletas'
import { BASE_OUTPUT_DIR } from '@shared/constants/output-dir'

interface CedulasTableProps {
  cedulas: CedulaFiltrada[]
  tribunal: TribunalKey
  onOpenPdf: (path: string) => void
}
const tribunales: { key: TribunalKey; label: string }[] = [
  { key: 'primer', label: 'Primero' },
  { key: 'segundo', label: 'Segundo' },
  { key: 'tercer', label: 'Tercero' }
]

const CedulasTable: React.FC<CedulasTableProps> = ({ cedulas, tribunal, onOpenPdf }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Demandado</TableHead>
        <TableHead>Boleta</TableHead>
        <TableHead>CUIJ</TableHead>
        <TableHead>Juicio</TableHead>
        <TableHead>Estado</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {cedulas.map((cedula) => (
        <TableRow key={cedula.cuij}>
          <TableCell className="font-medium">{cedula.demandado}</TableCell>
          <TableCell className="font-medium">{cedula.boleta}</TableCell>
          <TableCell>
            <a
              className="flex items-center hover:underline cursor-pointer"
              onClick={() =>
                onOpenPdf(`${BASE_OUTPUT_DIR}\\cedulas\\${tribunal}\\${cedula.cuij}.pdf`)
              }
            >
              <FileText className="mr-2 h-4 w-4 text-gray-400" />
              {cedula.cuij}
            </a>
          </TableCell>
          <TableCell className="font-medium">{cedula.juicio}</TableCell>
          <TableCell>
            <Badge className="bg-lex/30 text-blue-800">{cedula.estado}</Badge>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
)

export default function UploadCedulas() {
  const { userData, isAuthenticated } = useAuth()
  const [cedulas, setCedulas] = useState<CedulaFiltrada[]>([])
  const [tipoEscrito, setTipoEscrito] = useState<TipoEscrito>('CSM')
  const [activeTribunal, setActiveTribunal] = useState<TribunalKey>(tribunales[0].key)

useEffect(() => {
  if (!isAuthenticated || !userData?.matricula) return

  const fetchCedulas = async () => {
    try {
      const listas = await window.api.getCedulasFiltradas(Number(userData.matricula))
      setCedulas(listas)
    } catch (error) {
      console.error('Error al obtener cédulas:', error)
      toast.error('Error al obtener cédulas')
      setCedulas([])
    }
  }

  fetchCedulas()
}, [isAuthenticated, userData?.matricula])

  const handleOpenPdf = (path: string) => {
    window.api.openPdf(path)
  }

  const cedulasFiltradas = useMemo(() => {
    console.log('cedukas', cedulas)
    return cedulas.filter((c) => c.tipoEscrito === tipoEscrito)
  }, [cedulas, tipoEscrito])

  const cedulasPorTribunal = useMemo(() => {
    return tribunales.reduce(
      (acc, { key }) => {
        acc[key] = cedulasFiltradas.filter((c) => c.tipoTribunal === key).slice(0, 50)
        return acc
      },
      {} as Record<TribunalKey, CedulaFiltrada[]>
    )
  }, [cedulasFiltradas])

  const handleUpload = async () => {
  const cedulasFiltradasPorTipoYTribunal = cedulas.filter(
  (c) => c.tipoEscrito === tipoEscrito && c.tipoTribunal === activeTribunal
)

  if (cedulasFiltradasPorTipoYTribunal.length === 0) {
    toast.warning('No hay cédulas para subir.')
    return
  }

  try {
    toast.info(`Subiendo ${cedulasFiltradasPorTipoYTribunal.length} cédulas tipo ${tipoEscrito}...`)
    await window.api.iniciarCargaCedulas(cedulasFiltradasPorTipoYTribunal, tipoEscrito, activeTribunal)
    toast.success('Carga de cédulas finalizada.')
  } catch (err) {
    console.error('❌ Error al subir cédulas:', err)
    toast.error('Error durante la carga de cédulas.')
  }
}


  return (
    <div className="flex min-h-screen p-6">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <aside>
            {isAuthenticated ? (
              <>
                <h1 className="text-2xl font-bold">{userData?.recaudador}</h1>
                <p className="text-sm text-gray-500">Cédulas del recaudador</p>
              </>
            ) : (
              <p className="text-sm text-gray-500">Inicia sesión para ver cédulas</p>
            )}
          </aside>
          <Button
            disabled={cedulasPorTribunal[activeTribunal].length === 0}
            className="bg-gray-900 hover:bg-lex-700"
            onClick={handleUpload}
          >
            <Upload className="mr-2 h-4 w-4" /> Subir Cédulas
          </Button>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 flex gap-6 mb-6">
          <div>
            <Label className="flex items-center space-x-2">
              <span>Tipo de escrito:</span>
              <Select
                value={tipoEscrito}
                onValueChange={(val) => setTipoEscrito(val as TipoEscrito)}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CSM">CSM</SelectItem>
                  <SelectItem value="JMI">JMI</SelectItem>
                </SelectContent>
              </Select>
            </Label>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6 mb-6">
          {tribunales.map(({ key }) => {
            const list = cedulasPorTribunal[key]
            return (
              <div key={key} className="bg-white p-4 rounded-lg border">
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium">
                    {key.charAt(0).toUpperCase() + key.slice(1)} Tribunal
                  </h3>
                  <span className="text-sm font-medium">{list.length}</span>
                </div>
                <Progress value={list.length} max={50} className="h-2" />
                <p className="text-sm text-gray-500 mt-2">{list.length} de 50 disponibles</p>
              </div>
            )
          })}
        </div>

        <Tabs
          value={activeTribunal}
          onValueChange={(val) => setActiveTribunal(val as TribunalKey)}
          className="bg-white rounded-lg border"
        >
          <TabsList className="w-full border-b border-gray-200">
            <TabsContent key="raw" value="raw" className="p-0 overflow-x-auto">
              <CedulasTable cedulas={cedulas} tribunal={activeTribunal} onOpenPdf={handleOpenPdf} />
              {cedulas.length === 0 && (
                <div className="py-8 text-center text-gray-500">No hay cédulas</div>
              )}
            </TabsContent>
            {tribunales.map(({ key }) => (
              <TabsTrigger key={key} value={key} className="flex-1">
                {key.charAt(0).toUpperCase() + key.slice(1)} Tribunal
              </TabsTrigger>
            ))}
          </TabsList>

          {tribunales.map(({ key }) => (
            <TabsContent key={key} value={key} className="p-0 overflow-x-auto">
              <CedulasTable
                cedulas={cedulasPorTribunal[key]}
                tribunal={activeTribunal}
                onOpenPdf={handleOpenPdf}
              />
              {cedulasPorTribunal[key].length === 0 && (
                <div className="py-8 text-center text-gray-500">No hay cédulas</div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
</div>
)
}
