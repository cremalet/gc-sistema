'use client'

import { Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import ConfirmDialog from '@/components/ConfirmDialog'

import ClienteForm from '../../cliente-form'
import {
  formValuesToPayload,
  type ClienteFormValues,
} from '../../cliente-form-helpers'
import { deleteCliente, updateCliente } from './actions'

type EditarClienteFormProps = {
  id: string
  defaultValues: ClienteFormValues
  canDelete: boolean
}

export default function EditarClienteForm({
  id,
  defaultValues,
  canDelete,
}: EditarClienteFormProps) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)

  async function handleSubmit(values: ClienteFormValues) {
    const result = await updateCliente(id, formValuesToPayload(values))

    if (!result.ok) {
      toast.error(`Não foi possível salvar: ${result.error}`)
      return
    }

    toast.success('Cliente atualizado')
    router.push('/clientes')
    router.refresh()
  }

  async function handleDelete() {
    const result = await deleteCliente(id)

    if (!result.ok) {
      toast.error(result.error)
      setShowConfirm(false)
      return
    }

    toast.success('Cliente excluído')
    // O server action faz redirect — fallback se algo escapar:
    router.push('/clientes')
    router.refresh()
  }

  return (
    <>
      <div className="space-y-4">
        <ClienteForm
          defaultValues={defaultValues}
          submitLabel="Salvar alterações"
          cancelHref="/clientes"
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
              Excluir cliente
            </button>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Excluir cliente?"
        description="Esta ação não pode ser desfeita. Se o cliente estiver vinculado a algum orçamento ou obra, a exclusão será bloqueada."
        confirmLabel="Excluir"
        variant="danger"
        onConfirm={handleDelete}
      />
    </>
  )
}
