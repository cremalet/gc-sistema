'use client'

import { ArrowRightLeft, Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import ConfirmDialog from '@/components/ConfirmDialog'
import StatusBadge from '@/components/StatusBadge'
import type { OrcamentoStatus, Perfil } from '@/lib/types'

import { deleteOrcamento } from './actions'
import StatusDialog from './status-dialog'

type DetailHeaderProps = {
  id: string
  numero: string | null
  clienteNome: string
  status: OrcamentoStatus
  obraId: string | null
  perfil: Perfil
  obraOptions: readonly { value: string; label: string }[]
}

export default function DetailHeader({
  id,
  numero,
  clienteNome,
  status,
  obraId,
  perfil,
  obraOptions,
}: DetailHeaderProps) {
  const router = useRouter()
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [statusOpen, setStatusOpen] = useState(false)

  const canEdit = perfil === 'admin' || perfil === 'comercial'
  const canChangeStatus = perfil === 'admin' || perfil === 'comercial'
  const canDelete = perfil === 'admin'

  async function handleDelete() {
    const result = await deleteOrcamento(id)
    if (!result.ok) {
      toast.error(`Não foi possível excluir: ${result.error}`)
      return
    }
    toast.success('Orçamento excluído')
    router.push('/orcamentos')
    router.refresh()
  }

  return (
    <>
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {numero ? `Orçamento ${numero}` : 'Orçamento sem número'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">{clienteNome}</p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={status} />
          {canChangeStatus && (
            <button
              type="button"
              onClick={() => setStatusOpen(true)}
              className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <ArrowRightLeft size={14} />
              Mudar status
            </button>
          )}
          {canEdit && (
            <Link
              href={`/orcamentos/${id}/editar`}
              className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              <Pencil size={14} />
              Editar
            </Link>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => setDeleteOpen(true)}
              className="inline-flex items-center gap-2 bg-white border border-red-300 text-red-700 px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-50 transition-colors"
            >
              <Trash2 size={14} />
              Excluir
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir orçamento?"
        description="Esta ação não pode ser desfeita. O orçamento será removido permanentemente."
        variant="danger"
        confirmLabel="Excluir"
        onConfirm={handleDelete}
      />

      <StatusDialog
        open={statusOpen}
        onOpenChange={setStatusOpen}
        orcamentoId={id}
        currentStatus={status}
        currentObraId={obraId}
        obraOptions={obraOptions}
        onSuccess={() => router.refresh()}
      />
    </>
  )
}
