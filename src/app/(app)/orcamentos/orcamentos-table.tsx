'use client'

import DataTable from '@/components/DataTable'
import StatusBadge from '@/components/StatusBadge'
import { formatCurrency, formatDate } from '@/lib/format'
import type { OrcamentoListItem } from '@/lib/types'

type OrcamentosTableProps = {
  orcamentos: OrcamentoListItem[]
}

export default function OrcamentosTable({ orcamentos }: OrcamentosTableProps) {
  return (
    <DataTable<OrcamentoListItem>
      data={orcamentos}
      rowKey={(o) => o.id}
      rowHref={(o) => `/orcamentos/${o.id}`}
      columns={[
        {
          key: 'numero',
          header: 'Número',
          render: (o) => (
            <span className="font-medium text-gray-900">
              {o.numero ?? '—'}
            </span>
          ),
        },
        {
          key: 'data',
          header: 'Data',
          className: 'tabular-nums',
          render: (o) => formatDate(o.data_solicitacao),
        },
        {
          key: 'cliente',
          header: 'Cliente',
          render: (o) => o.cliente_nome,
        },
        {
          key: 'cidade',
          header: 'Cidade',
          render: (o) => o.cliente_cidade ?? '—',
        },
        {
          key: 'status',
          header: 'Status',
          render: (o) => <StatusBadge status={o.status} />,
        },
        {
          key: 'valor',
          header: 'Valor',
          className: 'tabular-nums',
          render: (o) => formatCurrency(o.valor_estimado),
        },
        {
          key: 'responsavel',
          header: 'Responsável',
          render: (o) => o.responsavel ?? '—',
        },
      ]}
    />
  )
}
