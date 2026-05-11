import { redirect } from 'next/navigation'

import { getCurrentProfile } from '@/lib/supabase/profile'
import { createClient } from '@/lib/supabase/server'

import NovoFdForm from './novo-form'

export default async function NovoFdPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')

  if (profile.perfil !== 'admin' && profile.perfil !== 'financeiro') {
    redirect('/fd')
  }

  const supabase = createClient()

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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl font-semibold text-gray-900">
          Novo lançamento de FD
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Registre um pagamento que o cliente fez direto ao fornecedor.
        </p>
      </div>
      <NovoFdForm obraOptions={obraOptions} />
    </div>
  )
}
