'use client'

import { Pencil, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import ConfirmDialog from '@/components/ConfirmDialog'
import StatusBadge from '@/components/StatusBadge'
import type { Perfil, StatusFdPagamento } from '@/lib/types'

import { deleteFd } from './actions'

type DetailHeaderProps = {
  id: string
  pedidoDocumento: string | null
  fornecedor: string
  obraCodigo: string
  statusPgto: StatusFdPagamento
  perfil: Perfil
}

export default function DetailHeader({
  id,
  pedidoDocumento,
  fornecedor,
  obraCodigo,
  statusPgto,
  perfil,
}: DetailHeaderProps) {
  const router = useRouter()
  const [showConfirm, setShowConfirm] = useState(false)

  const canEdit = perfil === 'admin' || perfil === 'financeiro'
  const canDelete = perfil === 'admin'

  async function handleDelete() {
    const result = await deleteFd(id)
    if (!result.ok) {
      toast.error(result.error)
      setShowConfirm(false)
      return
    }
    toast.success('Lançamento excluído')
    router.push('/fd')
    router.refresh()
  }

  return (
    <>
      <header className="bg-white rounded-lg border border-gray-200 p-5 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {pedidoDocumento
              ? `FD #${pedidoDocumento}`
              : 'FD sem pedido informado'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {fornecedor} — {obraCodigo}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <StatusBadge status={statusPgto} />
          {canEdit && (
            <Link
              href={`/fd/${id}/editar`}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-gray-800"
            >
              <Pencil size={14} />
              Editar
            </Link>
          )}
          {canDelete && (
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-red-200 text-red-700 text-sm font-medium hover:bg-red-50"
            >
              <Trash2 size={14} />
              Excluir
            </button>
          )}
        </div>
      </header>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Excluir lançamento?"
        description="FD é histórico fiscal de conciliação — a exclusão é irreversível."
        confirmLabel="Excluir"
        variant="danger"
        onConfirm={handleDelete}
      />
    </>
  )
}
