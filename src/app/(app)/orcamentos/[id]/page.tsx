import { notFound, redirect } from 'next/navigation'
import type { ReactNode } from 'react'

import DetailField from '@/components/DetailField'
import Tabs from '@/components/Tabs'
import { formatCurrency, formatDate } from '@/lib/format'
import { getCurrentProfile } from '@/lib/supabase/profile'
import { createClient } from '@/lib/supabase/server'
import {
  MOTIVO_REJEICAO_LABELS,
  type Anexo,
  type MotivoRejeicaoOrcamento,
  type Orcamento,
} from '@/lib/types'

import AnexosTab from './anexos-tab'
import DetailHeader from './detail-header'

type PageProps = {
  params: { id: string }
}

export default async function OrcamentoDetalhePage({ params }: PageProps) {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')

  const supabase = createClient()

  // Orçamento + lista de obras em paralelo. A lista é necessária pra popular o
  // select "Vincular a obra" do dialog de mudança de status.
  const [orcamentoRes, obrasListRes] = await Promise.all([
    supabase.from('orcamentos').select('*').eq('id', params.id).maybeSingle(),
    supabase
      .from('obras')
      .select('id, codigo_obra, nome')
      .order('codigo_obra', { ascending: false }),
  ])

  if (!orcamentoRes.data) notFound()

  // Cast: status vem como `string` do gen, garantimos OrcamentoStatus via CHECK.
  const orcamento = orcamentoRes.data as Orcamento

  const obraOptions = (obrasListRes.data ?? []).map((o) => ({
    value: o.id,
    label: `${o.codigo_obra} — ${o.nome}`,
  }))

  // Obra vinculada pra exibição (se houver) — busca nas obras que já carregamos.
  const obra = orcamento.obra_id
    ? obrasListRes.data?.find((o) => o.id === orcamento.obra_id) ?? null
    : null

  // anexos é jsonb no banco — casto pro tipo do domínio.
  const anexos = (orcamento.anexos as Anexo[] | null) ?? []

  return (
    <div className="space-y-6">
      <DetailHeader
        id={orcamento.id}
        numero={orcamento.numero}
        clienteNome={orcamento.cliente_nome}
        status={orcamento.status}
        obraId={orcamento.obra_id}
        perfil={profile.perfil}
        obraOptions={obraOptions}
      />

      <Tabs
        tabs={[
          {
            value: 'detalhes',
            label: 'Detalhes',
            content: <DetailsTab orcamento={orcamento} obra={obra} />,
          },
          {
            value: 'anexos',
            label: `Anexos${anexos.length > 0 ? ` (${anexos.length})` : ''}`,
            content: (
              <AnexosTab
                orcamentoId={orcamento.id}
                anexos={anexos}
                perfil={profile.perfil}
              />
            ),
          },
          {
            value: 'historico',
            label: 'Histórico',
            content: <Placeholder message="Histórico virá em breve." />,
          },
        ]}
      />
    </div>
  )
}

function DetailsTab({
  orcamento,
  obra,
}: {
  orcamento: Orcamento
  obra: { codigo_obra: string; nome: string } | null
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Block title="Identificação">
          <DetailField label="Número" value={orcamento.numero} />
          <DetailField
            label="Data da solicitação"
            value={formatDate(orcamento.data_solicitacao)}
          />
        </Block>

        <Block title="Cliente">
          <DetailField
            label="Nome"
            value={orcamento.cliente_nome}
            className="md:col-span-2"
          />
          <DetailField label="Contato" value={orcamento.cliente_contato} />
          <DetailField label="Telefone" value={orcamento.cliente_telefone} />
          <DetailField label="Email" value={orcamento.cliente_email} />
          <DetailField label="Cidade" value={orcamento.cliente_cidade} />
        </Block>

        <Block title="Escopo">
          <DetailField
            label="Descrição"
            value={orcamento.descricao}
            className="md:col-span-2"
          />
          <DetailField
            label="Escopo resumo"
            value={orcamento.escopo_resumo}
            className="md:col-span-2"
          />
        </Block>
      </div>

      <div className="space-y-6">
        <Block title="Valores">
          <DetailField
            label="Valor estimado"
            value={formatCurrency(orcamento.valor_estimado)}
          />
          <DetailField
            label="Prazo estimado"
            value={orcamento.prazo_estimado}
          />
        </Block>

        <Block title="Datas">
          <DetailField
            label="Envio"
            value={
              orcamento.data_envio ? formatDate(orcamento.data_envio) : null
            }
          />
          <DetailField
            label="Decisão"
            value={
              orcamento.data_decisao ? formatDate(orcamento.data_decisao) : null
            }
          />
          <DetailField
            label="Criado em"
            value={
              orcamento.created_at ? formatDate(orcamento.created_at) : null
            }
          />
          <DetailField
            label="Atualizado em"
            value={
              orcamento.updated_at ? formatDate(orcamento.updated_at) : null
            }
          />
        </Block>

        <Block title="Responsável e vinculação">
          <DetailField
            label="Responsável"
            value={orcamento.responsavel}
            className="md:col-span-2"
          />
          <DetailField
            label="Obra vinculada"
            value={obra ? `${obra.codigo_obra} — ${obra.nome}` : null}
            className="md:col-span-2"
          />
        </Block>

        <Block title="Observações">
          <DetailField
            label="Observações"
            value={orcamento.observacao}
            className="md:col-span-2"
          />
          <DetailField
            label="Motivo da rejeição"
            value={motivoRejeicaoLabel(orcamento.motivo_rejeicao)}
          />
          <DetailField
            label="Detalhes da rejeição"
            value={orcamento.detalhe_rejeicao}
            className="md:col-span-2"
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

function Placeholder({ message }: { message: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-sm text-gray-500">
      {message}
    </div>
  )
}

/** Tradução do slug do motivo pra label amigável, com fallback. */
function motivoRejeicaoLabel(raw: string | null): string | null {
  if (!raw) return null
  const label = (MOTIVO_REJEICAO_LABELS as Record<string, string>)[raw]
  return label ?? raw
}
