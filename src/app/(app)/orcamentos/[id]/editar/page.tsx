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

  const [orcamentoResult, obrasResult] = await Promise.all([
    supabase.from('orcamentos').select('*').eq('id', params.id).maybeSingle(),
    supabase
      .from('obras')
      .select('id, codigo_obra, nome')
      .order('codigo_obra', { ascending: false }),
  ])

  if (!orcamentoResult.data) notFound()

  const orcamento = orcamentoResult.data as Orcamento

  const obraOptions = (obrasResult.data ?? []).map((o) => ({
    value: o.id,
    label: `${o.codigo_obra} — ${o.nome}`,
  }))

  return (
    <div className="space-y-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-xl font-semibold text-gray-900">Editar orçamento</h1>
        <p className="text-sm text-gray-500 mt-1">
          {orcamento.numero
            ? `Orçamento ${orcamento.numero}`
            : 'Orçamento sem número'}{' '}
          · {orcamento.cliente_nome}
        </p>
      </div>
      <EditarOrcamentoForm
        id={orcamento.id}
        defaultValues={orcamentoToFormValues(orcamento)}
        obraOptions={obraOptions}
      />
    </div>
  )
}
