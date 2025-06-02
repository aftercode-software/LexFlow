import { useState, useEffect } from 'react'

import { toast } from 'sonner'
import { createColumns } from '@renderer/components/recaudadores/Columns'
import { RecaudadoresDataTable } from '@renderer/components/recaudadores/RecaudadoresTable'
import { RecaudadorForm } from '@renderer/components/recaudadores/RecaudadorForm'
import { DeleteConfirmation } from '@renderer/components/recaudadores/DeleteConfirmation'
import {
  CreateRecaudadorDto,
  RecaudadorEntity,
  UpdateRecaudadorDto
} from '@shared/interfaces/recaudador'

export default function RecaudadoresPage() {
  const [data, setData] = useState<RecaudadorEntity[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [selectedRecaudador, setSelectedRecaudador] = useState<RecaudadorEntity | undefined>()
  const [recaudadorToDelete, setRecaudadorToDelete] = useState<RecaudadorEntity | undefined>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchData = async () => {
    try {
      const data = await window.api.getRecaudadores()
      setData(data)
      setLoading(true)
    } catch (error) {
      toast.error('No se pudieron cargar los recaudadores')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleCreate = () => {
    setSelectedRecaudador(undefined)
    setFormOpen(true)
  }

  const handleEdit = (recaudador: RecaudadorEntity) => {
    setSelectedRecaudador(recaudador)
    setFormOpen(true)
  }

  const handleDelete = (recaudador: RecaudadorEntity) => {
    setRecaudadorToDelete(recaudador)
    setDeleteOpen(true)
  }

  const handleSubmit = async (formData: CreateRecaudadorDto | UpdateRecaudadorDto) => {
    try {
      setIsSubmitting(true)
      if (selectedRecaudador) {
        await window.api.updateRecaudador(selectedRecaudador.id, formData)
        toast.success('Recaudador actualizado correctamente')
      } else {
        await window.api.createRecaudador(formData as CreateRecaudadorDto)
        toast.success('Recaudador creado correctamente')
      }
      await fetchData()
    } catch (error) {
      toast.error(
        selectedRecaudador
          ? 'No se pudo actualizar el recaudador'
          : 'No se pudo crear el recaudador'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!recaudadorToDelete) return

    try {
      setIsSubmitting(true)
      await window.api.deleteRecaudador(recaudadorToDelete.id)
      toast.success('Recaudador eliminado correctamente')
      await fetchData()
    } catch (error) {
      toast.error('No se pudo eliminar el recaudador')
    } finally {
      setIsSubmitting(false)
      setRecaudadorToDelete(undefined)
    }
  }

  const columns = createColumns({
    onEdit: handleEdit,
    onDelete: handleDelete
  })

  return (
    <div className="space-y-6 p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Gestión de Recaudadores</h1>
        <p className="text-muted-foreground">
          Administra la información de los recaudadores del sistema
        </p>
      </div>

      <RecaudadoresDataTable columns={columns} data={data} onCreateNew={handleCreate} />

      <RecaudadorForm
        open={formOpen}
        onOpenChange={setFormOpen}
        recaudador={selectedRecaudador}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />

      <DeleteConfirmation
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleConfirmDelete}
        isLoading={isSubmitting}
        itemName={recaudadorToDelete?.nombre || ''}
      />
    </div>
  )
}
