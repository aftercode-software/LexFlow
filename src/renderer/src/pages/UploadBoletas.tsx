import { useState, useMemo, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { FileText, Upload } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useAuth } from '@renderer/context/PoderJudicialContext'
import { useRecaudadores } from '@renderer/context/RecaudadoresContext'
import { AnimatedCircularProgressBar } from '@renderer/components/ui/animated-circular-progress-bar'
import { EnrichedBoleta } from '@shared/interfaces/boletas'

type TipoBoleta = 'automotores' | 'ingresos-brutos' | 'inmobiliarios' | 'multas' | 'sellos'
type TipoFiltro = 'todas' | TipoBoleta

function parseMonto(montoStr: string): number {
  return Number.parseFloat(montoStr) || 0
}

const BoletaRow = ({
  boleta,
  showExpediente
}: {
  boleta: EnrichedBoleta
  showExpediente: boolean
}) => {
  const badgeEstado = (estado: string) => {
    let colorClass = 'bg-gray-100 text-gray-600 border-gray-200'
    if (estado === 'Revisada') colorClass = 'bg-blue-50 text-blue-700 border-blue-200'
    if (estado === 'Subida') colorClass = 'bg-green-50 text-green-700 border-green-200'
    return (
      <Badge variant="outline" className={colorClass}>
        {estado}
      </Badge>
    )
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{boleta.boleta}</TableCell>
      <TableCell>{boleta.demandado.apellidoYNombre}</TableCell>
      <TableCell>{boleta.recaudador.nombre}</TableCell>
      {showExpediente && <TableCell>{boleta.expediente || '-'}</TableCell>}
      <TableCell>{boleta.fechaInicioDemanda}</TableCell>
      <TableCell>${boleta.monto}</TableCell>
      <TableCell>{badgeEstado(boleta.estado)}</TableCell>
      <TableCell>
        <button className="flex items-center hover:underline cursor-pointer">
          <FileText className="mr-2 h-4 w-4 text-gray-400" />
          {boleta.boleta}
        </button>
      </TableCell>
    </TableRow>
  )
}

export default function UploadBoletas() {
  const { userData, isAuthenticated } = useAuth()
  const { recaudadores, recaudadorPorMatricula, recargando } = useRecaudadores()

  const [selectedRecaudadorId, setSelectedRecaudadorId] = useState<number | undefined>(undefined)
  useEffect(() => {
    const m = Number(userData?.matricula)
    if (!Number.isFinite(m) || m <= 0) return
    const r = recaudadorPorMatricula(m)
    if (r) setSelectedRecaudadorId(r.id)
  }, [userData?.matricula, recaudadorPorMatricula])

  const recaudadoresFiltrados = useMemo(() => {
    const lista = recaudadores ?? []
    return lista.filter((r) => {
      const m = Number(r.matricula)
      return Number.isFinite(m) && m > 0
    })
  }, [recaudadores])

  const selectedRecaudador = useMemo(
    () => recaudadores?.find((r) => r.id === selectedRecaudadorId) ?? null,
    [recaudadores, selectedRecaudadorId]
  )

  const [loadingBoletas, setLoadingBoletas] = useState(false)
  const [boletasPorTipo, setBoletasPorTipo] = useState<Record<TipoBoleta, EnrichedBoleta[]>>({
    automotores: [],
    'ingresos-brutos': [],
    inmobiliarios: [],
    multas: [],
    sellos: []
  })

  const [dirsPorTipo, setDirsPorTipo] = useState<Record<TipoBoleta, string>>({
    automotores: '',
    'ingresos-brutos': '',
    inmobiliarios: '',
    multas: '',
    sellos: ''
  })

  useEffect(() => {
    if (!isAuthenticated) return
    if (!selectedRecaudadorId) return

    const fetchBoletas = async () => {
      setLoadingBoletas(true)
      try {
        const {
          boletasAutomotores = [],
          boletasIngresosBrutos = [],
          boletasInmobiliarios = [],
          boletasMultas = [],
          boletasSellos = [],
          dirs = {}
        } = await window.api.getBoletasToUpload(selectedRecaudadorId)

        console.log('auto', boletasAutomotores)
        setBoletasPorTipo({
          automotores: boletasAutomotores,
          'ingresos-brutos': boletasIngresosBrutos,
          inmobiliarios: boletasInmobiliarios,
          multas: boletasMultas,
          sellos: boletasSellos
        })

        setDirsPorTipo({
          automotores: dirs['automotores'] ?? '',
          'ingresos-brutos': dirs['ingresos-brutos'] ?? '',
          inmobiliarios: dirs['inmobiliarios'] ?? '',
          multas: dirs['multas'] ?? '',
          sellos: dirs['sellos'] ?? ''
        })
      } catch (err) {
        console.error('Error al obtener boletas para subir:', err)
        setBoletasPorTipo({
          automotores: [],
          'ingresos-brutos': [],
          inmobiliarios: [],
          multas: [],
          sellos: []
        })
        setDirsPorTipo({
          automotores: '',
          'ingresos-brutos': '',
          inmobiliarios: '',
          multas: '',
          sellos: ''
        })
      } finally {
        setLoadingBoletas(false)
      }
    }

    fetchBoletas()
  }, [isAuthenticated, selectedRecaudadorId])

  const [tipoSeleccionado, setTipoSeleccionado] = useState<TipoFiltro>('todas')
  const [montoThreshold, setMontoThreshold] = useState<number>(30000)
  const [modoInhibicion, setModoInhibicion] = useState<'con' | 'sin'>('con')

  const boletasActuales = useMemo(() => {
    if (tipoSeleccionado === 'todas') return Object.values(boletasPorTipo).flat()
    return boletasPorTipo[tipoSeleccionado]
  }, [tipoSeleccionado, boletasPorTipo])

  const revisadas = useMemo(
    () => boletasActuales.filter((b) => b.estado === 'Revisada'),
    [boletasActuales]
  )

  const revisadasConMonto = useMemo(() => {
    return revisadas.filter((b) => {
      const m = parseMonto(b.monto)
      return modoInhibicion === 'con' ? m >= montoThreshold : m < montoThreshold
    })
  }, [revisadas, montoThreshold, modoInhibicion])

  const boletasParaMostrar = useMemo(() => revisadasConMonto.slice(0, 25), [revisadasConMonto])

  const canUpload = useMemo(
    () => !!isAuthenticated && boletasParaMostrar.length > 0 && !!selectedRecaudadorId,
    [isAuthenticated, boletasParaMostrar.length, selectedRecaudadorId]
  )

  const handleOpenPdf = (b: EnrichedBoleta) => {
    const tipo: TipoBoleta | null =
      tipoSeleccionado !== 'todas' ? (tipoSeleccionado as TipoBoleta) : null
    const baseDir = tipo ? dirsPorTipo[tipo] : ''
    console.log('[openPDF]', { baseDir, boleta: b })
    window.api.openPdf(`${baseDir}/${b.boleta}.pdf`)
  }

  const handleUpload = async () => {
    const payload = {
      boletasAutomotores: boletasPorTipo.automotores.map((b) => b.boleta),
      boletasIngresosBrutos: boletasPorTipo['ingresos-brutos'].map((b) => b.boleta),
      boletasInmobiliarios: boletasPorTipo.inmobiliarios.map((b) => b.boleta),
      boletasMultas: boletasPorTipo.multas.map((b) => b.boleta),
      boletasSellos: boletasPorTipo.sellos.map((b) => b.boleta),

      visibles: boletasParaMostrar.map((b) => b.boleta)
    }
    console.log('[upload]', {
      selectedRecaudadorId,
      payload,
      threshold: montoThreshold,
      modoInhibicion
    })
    window.api.iniciarCargaJudicial(boletasParaMostrar, montoThreshold, modoInhibicion, false)
  }

  const showExpediente = tipoSeleccionado === 'multas'

  const counts = useMemo(
    () => ({
      automotores: boletasPorTipo.automotores.length,
      'ingresos-brutos': boletasPorTipo['ingresos-brutos'].length,
      inmobiliarios: boletasPorTipo.inmobiliarios.length,
      multas: boletasPorTipo.multas.length,
      sellos: boletasPorTipo.sellos.length
    }),
    [boletasPorTipo]
  )

  const tipoLabels: Record<TipoBoleta, string> = {
    automotores: 'Automotores',
    'ingresos-brutos': 'Ingresos Brutos',
    inmobiliarios: 'Inmobiliarios',
    multas: 'Multas',
    sellos: 'Sellos'
  }

  return (
    <div className="flex min-h-screen p-6 bg-gray-50">
      <div className="flex-1 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <aside>
            <h1 className="text-2xl font-bold">
              {selectedRecaudador ? selectedRecaudador.nombre : 'Seleccionar Recaudador'}
            </h1>
            <p className="text-sm text-gray-500">
              {loadingBoletas ? 'Cargando boletas...' : 'Boletas del recaudador'}
            </p>
          </aside>
          <Button
            className="bg-gray-900 hover:bg-gray-800"
            disabled={!canUpload || loadingBoletas}
            onClick={handleUpload}
          >
            <Upload className="mr-2 h-4 w-4" /> Subir Boletas ({boletasParaMostrar.length})
          </Button>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200 flex flex-wrap gap-6 mb-6">
          <div className="flex-1 min-w-[200px]">
            <Label className="flex flex-col space-y-2">
              <span className="text-sm font-medium">Monto mínimo para Inhibición:</span>
              <Input
                type="number"
                value={montoThreshold}
                onChange={(e) => setMontoThreshold(+e.target.value)}
                className="w-full"
              />
            </Label>
          </div>

          <div className="flex-1 min-w-[200px]">
            <Label className="flex flex-col space-y-2">
              <span className="text-sm font-medium">Filtro Inhibición:</span>
              <Select
                value={modoInhibicion}
                onValueChange={(val) => setModoInhibicion(val as 'con' | 'sin')}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar modo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="con">Con Inhibición</SelectItem>
                  <SelectItem value="sin">Sin Inhibición</SelectItem>
                </SelectContent>
              </Select>
            </Label>
          </div>

          <div className="flex-1 min-w-[200px]">
            <Label className="flex flex-col space-y-2">
              <span className="text-sm font-medium">Recaudador:</span>
              <Select
                value={selectedRecaudadorId ? String(selectedRecaudadorId) : undefined}
                onValueChange={(val) => setSelectedRecaudadorId(Number(val))}
                disabled={recargando}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={recargando ? 'Cargando...' : 'Seleccionar recaudador'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {recaudadoresFiltrados.map((r) => (
                    <SelectItem key={`${r.id}-${r.matricula}`} value={String(r.id)}>
                      {r.id} – {r.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Label>
          </div>

          <div className="flex-1 min-w-[200px]">
            <Label className="flex flex-col space-y-2">
              <span className="text-sm font-medium">Tipo de Boleta:</span>
              <Select
                value={tipoSeleccionado}
                onValueChange={(val) => setTipoSeleccionado(val as TipoFiltro)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  <SelectItem value="automotores">Automotores</SelectItem>
                  <SelectItem value="ingresos-brutos">Ingresos Brutos</SelectItem>
                  <SelectItem value="inmobiliarios">Inmobiliarios</SelectItem>
                  <SelectItem value="multas">Multas</SelectItem>
                  <SelectItem value="sellos">Sellos</SelectItem>
                </SelectContent>
              </Select>
            </Label>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
          <h3 className="text-lg font-semibold mb-6">Boletas por Tipo</h3>
          <div className="flex justify-around items-center flex-wrap gap-6">
            {(Object.keys(counts) as TipoBoleta[]).map((tipo) => (
              <article key={tipo} className="flex flex-col items-center">
                <AnimatedCircularProgressBar
                  value={counts[tipo]}
                  gaugePrimaryColor="#006BFF"
                  gaugeSecondaryColor="rgba(0, 0, 0, 0.1)"
                />
                <span className="mt-2 text-sm font-medium text-gray-700">{tipo}</span>
              </article>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold">
              {tipoSeleccionado === 'todas'
                ? 'Todas las Boletas'
                : tipoLabels[tipoSeleccionado as TipoBoleta]}{' '}
              ({boletasParaMostrar.length} de {revisadasConMonto.length} - máx. 25)
            </h3>
          </div>
          <div className="overflow-x-auto">
            {loadingBoletas ? (
              <div className="py-8 text-center text-gray-500">Cargando boletas...</div>
            ) : boletasParaMostrar.length === 0 ? (
              <div className="py-8 text-center text-gray-500">No hay boletas disponibles</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Boleta</TableHead>
                    <TableHead>Demandado</TableHead>
                    <TableHead>Recaudador</TableHead>
                    {showExpediente && <TableHead>Expediente</TableHead>}
                    <TableHead>Fecha Demanda</TableHead>
                    <TableHead>Monto</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Escrito</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {boletasParaMostrar.map((b) => (
                    <BoletaRow
                      key={b.id}
                      boleta={b}
                      showExpediente={showExpediente}
                      onOpenPdf={handleOpenPdf}
                    />
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
