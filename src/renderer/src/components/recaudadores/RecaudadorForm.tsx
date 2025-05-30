'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import { Badge } from '@/components/ui/badge'
import { User, Phone, Mail, Building, FileText, Hash } from 'lucide-react'
import { Separator } from '@radix-ui/react-select'
import {
  CreateRecaudadorDto,
  RecaudadorEntity,
  UpdateRecaudadorDto
} from '@shared/interfaces/recaudador'

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
    id: 0,
    nombre: '',
    sexo: 'M',
    matricula: 0,
    telefono: '',
    celular: '',
    organismo: '',
    descripcion: '',
    email: '',
    oficial: '',
    idNombre: ''
  })

  const [errors, setErrors] = useState<Partial<Record<keyof CreateRecaudadorDto, string>>>({})

  // Reset form when dialog opens/closes or recaudador changes
  useEffect(() => {
    if (open) {
      setFormData({
        id: recaudador?.id || 0,
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
      setErrors({})
    }
  }, [open, recaudador])

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateRecaudadorDto, string>> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    }

    if (!formData.matricula || formData.matricula <= 0) {
      newErrors.matricula = 'La matrícula debe ser un número válido'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'El email no tiene un formato válido'
    }

    if (formData.telefono && !/^\d{8,15}$/.test(formData.telefono.replace(/\s/g, ''))) {
      newErrors.telefono = 'El teléfono debe tener entre 8 y 15 dígitos'
    }

    if (formData.celular && !/^\d{8,15}$/.test(formData.celular.replace(/\s/g, ''))) {
      newErrors.celular = 'El celular debe tener entre 8 y 15 dígitos'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await onSubmit(formData)
      onOpenChange(false)
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  const handleChange = (field: keyof CreateRecaudadorDto, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const isEditing = !!recaudador

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">
                {isEditing ? 'Editar Recaudador' : 'Crear Nuevo Recaudador'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {isEditing
                  ? 'Modifica la información del recaudador'
                  : 'Completa los datos para crear un nuevo recaudador'}
              </p>
            </div>
            {isEditing && (
              <Badge variant="secondary" className="ml-auto">
                ID: {recaudador.id}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Personal */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="space-y-2">
                    <Label htmlFor="id" className="flex items-center gap-2">
                      <Hash className="h-3 w-3" />
                      Código *
                    </Label>
                    <Input
                      id="id"
                      type="number"
                      value={formData.id || ''}
                      onChange={(e) => handleChange('id', Number.parseInt(e.target.value) || 0)}
                      className={errors.id ? 'border-destructive' : ''}
                      placeholder="80"
                    />
                    {errors.id && <p className="text-xs text-destructive">{errors.id}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="matricula" className="flex items-center gap-2">
                      <Hash className="h-3 w-3" />
                      Matrícula *
                    </Label>
                    <Input
                      id="matricula"
                      type="number"
                      value={formData.matricula || ''}
                      onChange={(e) =>
                        handleChange('matricula', Number.parseInt(e.target.value) || 0)
                      }
                      className={errors.matricula ? 'border-destructive' : ''}
                      placeholder="12345"
                    />
                    {errors.matricula && (
                      <p className="text-xs text-destructive">{errors.matricula}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre Completo *</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => handleChange('nombre', e.target.value)}
                      className={errors.nombre ? 'border-destructive' : ''}
                      placeholder="Juan Pérez García"
                    />
                    {errors.nombre && <p className="text-xs text-destructive">{errors.nombre}</p>}
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
              </CardContent>
            </Card>

            {/* Información de Contacto */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Información de Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => handleChange('telefono', e.target.value)}
                      className={errors.telefono ? 'border-destructive' : ''}
                      placeholder="555-1234"
                    />
                    {errors.telefono && (
                      <p className="text-xs text-destructive">{errors.telefono}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="celular">Celular</Label>
                    <Input
                      id="celular"
                      value={formData.celular}
                      onChange={(e) => handleChange('celular', e.target.value)}
                      className={errors.celular ? 'border-destructive' : ''}
                      placeholder="555-9876"
                    />
                    {errors.celular && <p className="text-xs text-destructive">{errors.celular}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className={errors.email ? 'border-destructive' : ''}
                      placeholder="ejemplo@correo.com"
                    />
                    {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información Institucional */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Información Institucional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="organismo">Organismo</Label>
                    <Input
                      id="organismo"
                      value={formData.organismo}
                      onChange={(e) => handleChange('organismo', e.target.value)}
                      placeholder="Ministerio de Hacienda"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="oficial">Oficial</Label>
                    <Input
                      id="oficial"
                      value={formData.oficial}
                      onChange={(e) => handleChange('oficial', e.target.value)}
                      placeholder="Cargo o posición oficial"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descripcion" className="flex items-center gap-2">
                    <FileText className="h-3 w-3" />
                    Descripción
                  </Label>
                  <Input
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => handleChange('descripcion', e.target.value)}
                    placeholder="Descripción adicional, responsabilidades, notas..."
                  />
                </div>
              </CardContent>
            </Card>
          </form>
        </div>

        <Separator />

        <DialogFooter className="pt-4">
          <div className="flex justify-between items-center w-full">
            <p className="text-xs text-muted-foreground">* Campos requeridos</p>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                onClick={handleSubmit}
                className="min-w-[100px]"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Guardando...
                  </div>
                ) : isEditing ? (
                  'Actualizar'
                ) : (
                  'Crear Recaudador'
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
