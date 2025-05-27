import type { ColumnDef } from '@tanstack/react-table'
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { RecaudadorEntity } from '@renderer/interface/recaudador'

interface ColumnsProps {
  onEdit: (recaudador: RecaudadorEntity) => void
  onDelete: (recaudador: RecaudadorEntity) => void
}

export const createColumns = ({
  onEdit,
  onDelete
}: ColumnsProps): ColumnDef<RecaudadorEntity>[] => [
  {
    accessorKey: 'id',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue('id')}</div>
  },
  {
    accessorKey: 'nombre',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue('nombre')}</div>
  },
  {
    accessorKey: 'sexo',
    header: 'Sexo',
    cell: ({ row }) => {
      const sexo = row.getValue('sexo') as string
      return (
        <Badge variant={sexo === 'M' ? 'default' : 'secondary'}>
          {sexo === 'M' ? 'Masculino' : 'Femenino'}
        </Badge>
      )
    }
  },
  {
    accessorKey: 'matricula',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Matrícula
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div>{row.getValue('matricula')}</div>
  },
  {
    accessorKey: 'telefono',
    header: 'Teléfono',
    cell: ({ row }) => <div>{row.getValue('telefono')}</div>
  },
  {
    accessorKey: 'celular',
    header: 'Celular',
    cell: ({ row }) => <div>{row.getValue('celular')}</div>
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => <div className="lowercase">{row.getValue('email')}</div>
  },
  {
    accessorKey: 'organismo',
    header: 'Organismo',
    cell: ({ row }) => <div>{row.getValue('organismo')}</div>
  },
  {
    accessorKey: 'oficial',
    header: 'Oficial',
    cell: ({ row }) => <div>{row.getValue('oficial')}</div>
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const recaudador = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Abrir menú</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(recaudador.id.toString())}
            >
              Copiar ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(recaudador)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(recaudador)} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]
