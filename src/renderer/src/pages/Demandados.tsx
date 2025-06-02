import { useState } from 'react'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { useDemandados } from '@renderer/hooks/use-demandados'
import { DemandadoEntity } from '@shared/interfaces/demandado'
import { createColumns } from '@renderer/components/demandados/columns'
import { DemandadosDataTable } from '@renderer/components/demandados/data-table'
import { DemandadoForm } from '@renderer/components/demandados/demandado-form'
import { DeleteConfirmation } from '@renderer/components/demandados/delete-confirmation'

export default function DemandadosPage() {
  const { allDemandados, isLoading, error, createDemandado, updateDemandado, deleteDemandado } =
    useDemandados()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedDemandado, setSelectedDemandado] = useState<DemandadoEntity | undefined>()
  const [demandadoToDelete, setDemandadoToDelete] = useState<DemandadoEntity | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleEdit = (demandado: DemandadoEntity) => {
    setSelectedDemandado(demandado)
    setIsFormOpen(true)
  }

  const handleDelete = (demandado: DemandadoEntity) => {
    setDemandadoToDelete(demandado)
    setIsDeleteOpen(true)
  }

  const handleCreateNew = () => {
    setSelectedDemandado(undefined)
    setIsFormOpen(true)
  }

  const handleFormSubmit = async (data: any) => {
    try {
      setIsSubmitting(true)
      if (selectedDemandado) {
        await updateDemandado(selectedDemandado.id, data)
      } else {
        await createDemandado(data)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteConfirm = async () => {
    if (demandadoToDelete) {
      try {
        setIsSubmitting(true)
        await deleteDemandado(demandadoToDelete.id)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const columns = createColumns({
    onEdit: handleEdit,
    onDelete: handleDelete
  })

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>Error: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="text-2xl font-bold">Gestión de Demandados</CardTitle>
          <p className="text-muted-foreground">
            Administra la información de los demandados del sistema
            {allDemandados.length > 0 && (
              <span className="ml-2 text-sm">
                ({allDemandados.length.toLocaleString()} registros total)
              </span>
            )}
          </p>
        </div>
      </div>

      <DemandadosDataTable
        columns={columns}
        data={allDemandados}
        onCreateNew={handleCreateNew}
        isLoading={isLoading}
      />

      <DemandadoForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        demandado={selectedDemandado}
        onSubmit={handleFormSubmit}
        isLoading={isSubmitting}
      />

      <DeleteConfirmation
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDeleteConfirm}
        isLoading={isSubmitting}
        itemName={demandadoToDelete?.apellidoYNombre || ''}
      />
    </div>
  )
}
