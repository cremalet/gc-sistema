import { notFound, redirect } from 'next/navigation'

import { getCurrentProfile } from '@/lib/supabase/profile'
import { createClient } from '@/lib/supabase/server'
import type { Orcamento } from '@/lib/types'

import { orcamentoToFormValues } from '../../orcamento-form-helpers'
import EditarOrcamentoForm from './editar-form'

type PageProps = {
  params: { id: string }
}

export default async function EditarOrcamentoPage({ params }: PageProps) {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')

  if (profile.perfil !== 'admin' && profile.perfil !== 'comercial') {
    redirect(`/orcamentos/${params.id}`)
  }

  const supabase = createClient()

  const [orcamentoResult, obrasResult, clientesResult] = await Promise.all([
    supabase
      .from('orcamentos')
      .select('*, cliente:clientes(nome)')
      .eq('id', params.id)
      .maybeSingle(),
    supabase
      .from('obras')
      .select('id, codigo_obra, nome')
      .order('codigo_obra', { ascending: false }),
    supabase.from('clientes').select('id, nome').order('nome'),
  ])

  if (!orcamentoResult.data) notFound()

  // Separa o cliente aninhado pro narrowing do tipo Orcamento.
  const { cliente, ...orcamentoRow } = orcamentoResult.data as Orcamento & {
    cliente: { nome: string } | null
  }
  const orcamento = orcamentoRow as Orcamento

  const obraOptions = (obrasResult.data ?? []).map((o) => ({
    value: o.id,
    label: `${o.codigo_obra} — ${o.nome}`,
  }))

  const clienteOptions = (clientesResult.data ?? []).map((c) => ({
    value: c.id,
    label: c.nome,
  }))

  return (
    <div className="space-y-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-xl font-semibold text-gray-900">Editar orçamento</h1>
        <p className="text-sm text-gray-500 mt-1">
          {orcamento.numero
            ? `Orçamento ${orcamento.numero}`
            : 'Orçamento sem número'}{' '}
          · {cliente?.nome ?? '—'}
        </p>
      </div>
      <EditarOrcamentoForm
        id={orcamento.id}
        defaultValues={orcamentoToFormValues(orcamento)}
        obraOptions={obraOptions}
        clienteOptions={clienteOptions}
      />
    </div>
  )
}
