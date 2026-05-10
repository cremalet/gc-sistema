'use client'

import { useState } from 'react'

import Modal from './Modal'

type ConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  /** 'danger' pinta o botão de confirmar em vermelho (ações destrutivas). */
  variant?: 'default' | 'danger'
  onConfirm: () => void | Promise<void>
}

/**
 * Diálogo de confirmação. Usa Modal como chrome, gerencia loading state
 * enquanto onConfirm resolve — desabilita botões e fechar.
 */
export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  onConfirm,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    try {
      await onConfirm()
    } finally {
      setLoading(false)
    }
  }

  const confirmClass =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-700 text-white'
      : 'bg-gray-900 hover:bg-gray-800 text-white'

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      dismissible={!loading}
      footer={
        <>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${confirmClass}`}
          >
            {loading ? 'Processando...' : confirmLabel}
          </button>
        </>
      }
    >
      <p className="text-sm text-gray-600">{description}</p>
    </Modal>
  )
}
