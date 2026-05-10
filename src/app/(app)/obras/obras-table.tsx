'use client'

import DataTable from '@/components/DataTable'
import ProgressBar from '@/components/ProgressBar'
import StatusBadge from '@/components/StatusBadge'
import { formatCurrency } from '@/lib/format'
import type { ObraListItem } from '@/lib/types'

function computeProgress(obra: ObraListItem): number | null {
  if (obra.status === 'concluida') return 100
  if (obra.status !== 'ativa') return null
  if (!obra.data_inicio || !obra.data_prevista_fim) return null

  const inicio = new Date(obra.data_inicio).getTime()
  const fim = new Date(obra.data_prevista_fim).getTime()
  if (!Number.isFinite(inicio) || !Number.isFinite(fim) || fim <= inicio) {
    return null
  }

  const now = Date.now()
  if (now <= inicio) return 0
  if (now >= fim) return 95 // Ainda ativa depois do prazo — não é 100%.
  return Math.round(((now - inicio) / (fim - inicio)) * 100)
}

type ObrasTableProps = {
  obras: ObraListItem[]
}

export default function ObrasTable({ obras }: ObrasTableProps) {
  return (
    <DataTable<ObraListItem>
      data={obras}
      rowKey={(o) => o.id}
      rowHref={(o) => `/obras/${o.id}`}
      columns={[
        {
          key: 'codigo',
          header: 'Código',
          render: (o) => (
            <span className="font-medium text-gray-900">{o.codigo_obra}</span>
          ),
        },
        { key: 'nome', header: 'Nome', render: (o) => o.nome },
        {
          key: 'cliente',
          header: 'Cliente',
          render: (o) => o.cliente ?? '—',
        },
        { key: 'cidade', header: 'Cidade', render: (o) => o.cidade ?? '—' },
        {
          key: 'status',
          header: 'Status',
          render: (o) => <StatusBadge status={o.status} />,
        },
        {
          key: 'valor',
          header: 'Valor',
          className: 'tabular-nums',
          render: (o) => formatCurrency(o.valor_final_calculado),
        },
        {
          key: 'progresso',
          header: 'Progresso',
          render: (o) => <ProgressBar value={computeProgress(o)} />,
        },
      ]}
    />
  )
}
