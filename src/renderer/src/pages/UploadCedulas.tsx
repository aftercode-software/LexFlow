import React, { useEffect, useMemo, useState } from 'react'

// Componentes de UI
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { FileText, Upload } from 'lucide-react'
import { useAuth } from '@renderer/context/PoderJudicialContext'
import { toast } from 'sonner'
import { Cedula, TipoEscrito, TipoTribunal } from '@shared/interfaces/cedulas'

interface CedulasTableProps {
  cedulas: Cedula[]
}

export const CedulasTable: React.FC<CedulasTableProps> = ({ cedulas }) => (
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>CUIJ</TableHead>
        <TableHead>Estado</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {cedulas.map((cedula) => (
        <TableRow key={cedula.cuij}>
          <TableCell className="font-medium">{cedula.cuij}</TableCell>
          <TableCell>
            <Badge>{cedula.estado}</Badge>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
)

export default function UploadCedulas() {
  const { userData, isAuthenticated } = useAuth()
  const [cedulas, setCedulas] = useState<Cedula[]>([])
  const [tipoEscrito, setTipoEscrito] = useState<TipoEscrito>('CSM')

  useEffect(() => {
  if (!isAuthenticated) return

  const fetchCedulas = async () => {
    try {
      const data = await window.api.getCedulasToUpload(userData?.matricula) // EN EL FUTURO, tu endpoint real
      setCedulas(data || [])
    } catch (error) {
      console.error('Error al obtener cédulas:', error)
      setCedulas([])
    }
  }

  fetchCedulas()
}, [isAuthenticated])


  const cedulasFiltradas = useMemo(() => {
    return cedulas.filter((c) => c.tipoEscrito === tipoEscrito)
  }, [cedulas, tipoEscrito])

  const cedulasPorTribunal = useMemo(() => {
  return {
    Primero: cedulasFiltradas.filter((c) => c.tipoTribunal === 'Primero').slice(0, 50),
    Segundo: cedulasFiltradas.filter((c) => c.tipoTribunal === 'Segundo').slice(0, 50),
    Tercero: cedulasFiltradas.filter((c) => c.tipoTribunal === 'Tercero').slice(0, 50)
  }
}, [cedulasFiltradas])

const handleUpload = () => {
  if (!isAuthenticated) return

  const gruposPorTribunal = {
    Primero: cedulasPorTribunal.Primero,
    Segundo: cedulasPorTribunal.Segundo,
    Tercero: cedulasPorTribunal.Tercero
  }

  for (const [tribunal, grupo] of Object.entries(gruposPorTribunal)) {
    if (grupo.length === 0) continue

    console.log(`➡️ Enviando ${grupo.length} cédulas al tribunal: ${tribunal}`)
    window.api.iniciarCargaCedulas(grupo, tribunal)
  }
}
  return (
  <div className="flex min-h-screen p-6">
    <div className="flex-1">
      {/* Cabecera con nombre de usuario y botón de subir */}
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
          disabled={cedulasFiltradas.length === 0}
          className="bg-gray-900 hover:bg-aftercode"
          onClick={handleUpload}
        >
          <Upload className="mr-2 h-4 w-4" /> Subir Cédulas
        </Button>
      </div>

      {/* Zona de filtros */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 flex gap-6 mb-6">
        {/* Filtro tipo de escrito */}
        <div>
          <Label className="flex items-center space-x-2">
            <span>Tipo de escrito:</span>
            <Select value={tipoEscrito} onValueChange={(val) => setTipoEscrito(val as TipoEscrito)}>
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

      {/* Barras de progreso por tribunal */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {(['Primero', 'Segundo', 'Tercero'] as TipoTribunal[]).map((tribunal) => (
          <div key={tribunal} className="bg-white p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between mb-2">
              <h3 className="font-medium">{tribunal} Tribunal</h3>
              <span className="text-sm font-medium">{cedulasPorTribunal[tribunal].length}</span>
            </div>
            <Progress value={(cedulasPorTribunal[tribunal].length / 50) * 100} className="h-2" />
            <p className="text-sm text-gray-500 mt-2">
              {cedulasPorTribunal[tribunal].length} disponibles
            </p>
          </div>
        ))}
      </div>

      {/* Tabs por tribunal */}
      <Tabs defaultValue="Primero" className="bg-white rounded-lg border border-gray-200">
        <TabsList className="w-full border-b border-gray-200">
          {(['Primero', 'Segundo', 'Tercero'] as TipoTribunal[]).map((t) => (
            <TabsTrigger key={t} value={t} className="flex-1">
              {t} Tribunal
            </TabsTrigger>
          ))}
        </TabsList>

        {(['Primero', 'Segundo', 'Tercero'] as TipoTribunal[]).map((t) => (
          <TabsContent key={t} value={t} className="p-0 overflow-x-auto">
            <CedulasTable cedulas={cedulasPorTribunal[t]} />
            {cedulasPorTribunal[t].length === 0 && (
              <div className="py-8 text-center text-gray-500">No hay cédulas</div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  </div>
)
}