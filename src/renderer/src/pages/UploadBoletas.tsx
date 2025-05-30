import React, { useEffect, useState, useMemo } from 'react'
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
import { FileText, Upload } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@renderer/context/PoderJudicialContext'
import { toast } from 'sonner'
import { EnrichedBoleta, TipoBoleta, EstadoBoleta } from '@renderer/interface/boleta'

type BoletaRowProps = {
  boleta: EnrichedBoleta
  type: TipoBoleta
  onOpenPdf: (path: string) => void
}
const BoletaRow: React.FC<BoletaRowProps> = ({ boleta, type, onOpenPdf }) => {
  const formatMonto = (monto: string) =>
    new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(Number(monto))

  const badgeEstado = (estado: EstadoBoleta) => {
    let colorClass = 'bg-gray-100 text-gray-600 border-gray-200'
    if (estado === 'Revisada') colorClass = 'bg-blue-50 text-blue-700 border-blue-200'
    if (estado === 'Subida') colorClass = 'bg-green-50 text-green-700 border-green-200'
    return (
      <Badge variant="outline" className={colorClass}>
        {estado}
      </Badge>
    )
  }

  const folder = type === 'Tercero' ? 'terceros' : 'profesionales'

  return (
    <TableRow>
      <TableCell className="font-medium">{boleta.boleta}</TableCell>
      <TableCell>{boleta.demandado.apellidoYNombre}</TableCell>
      <TableCell>{boleta.recaudador.idNombre}</TableCell>
      {type === 'Tercero' && <TableCell>{boleta.expediente || '-'}</TableCell>}
      <TableCell>{boleta.fechaInicioDemanda}</TableCell>
      <TableCell>{formatMonto(boleta.monto)}</TableCell>
      <TableCell>{badgeEstado(boleta.estado)}</TableCell>
      <TableCell>
        <a
          className="flex items-center hover:underline cursor-pointer"
          onClick={() => onOpenPdf(`C:\\boletas\\${folder}\\${boleta.boleta}.pdf`)}
        >
          <FileText className="mr-2 h-4 w-4 text-gray-400" />
          {boleta.boleta}
        </a>
      </TableCell>
    </TableRow>
  )
}

interface BoletasTableProps {
  boletas: EnrichedBoleta[]
  type: TipoBoleta
  onOpenPdf: (path: string) => void
}
const BoletasTable: React.FC<BoletasTableProps> = ({ boletas, type, onOpenPdf }) => {
  const headers = useMemo(
    () =>
      type === 'Profesional'
        ? ['Boleta', 'Demandado', 'Recaudador', 'Fecha Demanda', 'Monto', 'Estado', 'Escrito']
        : [
            'Boleta',
            'Demandado',
            'Recaudador',
            'Expediente',
            'Fecha Demanda',
            'Monto',
            'Estado',
            'Escrito'
          ],
    [type]
  )

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {headers.map((h) => (
            <TableHead key={h}>{h}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {boletas.map((b) => (
          <BoletaRow key={b.id} boleta={b} type={type} onOpenPdf={onOpenPdf} />
        ))}
      </TableBody>
    </Table>
  )
}

export default function UploadBoletas() {
  const { userData, isAuthenticated } = useAuth()
  const [profesionales, setProfesionales] = useState<EnrichedBoleta[]>([])
  const [terceros, setTerceros] = useState<EnrichedBoleta[]>([])
  const [tabActiva, setTabActiva] = useState<TipoBoleta>('Profesional')
  const [montoThreshold, setMontoThreshold] = useState<number>(30000)
  const [modoInhibicion, setModoInhibicion] = useState<'con' | 'sin'>('con')
  useEffect(() => {
    const fetchBoletas = async () => {
      const mat = Number(userData?.matricula)
      if (!mat) return
      const { profesionales, terceros } = await window.api.getBoletasToUpload(mat)
      setProfesionales(profesionales)
      setTerceros(terceros)
    }
    fetchBoletas()
  }, [userData])

  useEffect(() => {
    if (!isAuthenticated) {
      toast.warning('No estás logueado. Inicia sesión para ver boletas.')
    }
  }, [isAuthenticated])

  const boletasActuales = useMemo(
    () => (tabActiva === 'Profesional' ? profesionales : terceros),
    [tabActiva, profesionales, terceros]
  )

  const revisadas = useMemo(
    () => boletasActuales.filter((b) => b.estado === 'Revisada').slice(0, 25),
    [boletasActuales]
  )

  const revisadasConMonto = useMemo(() => {
    return revisadas.filter((b) => {
      const m = Number(b.monto)
      return modoInhibicion === 'con' ? m >= montoThreshold : m < montoThreshold
    })
  }, [revisadas, montoThreshold, modoInhibicion])
  const canUpload = useMemo(
    () => isAuthenticated && revisadasConMonto.length > 0,
    [isAuthenticated, revisadasConMonto]
  )

  const handleOpenPdf = (path: string) => {
    window.api.openPdf(path)
  }

  const handleUpload = () => {
    window.api.iniciarCargaJudicial(revisadasConMonto, montoThreshold, modoInhibicion)
  }

  return (
    <div className="flex min-h-screen bg-gray-50 p-6">
      <div className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <aside>
            {isAuthenticated ? (
              <>
                <h1 className="text-2xl font-bold">{userData?.recaudador}</h1>
                <p className="text-sm text-gray-500">Boletas del recaudador</p>
              </>
            ) : (
              <p className="text-sm text-gray-500">Inicia sesión para ver boletas</p>
            )}
          </aside>
          <div className="flex items-center space-x-4 mb-4"></div>
          <Button
            disabled={!canUpload}
            className="bg-gray-900 hover:bg-aftercode"
            onClick={handleUpload}
          >
            <Upload className="mr-2 h-4 w-4" /> Subir{' '}
            {tabActiva === 'Profesional' ? 'Profesionales' : 'Terceros'}
          </Button>
        </div>
        <div className="mb-6">
          <label className="flex items-center space-x-2">
            <span>Monto minimo para Inhibición:</span>
            <input
              type="number"
              value={montoThreshold}
              onChange={(e) => setMontoThreshold(+e.target.value)}
              className="w-24 border rounded px-2 py-1"
            />
          </label>
        </div>
        <div className="mb-6">
          <label className="flex items-center space-x-2">
            <span>Filtro Inhibición:</span>
            <select
              value={modoInhibicion}
              onChange={(e) => setModoInhibicion(e.target.value as any)}
              className="border rounded px-2 py-1"
            >
              <option value="con">Con Inhibición</option>
              <option value="sin">Sin Inhibición</option>
            </select>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          {(['Profesional', 'Tercero'] as TipoBoleta[]).map((type) => {
            const count = revisadasConMonto.filter((b) => tabActiva === type).length
            const title = type === 'Profesional' ? 'Boletas Profesionales' : 'Boletas Terceros'

            return (
              <div key={type} className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium">{title}</h3>
                  <span className="text-sm font-medium">{count}/25</span>
                </div>
                <Progress value={(count / 25) * 100} className="h-2" />
                <p className="text-sm text-gray-500 mt-2">{count} disponibles</p>
              </div>
            )
          })}
        </div>

        <Tabs
          value={tabActiva}
          onValueChange={(v) => setTabActiva(v as TipoBoleta)}
          className="bg-white rounded-lg border border-gray-200"
        >
          <TabsList className="w-full border-b border-gray-200">
            <TabsTrigger value="Profesional" className="flex-1">
              Profesionales
            </TabsTrigger>
            <TabsTrigger value="Tercero" className="flex-1">
              Terceros
            </TabsTrigger>
          </TabsList>

          <TabsContent value={tabActiva} className="p-0 overflow-x-auto">
            <BoletasTable boletas={revisadasConMonto} type={tabActiva} onOpenPdf={handleOpenPdf} />
            {revisadasConMonto.length === 0 && (
              <div className="py-8 text-center text-gray-500">No hay boletas</div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
