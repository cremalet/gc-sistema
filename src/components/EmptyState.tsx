import Link from 'next/link'
import { Plus, type LucideIcon } from 'lucide-react'

type EmptyStateAction = {
  label: string
  href: string
}

type EmptyStateProps = {
  icon: LucideIcon
  title: string
  description?: string
  action?: EmptyStateAction | null
}

/**
 * Estado vazio padrão pra listagens: círculo com ícone, título, descrição
 * opcional e CTA opcional (Link com ícone Plus).
 */
export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Icon size={28} className="text-gray-400" />
      </div>
      <p className="text-gray-700 mb-1">{title}</p>
      {description && (
        <p className="text-sm text-gray-500 mb-4">{description}</p>
      )}
      {action && (
        <Link
          href={action.href}
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors mt-3"
        >
          <Plus size={16} />
          {action.label}
        </Link>
      )}
    </div>
  )
}
