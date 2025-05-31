/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

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
import { DemandadoEntity } from '@shared/interfaces/demandado'

interface ColumnsProps {
  onEdit: (demandado: DemandadoEntity) => void
  onDelete: (demandado: DemandadoEntity) => void
}

export const createColumns = ({ onEdit, onDelete }: ColumnsProps): ColumnDef<DemandadoEntity>[] => [
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
    accessorKey: 'apellidoYNombre',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Apellido y Nombre
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue('apellidoYNombre')}</div>
  },
  {
    accessorKey: 'tipoDocumento',
    header: 'Tipo Doc.',
    cell: ({ row }) => {
      const tipo = row.getValue('tipoDocumento') as string
      let badgeClass = ''
      let badgeColor = ''
      switch (tipo.toLowerCase()) {
        case 'cuit':
          badgeClass = 'bg-green-100 text-green-800 border-green-200'
          badgeColor = 'success'
          break
        case 'dni':
          badgeClass = 'bg-blue-100 text-blue-800 border-blue-200'
          badgeColor = 'info'
          break
        case 'cuil':
          badgeClass = 'bg-orange-100 text-orange-800 border-orange-200'
          badgeColor = 'warning'
          break
        default:
          badgeClass = ''
          badgeColor = 'secondary'
      }
      return (
        <Badge className={badgeClass} variant={badgeColor as any}>
          {tipo}
        </Badge>
      )
    }
  },
  {
    accessorKey: 'numeroDocumento',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Número Documento
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div>{row.getValue('numeroDocumento')}</div>
  },
  {
    accessorKey: 'tipo',
    header: 'Tipo',
    cell: ({ row }) => {
      const tipo = row.getValue('tipo') as string
      return <Badge variant={tipo === 'Profesional' ? 'default' : 'secondary'}>{tipo}</Badge>
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
    cell: ({ row }) => {
      const matricula = row.getValue('matricula') as number | undefined
      return <div>{matricula || '-'}</div>
    }
  },
  {
    accessorKey: 'domicilio',
    header: 'Domicilio',
    cell: ({ row }) => (
      <div className="max-w-[200px] truncate" title={row.getValue('domicilio')}>
        {row.getValue('domicilio')}
      </div>
    )
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      const demandado = row.original

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
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onEdit(demandado)}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(demandado)} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  }
]
