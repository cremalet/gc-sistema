import type { ObraStatus } from '@/lib/supabase/types'

const CONFIG: Record<ObraStatus, { label: string; className: string }> = {
  ativa: {
    label: 'Ativa',
    className: 'bg-green-100 text-green-700 border-green-200',
  },
  concluida: {
    label: 'Concluída',
    className: 'bg-blue-100 text-blue-700 border-blue-200',
  },
  suspensa: {
    label: 'Suspensa',
    className: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  },
  cancelada: {
    label: 'Cancelada',
    className: 'bg-gray-100 text-gray-600 border-gray-200',
  },
}

export default function StatusBadge({ status }: { status: string }) {
  const config = (CONFIG as Record<string, { label: string; className: string }>)[
    status
  ] ?? {
    label: status,
    className: 'bg-gray-100 text-gray-600 border-gray-200',
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${config.className}`}
    >
      {config.label}
    </span>
  )
}
