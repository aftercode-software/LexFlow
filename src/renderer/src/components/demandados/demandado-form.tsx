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
import { User, Hash, MapPin, CreditCard } from 'lucide-react'
import { DemandadoEntity, DocField } from '@shared/interfaces/demandado'
import { Separator } from '@radix-ui/react-select'
import { extraerDocumento } from '@shared/utils/document'

export interface CreateDemandadoDto {
  apellido: string
  nombre: string
  domicilio: string
  dni?: string
  cuil?: string
  cuit?: string
  tipo: 'Profesional' | 'Tercero'
  matricula?: string
}

export interface UpdateDemandadoDto extends Partial<CreateDemandadoDto> {
  id: number
  apellidoYNombre?: string
}

interface DemandadoFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  demandado?: DemandadoEntity
  onSubmit: (data: CreateDemandadoDto | UpdateDemandadoDto) => Promise<void>
  isLoading?: boolean
}

export function DemandadoForm({
  open,
  onOpenChange,
  demandado,
  onSubmit,
  isLoading
}: DemandadoFormProps) {
  const [formData, setFormData] = useState<CreateDemandadoDto>({
    apellido: '',
    nombre: '',
    domicilio: '',
    dni: '',
    cuil: '',
    cuit: '',
    tipo: 'Tercero',
    matricula: ''
  })

  const [errors, setErrors] = useState<Partial<Record<keyof CreateDemandadoDto, string>>>({})
  const [currentField, setCurrentField] = useState<DocField>('dni')
  // Reset form when dialog opens/closes or demandado changes
  useEffect(() => {
    if (!open) return

    if (demandado) {
      const docValue = demandado.numeroDocumento || ''
      let initialField: DocField = 'dni'

      // Detectamos según tipoDocumento del demandado
      if (demandado.tipoDocumento === 'DNI') {
        initialField = 'dni'
      } else if (demandado.tipoDocumento === 'CUIT') {
        initialField = 'cuit'
      }

      setCurrentField(initialField)
      setFormData({
        apellido: demandado.apellido || '',
        nombre: demandado.nombre || '',
        domicilio: demandado.domicilio || '',
        dni: initialField === 'dni' ? docValue : '',
        cuit: initialField === 'cuit' ? docValue : '',
        tipo: demandado.tipo || 'Tercero',
        matricula: demandado.matricula?.toString() || ''
      })
    } else {
      // Modo crear: restablecemos todo
      setCurrentField('dni')
      setFormData({
        apellido: '',
        nombre: '',
        domicilio: '',
        dni: '',
        cuil: '',
        cuit: '',
        tipo: 'Tercero',
        matricula: ''
      })
    }

    setErrors({})
  }, [open, demandado])

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateDemandadoDto, string>> = {}

    if (!formData.apellido.trim()) {
      newErrors.apellido = 'El apellido es requerido'
    }
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es requerido'
    }
    if (!formData.domicilio.trim()) {
      newErrors.domicilio = 'El domicilio es requerido'
    }

    // Validar que al menos uno de los tres documentos tenga valor
    const hasDocument =
      formData.dni?.trim() !== '' || formData.cuil?.trim() !== '' || formData.cuit?.trim() !== ''
    if (!hasDocument) {
      newErrors.dni = 'Debe proporcionar al menos un documento (DNI, CUIL o CUIT)'
    }

    // Si hay DNI, chequear longitud 7-8 dígitos
    if (formData.dni?.trim()) {
      const numero = formData.dni.replace(/\D/g, '')
      if (numero.length < 7 || numero.length > 8) {
        newErrors.dni = 'El DNI debe tener entre 7 y 8 dígitos'
      }
    }
    // Si hay CUIL, chequear 11 dígitos
    if (formData.cuil?.trim()) {
      const numero = formData.cuil.replace(/\D/g, '')
      if (numero.length !== 11) {
        newErrors.cuil = 'El CUIL debe tener 11 dígitos'
      }
    }
    // Si hay CUIT, chequear 11 dígitos
    if (formData.cuit?.trim()) {
      const numero = formData.cuit.replace(/\D/g, '')
      if (numero.length !== 11) {
        newErrors.cuit = 'El CUIT debe tener 11 dígitos'
      }
    }

    // Si es Profesional, la matrícula es obligatoria
    if (formData.tipo === 'Profesional' && !formData.matricula?.trim()) {
      newErrors.matricula = 'La matrícula es requerida para profesionales'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleBlurDocumento = () => {
    const valorActual = formData[currentField] || ''
    const { tipo, valor } = extraerDocumento(valorActual)

    if (tipo.toLowerCase() !== currentField) {
      // 1) Pasamos el valor limpio al nuevo campo
      setFormData((prev) => ({
        ...prev,
        [tipo.toLowerCase()]: valor,
        [currentField]: ''
      }))
      // 2) Cambiamos el campo activo
      setCurrentField(tipo.toLowerCase() as DocField)
    } else {
      // Si sigue en mismo tipo, guardamos versión solo dígitos
      setFormData((prev) => ({
        ...prev,
        [currentField]: valor
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      // Clean up the data before submitting
      const cleanData: CreateDemandadoDto = {
        apellido: formData.apellido.trim(),
        nombre: formData.nombre.trim(),
        domicilio: formData.domicilio.trim(),
        tipo: formData.tipo
      }

      // Only include document fields that have values
      if (formData.dni?.trim()) {
        cleanData.dni = formData.dni.trim()
      }
      if (formData.cuil?.trim()) {
        cleanData.cuil = formData.cuil.trim()
      }
      if (formData.cuit?.trim()) {
        cleanData.cuit = formData.cuit.trim()
      }
      if (formData.matricula?.trim()) {
        cleanData.matricula = formData.matricula.trim()
      }

      const submitData = demandado
        ? ({ ...cleanData, id: demandado.id } as UpdateDemandadoDto)
        : cleanData

      await onSubmit(submitData)
      onOpenChange(false)
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  const handleChange = (field: keyof CreateDemandadoDto, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const isEditing = !!demandado

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
                {isEditing ? 'Editar Demandado' : 'Crear Nuevo Demandado'}
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                {isEditing
                  ? 'Modifica la información del demandado'
                  : 'Completa los datos para crear un nuevo demandado'}
              </p>
            </div>
            {isEditing && (
              <Badge variant="secondary" className="ml-auto">
                ID: {demandado.id}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ">
                  <div className="space-y-2">
                    <Label htmlFor="apellido">Apellido *</Label>
                    <Input
                      id="apellido"
                      value={formData.apellido}
                      onChange={(e) => handleChange('apellido', e.target.value)}
                      className={errors.apellido ? 'border-destructive' : ''}
                      placeholder="García"
                    />
                    {errors.apellido && (
                      <p className="text-xs text-destructive">{errors.apellido}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre *</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => handleChange('nombre', e.target.value)}
                      className={errors.nombre ? 'border-destructive' : ''}
                      placeholder="Juan Carlos"
                    />
                    {errors.nombre && <p className="text-xs text-destructive">{errors.nombre}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div className="space-y-2">
                    <Label htmlFor="tipo">Tipo *</Label>
                    <Select
                      value={formData.tipo}
                      onValueChange={(value: 'Tercero' | 'Profesional') =>
                        handleChange('tipo', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Tercero">Tercero</SelectItem>
                        <SelectItem value="Profesional">Profesional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.tipo === 'Profesional' && (
                    <div className="space-y-2">
                      <Label htmlFor="matricula" className="flex items-center gap-2">
                        <Hash className="h-3 w-3" />
                        Matrícula *
                      </Label>
                      <Input
                        id="matricula"
                        value={formData.matricula || ''}
                        onChange={(e) => handleChange('matricula', e.target.value)}
                        className={errors.matricula ? 'border-destructive' : ''}
                        placeholder="1234"
                      />
                      {errors.matricula && (
                        <p className="text-xs text-destructive">{errors.matricula}</p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Información de Documentos */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Información de Documentos
                </CardTitle>
                <p className="text-sm text-muted-foreground">Proporcione al menos un documento</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={currentField}>{currentField === 'dni' ? 'DNI' : 'CUIT'}</Label>
                    <Input
                      id={currentField}
                      value={formData[currentField] || ''}
                      onChange={(e) => handleChange(currentField, e.target.value)}
                      onBlur={handleBlurDocumento}
                      className={
                        (currentField === 'dni' && errors.dni) ||
                        (currentField === 'cuit' && errors.cuit)
                          ? 'border-destructive'
                          : ''
                      }
                      placeholder={currentField === 'dni' ? '12345678' : '30123456789'}
                    />
                    {currentField === 'dni' && errors.dni && (
                      <p className="text-xs text-destructive">{errors.dni}</p>
                    )}

                    {currentField === 'cuit' && errors.cuit && (
                      <p className="text-xs text-destructive">{errors.cuit}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información de Domicilio */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Información de Domicilio
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="domicilio">Domicilio *</Label>
                  <Input
                    id="domicilio"
                    value={formData.domicilio}
                    onChange={(e) => handleChange('domicilio', e.target.value)}
                    className={errors.domicilio ? 'border-destructive' : ''}
                    placeholder="Av. Corrientes 1234, CABA"
                  />
                  {errors.domicilio && (
                    <p className="text-xs text-destructive">{errors.domicilio}</p>
                  )}
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
                  'Crear Demandado'
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
