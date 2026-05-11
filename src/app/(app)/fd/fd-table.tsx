'use client'

import DataTable from '@/components/DataTable'
import StatusBadge from '@/components/StatusBadge'
import { computeStatusFd } from '@/lib/fd'
import { formatCurrency, formatDate } from '@/lib/format'
import type { Fd } from '@/lib/types'

export type FdListItem = Pick<
  Fd,
  | 'id'
  | 'data_lancamento'
  | 'data_vencimento'
  | 'data_pagamento'
  | 'pedido_documento'
  | 'fornecedor'
  | 'valor'
  | 'diferenca_favor'
> & {
  obra: { codigo_obra: string; nome: string } | null
}

type FdTableProps = {
  fds: FdListItem[]
}

export default function FdTable({ fds }: FdTableProps) {
  return (
    <DataTable<FdListItem>
      data={fds}
      rowKey={(f) => f.id}
      rowHref={(f) => `/fd/${f.id}`}
      columns={[
        {
          key: 'data_lancamento',
          header: 'Lançamento',
          className: 'tabular-nums',
          render: (f) => formatDate(f.data_lancamento),
        },
        {
          key: 'pedido_documento',
          header: 'Pedido / Doc.',
          render: (f) => f.pedido_documento ?? '—',
        },
        {
          key: 'obra',
          header: 'Obra',
          render: (f) => f.obra?.codigo_obra ?? '—',
        },
        {
          key: 'fornecedor',
          header: 'Fornecedor',
          render: (f) => (
            <span className="font-medium text-gray-900">{f.fornecedor}</span>
          ),
        },
        {
          key: 'valor',
          header: 'Valor',
          className: 'tabular-nums',
          render: (f) => formatCurrency(f.valor),
        },
        {
          key: 'diferenca_favor',
          header: 'A favor',
          className: 'tabular-nums',
          render: (f) => {
            const v = Number(f.diferenca_favor ?? 0)
            const cls =
              v > 0
                ? 'text-green-700 font-medium'
                : v < 0
                  ? 'text-red-700 font-medium'
                  : 'text-gray-500'
            return <span className={cls}>{formatCurrency(v)}</span>
          },
        },
        {
          key: 'status',
          header: 'Status pgto',
          render: (f) => <StatusBadge status={computeStatusFd(f)} />,
        },
      ]}
    />
  )
}
