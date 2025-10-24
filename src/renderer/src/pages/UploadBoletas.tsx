/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useMemo } from 'react'
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
import { EnrichedBoleta, EstadoBoleta } from '@renderer/interface/boleta'
import { RecaudadorEntity } from '@shared/interfaces/recaudador'
import { Label } from '@renderer/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@renderer/components/ui/select'
import { Input } from '@renderer/components/ui/input'

type TabKey = 'Todas' | 'Multas'

type BoletaRowProps = {
  boleta: EnrichedBoleta
  showExpediente: boolean
  pdfDir: string
  onOpenPdf: (path: string) => void
}

function parseMonto(montoStr: string): number {
  return parseFloat(montoStr) || 0
}

const BoletaRow = ({ boleta, showExpediente, pdfDir, onOpenPdf }: BoletaRowProps) => {
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

  const pdfPath = `${pdfDir}\\${boleta.boleta}.pdf`

  return (
    <TableRow>
      <TableCell className="font-medium">{boleta.boleta}</TableCell>
      <TableCell>{boleta.demandado.apellidoYNombre}</TableCell>
      <TableCell>{boleta.recaudador.idNombre}</TableCell>
      {showExpediente && <TableCell>{boleta.expediente || '-'}</TableCell>}
      <TableCell>{boleta.fechaInicioDemanda}</TableCell>
      <TableCell>${boleta.monto}</TableCell>
      <TableCell>{badgeEstado(boleta.estado)}</TableCell>
      <TableCell>
        <a
          className="flex items-center hover:underline cursor-pointer"
          onClick={() => onOpenPdf(pdfPath)}
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
  showExpediente: boolean
  pdfDir: string
  onOpenPdf: (path: string) => void
}

const BoletasTable = ({ boletas, showExpediente, pdfDir, onOpenPdf }: BoletasTableProps) => {
  const headers = useMemo(
    () =>
      showExpediente
        ? [
            'Boleta',
            'Demandado',
            'Recaudador',
            'Expediente',
            'Fecha Demanda',
            'Monto',
            'Estado',
            'Escrito'
          ]
        : ['Boleta', 'Demandado', 'Recaudador', 'Fecha Demanda', 'Monto', 'Estado', 'Escrito'],
    [showExpediente]
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
          <BoletaRow
            key={b.id}
            boleta={b}
            showExpediente={showExpediente}
            pdfDir={pdfDir}
            onOpenPdf={onOpenPdf}
          />
        ))}
      </TableBody>
    </Table>
  )
}

export default function UploadBoletas() {
  const { userData, isAuthenticated } = useAuth()
  const [loadingRecaudadores, setLoadingRecaudadores] = useState(false)
  const [, setLoadingBoletas] = useState(false)

  const [todas, setTodas] = useState<EnrichedBoleta[]>([])
  const [multas, setMultas] = useState<EnrichedBoleta[]>([])

  const [otrosDir, setOtrosDir] = useState<string>('') // dir para "Todas"
  const [multasDir, setMultasDir] = useState<string>('') // dir para "Multas"

  const [tabActiva, setTabActiva] = useState<TabKey>('Todas')

  const [montoThreshold, setMontoThreshold] = useState<number>(30000)
  const [modoInhibicion, setModoInhibicion] = useState<'con' | 'sin'>('con')

  const [recaudadores, setRecaudadores] = useState<RecaudadorEntity[]>([])
  const [selectedRecaudadorId, setSelectedRecaudadorId] = useState<number>(0)

  useEffect(() => {
    if (!isAuthenticated) return

    const fetchRecaudadores = async () => {
      setLoadingRecaudadores(true)
      try {
        const lista = (await window.api.getRecaudadores()) as RecaudadorEntity[]
        setRecaudadores(lista)
      } catch (error) {
        console.error('Error al obtener recaudadores:', error)
      } finally {
        setLoadingRecaudadores(false)
      }
    }
    fetchRecaudadores()
  }, [isAuthenticated])

  const recaudadoresFiltrados = recaudadores.filter(
    (r) => r.matricula === Number(userData?.matricula)
  )

  useEffect(() => {
    if (!isAuthenticated) return
    if (selectedRecaudadorId === 0) return

    const fetchBoletas = async () => {
      setLoadingBoletas(true)
      try {
        const {
          boletasTodas,
          boletasMultas,
          multasDir: mDir,
          otrosDir: oDir
        } = await window.api.getBoletasToUpload(selectedRecaudadorId)

        console.log('→ RAW [boletasTodas]:', todas)
        console.log('→ RAW [boletasMultas]:', boletasMultas)

        setTodas(boletasTodas || [])
        setMultas(boletasMultas || [])
        setMultasDir(mDir || '')
        setOtrosDir(oDir || '')
      } catch (error) {
        console.error('Error al obtener boletas:', error)
        setTodas([])
        setMultas([])
        setMultasDir('')
        setOtrosDir('')
      } finally {
        setLoadingBoletas(false)
      }
    }

    fetchBoletas()
  }, [isAuthenticated, selectedRecaudadorId])

  useEffect(() => {
    if (!isAuthenticated) {
      toast.warning('No estás logueado. Inicia sesión para ver boletas.')
    }
  }, [isAuthenticated])

  const boletasActuales = useMemo(
    () => (tabActiva === 'Todas' ? todas : multas),
    [tabActiva, todas, multas]
  )

  const revisadas = useMemo(
    () => boletasActuales.filter((b) => b.estado === 'Revisada').slice(0, 25),
    [boletasActuales]
  )

  const revisadasConMonto = useMemo(() => {
    return revisadas.filter((b) => {
      const m = parseMonto(b.monto)
      return modoInhibicion === 'con' ? m >= montoThreshold : m < montoThreshold
    })
  }, [revisadas, montoThreshold, modoInhibicion])

  const boletasParaMostrar = revisadasConMonto

  const canUpload = useMemo(
    () => isAuthenticated && boletasParaMostrar.length > 0 && selectedRecaudadorId !== 0,
    [isAuthenticated, boletasParaMostrar, selectedRecaudadorId]
  )

  const handleOpenPdf = (path: string) => {
    window.api.openPdf(path)
  }

  const handleUpload = () => {
    const oficial2 = selectedRecaudadorId === 801
    console.log('oficial2:', oficial2)
    window.api.iniciarCargaJudicial(boletasParaMostrar, montoThreshold, modoInhibicion, oficial2)
  }

  const countTodas = todas.length
  const countMultas = multas.length

  const currentPdfDir = tabActiva === 'Multas' ? multasDir : otrosDir
  const showExpediente = tabActiva === 'Multas' // si solo querés mostrar expediente en Multas

  return (
    <div className="flex min-h-screen p-6">
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
          <Button disabled={!canUpload} className="bg-gray-900 hover:bg-lex" onClick={handleUpload}>
            <Upload className="mr-2 h-4 w-4" /> Subir {tabActiva}
          </Button>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 flex gap-6 mb-6">
          <div>
            <Label className="flex items-center space-x-2">
              <span>Monto mínimo para Inhibición:</span>
              <Input
                type="number"
                value={montoThreshold}
                onChange={(e) => setMontoThreshold(+e.target.value)}
                className="w-24"
              />
            </Label>
          </div>

          <div>
            <Label className="flex items-center space-x-2">
              <span>Filtro Inhibición:</span>
              <Select
                value={modoInhibicion}
                onValueChange={(val) => setModoInhibicion(val as 'con' | 'sin')}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Seleccionar modo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="con">Con Inhibición</SelectItem>
                  <SelectItem value="sin">Sin Inhibición</SelectItem>
                </SelectContent>
              </Select>
            </Label>
          </div>

          <div>
            <Label className="flex items-center space-x-2">
              <span>Recaudador:</span>
              {loadingRecaudadores ? (
                <span>Cargando recaudadores...</span>
              ) : (
                <Select
                  value={String(selectedRecaudadorId)}
                  onValueChange={(val) => setSelectedRecaudadorId(Number(val))}
                >
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Seleccionar recaudador" />
                  </SelectTrigger>
                  <SelectContent>
                    {recaudadoresFiltrados.map((r) => (
                      <SelectItem key={r.id} value={String(r.id)}>
                        {r.id} – {r.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </Label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          {[
            { key: 'Todas' as const, count: countTodas, title: 'Todas las boletas' },
            { key: 'Multas' as const, count: countMultas, title: 'Boletas de Multa' }
          ].map(({ key, count, title }) => (
            <div key={key} className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between mb-2">
                <h3 className="font-medium">{title}</h3>
                <span className="text-sm font-medium">{count}</span>
              </div>
              <Progress value={(count / 25) * 100} className="h-2" />
              <p className="text-sm text-gray-500 mt-2">{count} disponibles</p>
            </div>
          ))}
        </div>

        <Tabs
          value={tabActiva}
          onValueChange={(v) => setTabActiva(v as TabKey)}
          className="bg-white rounded-lg border border-gray-200"
        >
          <TabsList className="w-full border-b border-gray-200">
            <TabsTrigger value="Todas" className="flex-1">
              Todas
            </TabsTrigger>
            <TabsTrigger value="Multas" className="flex-1">
              Multas
            </TabsTrigger>
          </TabsList>

          <TabsContent value={tabActiva} className="p-0 overflow-x-auto">
            <BoletasTable
              boletas={boletasParaMostrar}
              showExpediente={showExpediente}
              pdfDir={currentPdfDir}
              onOpenPdf={handleOpenPdf}
            />
            {boletasParaMostrar.length === 0 && (
              <div className="py-8 text-center text-gray-500">No hay boletas</div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
