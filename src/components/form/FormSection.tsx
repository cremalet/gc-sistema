import type { ReactNode } from 'react'

type FormSectionProps = {
  title: string
  description?: string
  children: ReactNode
}

/**
 * Seção de formulário com título, separador e grid 1→2 colunas pros campos.
 * Pra ocupar linha inteira, o FormField filho usa `className="md:col-span-2"`.
 */
export default function FormSection({
  title,
  description,
  children,
}: FormSectionProps) {
  return (
    <section className="space-y-4">
      <header className="pb-2 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
        {description && (
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        )}
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
        {children}
      </div>
    </section>
  )
}
