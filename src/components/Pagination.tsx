import Link from 'next/link'

type PaginationProps = {
  page: number
  totalPages: number
  total: number
  /** Rota base, sem query string. Ex: "/orcamentos". */
  basePath: string
  /**
   * Parâmetros adicionais a preservar na URL ao navegar entre páginas
   * (ex: busca, filtros). Valores undefined/vazios são ignorados.
   */
  extraParams?: Record<string, string | undefined>
  /**
   * [singular, plural] — usado no rodapé ("12 orçamentos · página 1 de 2").
   */
  entityLabel: readonly [singular: string, plural: string]
}

export default function Pagination({
  page,
  totalPages,
  total,
  basePath,
  extraParams,
  entityLabel,
}: PaginationProps) {
  const [singular, plural] = entityLabel

  if (totalPages <= 1) {
    return (
      <p className="text-sm text-gray-500">
        {total} {total === 1 ? singular : plural}
      </p>
    )
  }

  function buildUrl(targetPage: number): string {
    const params = new URLSearchParams()
    if (extraParams) {
      for (const [key, value] of Object.entries(extraParams)) {
        if (value) params.set(key, value)
      }
    }
    params.set('page', String(targetPage))
    return `${basePath}?${params.toString()}`
  }

  const prevDisabled = page <= 1
  const nextDisabled = page >= totalPages

  return (
    <div className="flex items-center justify-between gap-4 text-sm text-gray-600 flex-wrap">
      <span>
        {total} {total === 1 ? singular : plural} · página {page} de{' '}
        {totalPages}
      </span>
      <div className="flex items-center gap-2">
        <Link
          href={prevDisabled ? '#' : buildUrl(page - 1)}
          aria-disabled={prevDisabled}
          tabIndex={prevDisabled ? -1 : undefined}
          className={`px-3 py-1.5 rounded-md border text-sm ${
            prevDisabled
              ? 'border-gray-200 text-gray-400 pointer-events-none'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50 bg-white'
          }`}
        >
          Anterior
        </Link>
        <Link
          href={nextDisabled ? '#' : buildUrl(page + 1)}
          aria-disabled={nextDisabled}
          tabIndex={nextDisabled ? -1 : undefined}
          className={`px-3 py-1.5 rounded-md border text-sm ${
            nextDisabled
              ? 'border-gray-200 text-gray-400 pointer-events-none'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50 bg-white'
          }`}
        >
          Próxima
        </Link>
      </div>
    </div>
  )
}
