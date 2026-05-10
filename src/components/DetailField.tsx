import type { ReactNode } from 'react'

type DetailFieldProps = {
  label: string
  value: ReactNode
  /** Ex: `col-span-2` pra ocupar linha inteira. */
  className?: string
}

/**
 * Par label + valor pra telas de detalhes (read-only).
 * Valores vazios (null, undefined, '') renderizam "—" em cinza claro.
 */
export default function DetailField({
  label,
  value,
  className,
}: DetailFieldProps) {
  const isEmpty = value === null || value === undefined || value === ''
  return (
    <div className={className}>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </dt>
      <dd className="text-sm text-gray-900 mt-1 break-words">
        {isEmpty ? <span className="text-gray-400">—</span> : value}
      </dd>
    </div>
  )
}
