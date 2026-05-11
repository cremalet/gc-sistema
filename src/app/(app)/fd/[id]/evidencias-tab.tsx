'use client'

import { ExternalLink, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import ConfirmDialog from '@/components/ConfirmDialog'
import FileUpload, { type UploadResult } from '@/components/FileUpload'
import { iconForFile } from '@/lib/file-icons'
import { formatFileSize } from '@/lib/files'
import { formatDate } from '@/lib/format'
import type { Anexo, Perfil } from '@/lib/types'

import {
  deleteEvidencia,
  getEvidenciaUrl,
  uploadEvidencia,
} from './actions'

type EvidenciasTabProps = {
  fdId: string
  evidencias: Anexo[]
  perfil: Perfil
}

const ACCEPT = 'application/pdf,image/jpeg,image/png,image/webp,image/heic,image/heif'

export default function EvidenciasTab({
  fdId,
  evidencias,
  perfil,
}: EvidenciasTabProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState<Anexo | null>(null)
  const [opening, setOpening] = useState<string | null>(null)

  const canManage = perfil === 'admin' || perfil === 'financeiro'

  async function handleUpload(file: File): Promise<UploadResult> {
    const formData = new FormData()
    formData.append('file', file)
    return uploadEvidencia(fdId, formData)
  }

  async function handleOpen(evidencia: Anexo) {
    setOpening(evidencia.path)
    const result = await getEvidenciaUrl(evidencia.path)
    setOpening(null)

    if (!result.ok) {
      toast.error(`Não foi possível abrir: ${result.error}`)
      return
    }
    window.open(result.url, '_blank', 'noopener,noreferrer')
  }

  async function handleDelete() {
    if (!deleting) return
    const result = await deleteEvidencia(fdId, deleting.path)
    if (!result.ok) {
      toast.error(`Não foi possível excluir: ${result.error}`)
      return
    }
    toast.success('Evidência excluída')
    setDeleting(null)
    router.refresh()
  }

  return (
    <div className="space-y-6">
      {evidencias.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-sm text-gray-500">
          Nenhuma evidência ainda.
          {canManage ? ' Use o campo abaixo pra adicionar.' : ''}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 divide-y divide-gray-100">
          {evidencias.map((evidencia) => {
            const Icon = iconForFile(evidencia.tipo, evidencia.nome)
            return (
              <div key={evidencia.path} className="flex items-center gap-3 p-3">
                <Icon size={20} className="text-gray-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">
                    {evidencia.nome}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(evidencia.tamanho)} · enviado em{' '}
                    {formatDate(evidencia.uploaded_at)}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpen(evidencia)}
                    disabled={opening === evidencia.path}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                  >
                    <ExternalLink size={12} />
                    {opening === evidencia.path ? 'Abrindo...' : 'Visualizar'}
                  </button>
                  {canManage && (
                    <button
                      type="button"
                      onClick={() => setDeleting(evidencia)}
                      aria-label={`Excluir ${evidencia.nome}`}
                      className="p-1 rounded text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {canManage && (
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Adicionar evidências
          </h3>
          <p className="text-xs text-gray-500 mb-3">
            PDF e imagens (JPG, PNG, WEBP, HEIC). Máximo 20MB por arquivo.
          </p>
          <FileUpload
            uploadFn={handleUpload}
            onUploaded={() => router.refresh()}
            accept={ACCEPT}
          />
        </div>
      )}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Excluir evidência?"
        description={
          deleting
            ? `"${deleting.nome}" será removida permanentemente do lançamento.`
            : ''
        }
        variant="danger"
        confirmLabel="Excluir"
        onConfirm={handleDelete}
      />
    </div>
  )
}
