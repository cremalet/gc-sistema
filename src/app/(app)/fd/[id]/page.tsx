import { notFound, redirect } from 'next/navigation'
import type { ReactNode } from 'react'

import DetailField from '@/components/DetailField'
import Tabs from '@/components/Tabs'
import { computeStatusFd } from '@/lib/fd'
import { formatCurrency, formatDate } from '@/lib/format'
import { getCurrentProfile } from '@/lib/supabase/profile'
import { createClient } from '@/lib/supabase/server'
import type { Anexo, Fd } from '@/lib/types'

import DetailHeader from './detail-header'
import EvidenciasTab from './evidencias-tab'

type PageProps = {
  params: { id: string }
}

export default async function FdDetalhePage({ params }: PageProps) {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')

  const supabase = createClient()

  const { data } = await supabase
    .from('fd')
    .select('*, obra:obras(codigo_obra, nome)')
    .eq('id', params.id)
    .maybeSingle()

  if (!data) notFound()

  const { obra, ...fdRow } = data as Fd & {
    obra: { codigo_obra: string; nome: string } | null
  }
  const fd = fdRow as Fd

  const statusPgto = computeStatusFd(fd)
  const evidencias = (fd.evidencias as Anexo[] | null) ?? []

  return (
    <div className="space-y-6">
      <DetailHeader
        id={fd.id}
        pedidoDocumento={fd.pedido_documento}
        fornecedor={fd.fornecedor}
        obraCodigo={obra?.codigo_obra ?? '—'}
        statusPgto={statusPgto}
        perfil={profile.perfil}
      />

      <Tabs
        tabs={[
          {
            value: 'detalhes',
            label: 'Detalhes',
            content: <DetailsTab fd={fd} obra={obra} />,
          },
          {
            value: 'evidencias',
            label: `Evidências${evidencias.length > 0 ? ` (${evidencias.length})` : ''}`,
            content: (
              <EvidenciasTab
                fdId={fd.id}
                evidencias={evidencias}
                perfil={profile.perfil}
              />
            ),
          },
        ]}
      />
    </div>
  )
}

function DetailsTab({
  fd,
  obra,
}: {
  fd: Fd
  obra: { codigo_obra: string; nome: string } | null
}) {
  const diferencaValue = Number(fd.diferenca_favor ?? 0)
  const diferencaCor =
    diferencaValue > 0
      ? 'text-green-700 font-semibold'
      : diferencaValue < 0
        ? 'text-red-700 font-semibold'
        : 'text-gray-500'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Block title="Identificação">
          <DetailField label="Pedido / Documento" value={fd.pedido_documento} />
          <DetailField label="Item / Parcela" value={fd.item_parcela} />
        </Block>

        <Block title="Obra">
          <DetailField
            label="Código"
            value={obra?.codigo_obra ?? null}
            className="md:col-span-2"
          />
          <DetailField
            label="Nome da obra"
            value={obra?.nome ?? null}
            className="md:col-span-2"
          />
        </Block>

        <Block title="Datas">
          <DetailField
            label="Lançamento"
            value={formatDate(fd.data_lancamento)}
          />
          <DetailField
            label="Vencimento"
            value={fd.data_vencimento ? formatDate(fd.data_vencimento) : null}
          />
          <DetailField
            label="Pagamento"
            value={fd.data_pagamento ? formatDate(fd.data_pagamento) : null}
            className="md:col-span-2"
          />
        </Block>

        <Block title="Produto / Serviço">
          <DetailField label="Código" value={fd.codigo} />
          <DetailField label="Unidade" value={fd.unidade} />
          <DetailField
            label="Especificação"
            value={fd.especificacao}
            className="md:col-span-2"
          />
          <DetailField
            label="Quantidade"
            value={fd.quantidade != null ? String(fd.quantidade) : null}
          />
          <DetailField
            label="Preço unitário"
            value={
              fd.preco_unitario != null
                ? formatCurrency(fd.preco_unitario)
                : null
            }
          />
        </Block>
      </div>

      <div className="space-y-6">
        <Block title="Fornecedor e valores">
          <DetailField
            label="Fornecedor"
            value={fd.fornecedor}
            className="md:col-span-2"
          />
          <DetailField label="Valor (cliente pagou)" value={formatCurrency(fd.valor)} />
          <DetailField
            label="Valor descontamos"
            value={formatCurrency(fd.valor_descontar)}
          />
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 md:col-span-2 pt-3 border-t border-gray-100">
            <dt className="text-xs uppercase tracking-wide text-gray-500">
              Diferença a favor
            </dt>
            <dd className={`text-base tabular-nums text-right ${diferencaCor}`}>
              {formatCurrency(diferencaValue)}
            </dd>
          </dl>
        </Block>

        <Block title="Justificativa">
          <DetailField
            label="Justificativa"
            value={fd.justificativa}
            className="md:col-span-2"
          />
        </Block>

        <Block title="Observação">
          <DetailField
            label="Observação"
            value={fd.observacao}
            className="md:col-span-2"
          />
        </Block>

        <Block title="Auditoria">
          <DetailField
            label="Criado em"
            value={fd.created_at ? formatDate(fd.created_at) : null}
          />
          <DetailField
            label="Atualizado em"
            value={fd.updated_at ? formatDate(fd.updated_at) : null}
          />
        </Block>
      </div>
    </div>
  )
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5 space-y-4">
      <h2 className="text-sm font-semibold text-gray-900 pb-2 border-b border-gray-200">
        {title}
      </h2>
      <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
        {children}
      </dl>
    </div>
  )
}
