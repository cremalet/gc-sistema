import { redirect } from 'next/navigation'

import { getCurrentProfile } from '@/lib/supabase/profile'
import { createClient } from '@/lib/supabase/server'

import NovoOrcamentoForm from './novo-form'

export default async function NovoOrcamentoPage() {
  const profile = await getCurrentProfile()

  // Defesa em profundidade — middleware + layout já protegem, mas se algo escapar.
  if (!profile) redirect('/login')

  if (profile.perfil !== 'admin' && profile.perfil !== 'comercial') {
    redirect('/orcamentos')
  }

  const supabase = createClient()

  // Lista de obras da empresa pra povoar o select "Vincular a obra existente".
  // RLS já filtra por empresa_id.
  const { data: obras } = await supabase
    .from('obras')
    .select('id, codigo_obra, nome')
    .order('codigo_obra', { ascending: false })

  const obraOptions = (obras ?? []).map((o) => ({
    value: o.id,
    label: `${o.codigo_obra} — ${o.nome}`,
  }))

  return (
    <div className="space-y-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-xl font-semibold text-gray-900">Novo orçamento</h1>
        <p className="text-sm text-gray-500 mt-1">
          Preencha os dados do orçamento. Você pode editar tudo depois.
        </p>
      </div>
      <NovoOrcamentoForm obraOptions={obraOptions} />
    </div>
  )
}
