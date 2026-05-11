'use client'

import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import ConfirmDialog from '@/components/ConfirmDialog'

import ObraForm from '../../obra-form'
import {
  formValuesToPayload,
  type ObraFormValues,
} from '../../obra-form-helpers'
import { deleteObra, updateObra } from './actions'

type EditarObraFormProps = {
  id: string
  defaultValues: ObraFormValues
  clienteOptions: readonly { value: string; label: string }[]
  canDelete: boolean
}

export default function EditarObraForm({
  id,
  defaultValues,
  clienteOptions,
  canDelete,
}: EditarObraFormProps) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)

  async function handleSubmit(values: ObraFormValues) {
    const result = await updateObra(id, formValuesToPayload(values))

    if (!result.ok) {
      toast.error(`Não foi possível salvar: ${result.error}`)
      return
    }

    toast.success('Obra atualizada')
    router.push(`/obras/${id}`)
    router.refresh()
  }

  async function handleDelete() {
    const result = await deleteObra(id)

    if (!result.ok) {
      toast.error(result.error)
      setShowConfirm(false)
      return
    }

    toast.success('Obra excluída')
    router.push('/obras')
    router.refresh()
  }

  return (
    <>
      <div className="space-y-4">
        <ObraForm
          defaultValues={defaultValues}
          clienteOptions={clienteOptions}
          submitLabel="Salvar alterações"
          cancelHref={`/obras/${id}`}
          onSubmit={handleSubmit}
        />

        {canDelete && (
          <div className="max-w-3xl mx-auto flex justify-end">
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              className="inline-flex items-center gap-2 text-sm font-medium text-red-700 hover:text-red-800"
            >
              <Trash2 size={16} />
              Excluir obra
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Excluir obra?"
        description="Esta ação não pode ser desfeita. Se a obra estiver vinculada a propostas, contratos, itens, NFs, pagamentos, acordos ou FDs, a exclusão será bloqueada."
        confirmLabel="Excluir"
        variant="danger"
        onConfirm={handleDelete}
      />
    </>
  )
}
