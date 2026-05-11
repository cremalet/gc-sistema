'use client'

import DataTable from '@/components/DataTable'
import type { Cliente } from '@/lib/types'

type ClienteListItem = Pick<
  Cliente,
  'id' | 'nome' | 'cnpj_cpf' | 'contato' | 'telefone' | 'cidade'
>

type ClientesTableProps = {
  clientes: ClienteListItem[]
}

export default function ClientesTable({ clientes }: ClientesTableProps) {
  return (
    <DataTable<ClienteListItem>
      data={clientes}
      rowKey={(c) => c.id}
      rowHref={(c) => `/clientes/${c.id}/editar`}
      columns={[
        {
          key: 'nome',
          header: 'Nome',
          render: (c) => (
            <span className="font-medium text-gray-900">{c.nome}</span>
          ),
        },
        {
          key: 'cnpj_cpf',
          header: 'CNPJ / CPF',
          className: 'tabular-nums',
          render: (c) => c.cnpj_cpf ?? '—',
        },
        { key: 'contato', header: 'Contato', render: (c) => c.contato ?? '—' },
        {
          key: 'telefone',
          header: 'Telefone',
          render: (c) => c.telefone ?? '—',
        },
        { key: 'cidade', header: 'Cidade', render: (c) => c.cidade ?? '—' },
      ]}
    />
  )
}
