'use client'

import { useEffect, type ReactNode } from 'react'

type ModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: ReactNode
  /** Botões do rodapé. Se o body já tiver seus próprios botões (ex: form), deixe vazio. */
  footer?: ReactNode
  size?: 'sm' | 'md' | 'lg'
  /** Se false, clique fora e ESC não fecham (usar durante loading). Default true. */
  dismissible?: boolean
}

const SIZE_CLASS: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

/**
 * Modal genérico — overlay escurecido, card branco centralizado, fecha no
 * ESC e click no overlay (exceto se dismissible=false).
 */
export default function Modal({
  open,
  onOpenChange,
  title,
  children,
  footer,
  size = 'sm',
  dismissible = true,
}: ModalProps) {
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && dismissible) onOpenChange(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, dismissible, onOpenChange])

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto"
      onClick={() => dismissible && onOpenChange(false)}
    >
      <div
        className={`bg-white rounded-lg shadow-xl w-full ${SIZE_CLASS[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 pt-6">
          <h2
            id="modal-title"
            className="text-lg font-semibold text-gray-900"
          >
            {title}
          </h2>
        </div>
        <div className="px-6 py-4">{children}</div>
        {footer && (
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3 rounded-b-lg">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
