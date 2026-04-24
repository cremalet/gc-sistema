import { Building2, Plus } from 'lucide-react'
import Link from 'next/link'

import { getCurrentProfile } from '@/lib/supabase/profile'
import { createClient } from '@/lib/supabase/server'
import type { ObraListItem, ObraStatus } from '@/lib/supabase/types'

import ObrasFilters from './filters'
import ObrasTable from './obras-table'

const PAGE_SIZE = 20

const VALID_STATUS: readonly ObraStatus[] = [
  'ativa',
  'concluida',
  'suspensa',
  'cancelada',
]

function isValidStatus(v: string): v is ObraStatus {
  return (VALID_STATUS as readonly string[]).includes(v)
}

type SearchParams = {
  q?: string
  status?: string
  page?: string
}

export default async function ObrasPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const profile = await getCurrentProfile()
  const canCreate =
    profile?.perfil === 'admin' || profile?.perfil === 'comercial'

  const page = Math.max(1, Number.parseInt(searchParams.page ?? '1', 10) || 1)
  const q = searchParams.q?.trim() ?? ''
  const statusFilter = searchParams.status ?? ''

  const supabase = createClient()

  let query = supabase
    .from('obras_com_valores')
    .select(
      'id, empresa_id, codigo_obra, nome, cliente, cidade, status, valor_final_calculado, data_inicio, data_prevista_fim, data_real_fim, created_at, updated_at, desconto_calculado, valor_total_calculado, pct_sinal_calculado, pct_fd_calculado, pct_entrega_material_calculado, pct_medicao_instalacao_calculado',
      { count: 'exact' },
    )
    .order('created_at', { ascending: false })

  if (q) {
    query = query.or(
      `nome.ilike.%${q}%,codigo_obra.ilike.%${q}%,cliente.ilike.%${q}%`,
    )
  }

  if (statusFilter && isValidStatus(statusFilter)) {
    query = query.eq('status', statusFilter)
  }

  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const { data, count, error } = await query.range(from, to)

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4 text-sm text-red-700">
        Erro ao carregar obras: {error.message}
      </div>
    )
  }

  const obras: ObraListItem[] = data ?? []
  const total = count ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const hasFilters = q !== '' || statusFilter !== ''
  const isEmpty = obras.length === 0

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-[280px]">
          <ObrasFilters />
        </div>
        {canCreate && (
          <Link
            href="/obras/nova"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors whitespace-nowrap"
          >
            <Plus size={16} />
            Nova obra
          </Link>
        )}
      </div>

      {isEmpty && !hasFilters ? (
        <EmptyState canCreate={canCreate} />
      ) : isEmpty ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-sm text-gray-500">
          Nenhuma obra encontrada com esses filtros.
        </div>
      ) : (
        <>
          <ObrasTable obras={obras} />
          <Pagination
            page={page}
            totalPages={totalPages}
            total={total}
            searchParams={searchParams}
          />
        </>
      )}
    </div>
  )
}

function EmptyState({ canCreate }: { canCreate: boolean }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Building2 size={28} className="text-gray-400" />
      </div>
      <p className="text-gray-700 mb-4">Nenhuma obra cadastrada ainda</p>
      {canCreate && (
        <Link
          href="/obras/nova"
          className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-800 transition-colors"
        >
          <Plus size={16} />
          Nova obra
        </Link>
      )}
    </div>
  )
}

function Pagination({
  page,
  totalPages,
  total,
  searchParams,
}: {
  page: number
  totalPages: number
  total: number
  searchParams: SearchParams
}) {
  if (totalPages <= 1) {
    return (
      <p className="text-sm text-gray-500">
        {total} {total === 1 ? 'obra' : 'obras'}
      </p>
    )
  }

  function buildUrl(targetPage: number): string {
    const params = new URLSearchParams()
    if (searchParams.q) params.set('q', searchParams.q)
    if (searchParams.status) params.set('status', searchParams.status)
    params.set('page', String(targetPage))
    return `/obras?${params.toString()}`
  }

  const prevDisabled = page <= 1
  const nextDisabled = page >= totalPages

  return (
    <div className="flex items-center justify-between gap-4 text-sm text-gray-600 flex-wrap">
      <span>
        {total} {total === 1 ? 'obra' : 'obras'} · página {page} de {totalPages}
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
