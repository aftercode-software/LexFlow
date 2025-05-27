import type React from 'react'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog'
import {
  CreateRecaudadorDto,
  RecaudadorEntity,
  UpdateRecaudadorDto
} from '@renderer/interface/recaudador'

interface RecaudadorFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  recaudador?: RecaudadorEntity
  onSubmit: (data: CreateRecaudadorDto | UpdateRecaudadorDto) => Promise<void>
  isLoading?: boolean
}

export function RecaudadorForm({
  open,
  onOpenChange,
  recaudador,
  onSubmit,
  isLoading
}: RecaudadorFormProps) {
  const [formData, setFormData] = useState<CreateRecaudadorDto>({
    nombre: recaudador?.nombre || '',
    sexo: recaudador?.sexo || 'M',
    matricula: recaudador?.matricula || 0,
    telefono: recaudador?.telefono || '',
    celular: recaudador?.celular || '',
    organismo: recaudador?.organismo || '',
    descripcion: recaudador?.descripcion || '',
    email: recaudador?.email || '',
    oficial: recaudador?.oficial || '',
    idNombre: recaudador?.idNombre || ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSubmit(formData)
    onOpenChange(false)
  }

  const handleChange = (field: keyof CreateRecaudadorDto, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{recaudador ? 'Editar Recaudador' : 'Crear Nuevo Recaudador'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sexo">Sexo</Label>
              <Select
                value={formData.sexo}
                onValueChange={(value: 'M' | 'F') => handleChange('sexo', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Femenino</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="matricula">Matrícula</Label>
              <Input
                id="matricula"
                type="number"
                value={formData.matricula}
                onChange={(e) => handleChange('matricula', Number.parseInt(e.target.value) || 0)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="idNombre">ID Nombre</Label>
              <Input
                id="idNombre"
                value={formData.idNombre}
                onChange={(e) => handleChange('idNombre', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => handleChange('telefono', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="celular">Celular</Label>
              <Input
                id="celular"
                value={formData.celular}
                onChange={(e) => handleChange('celular', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="oficial">Oficial</Label>
              <Input
                id="oficial"
                value={formData.oficial}
                onChange={(e) => handleChange('oficial', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="organismo">Organismo</Label>
            <Input
              id="organismo"
              value={formData.organismo}
              onChange={(e) => handleChange('organismo', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Input
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => handleChange('descripcion', e.target.value)}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : recaudador ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
