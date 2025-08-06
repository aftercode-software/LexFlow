/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { BASE_OUTPUT_DIR } from '@shared/constants/output-dir'

type BoletaRowProps = {
  boleta: EnrichedBoleta
  type: TipoBoleta
  onOpenPdf: (path: string) => void
}
function parseMonto(montoStr: string): number {
  const normalized = montoStr.replace(/\s|\./g, '').replace(',', '.')
  return parseFloat(normalized) || 0
}

const BoletaRow: React.FC<BoletaRowProps> = ({ boleta, type, onOpenPdf }) => {
  const formatMonto = (montoStr: string) => {
    const value = parseMonto(montoStr)
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(value)
  }

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
          onClick={() => onOpenPdf(`${BASE_OUTPUT_DIR}\\boletas\\${folder}\\${boleta.boleta}.pdf`)}
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
  const [loadingRecaudadores, setLoadingRecaudadores] = useState(false)
  const [, setLoadingBoletas] = useState(false)

  const [profesionales, setProfesionales] = useState<EnrichedBoleta[]>([])
  const [terceros, setTerceros] = useState<EnrichedBoleta[]>([])

  const [tabActiva, setTabActiva] = useState<TipoBoleta>('Profesional')

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
        const { profesionales: profesionalesDesdeAPI, terceros: tercerosDesdeAPI } =
          await window.api.getBoletasToUpload(selectedRecaudadorId)

        console.log('→ RAW [profesionalesDesdeAPI]:', profesionalesDesdeAPI)
        console.log('→ RAW [tercerosDesdeAPI]:', tercerosDesdeAPI)

        setProfesionales(profesionalesDesdeAPI || [])
        setTerceros(tercerosDesdeAPI || [])
      } catch (error) {
        console.error('Error al obtener boletas:', error)
        setProfesionales([])
        setTerceros([])
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
    () => (tabActiva === 'Profesional' ? profesionales : terceros),
    [tabActiva, profesionales, terceros]
  )

  const revisadas = useMemo(
    () => boletasActuales.filter((b) => b.estado === 'Revisada').slice(0, 25),
    [boletasActuales]
  )
  const revisadasConMonto = useMemo(() => {
    return revisadas.filter((b) => {
      const m = parseMonto(b.monto)
      console.log(`→ Monto de ${b.boleta}:`, m)
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
    const oficial2 = selectedRecaudadorId === 801 ? true : false
    console.log('oficial2:', oficial2)

    window.api.iniciarCargaJudicial(boletasParaMostrar, montoThreshold, modoInhibicion, oficial2)
  }

  return (
    <div className="flex min-h-screen p-6">
      <div className="flex-1">
        {boletasParaMostrar.length}
        {/* Cabecera con nombre de usuario y botón de subir */}
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
          <Button
            disabled={!canUpload}
            className="bg-gray-900 hover:bg-lex}"
            onClick={handleUpload}
          >
            <Upload className="mr-2 h-4 w-4" /> Subir{' '}
            {tabActiva === 'Profesional' ? 'Profesionales' : 'Terceros'}
          </Button>
        </div>

        {/* Zona de filtros */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 flex gap-6 mb-6">
          {/* Monto mínimo para Inhibición */}
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

          {/* Filtro Inhibición */}
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

          {/* Select de Recaudadores filtrados */}
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
                    {/* Iteramos solo los que coinciden con la matrícula del user */}
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

        {/* Barra de progreso */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {(['Profesional', 'Tercero'] as TipoBoleta[]).map((type) => {
            const count = type === 'Profesional' ? profesionales.length : terceros.length
            const title = type === 'Profesional' ? 'Boletas Profesionales' : 'Boletas Terceros'

            return (
              <div key={type} className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium">{title}</h3>
                  <span className="text-sm font-medium">{count}</span>
                </div>
                <Progress value={(count / 25) * 100} className="h-2" />
                <p className="text-sm text-gray-500 mt-2">{count} disponibles</p>
              </div>
            )
          })}
        </div>

        {/* Tabs Profesional / Tercero */}
        <Tabs
          value={tabActiva}
          onValueChange={(v) => {
            console.log('Cambiando tab a:', v)
            setTabActiva(v as TipoBoleta)
          }}
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
            <BoletasTable boletas={boletasParaMostrar} type={tabActiva} onOpenPdf={handleOpenPdf} />
            {boletasParaMostrar.length === 0 && (
              <div className="py-8 text-center text-gray-500">No hay boletas</div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
