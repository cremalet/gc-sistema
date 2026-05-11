import { redirect } from 'next/navigation'

import { getCurrentProfile } from '@/lib/supabase/profile'
import { createClient } from '@/lib/supabase/server'

import NovaObraForm from './novo-form'

export default async function NovaObraPage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')

  if (profile.perfil !== 'admin' && profile.perfil !== 'comercial') {
    redirect('/obras')
  }

  const supabase = createClient()

  const { data: clientes } = await supabase
    .from('clientes')
    .select('id, nome')
    .order('nome')

  const clienteOptions = (clientes ?? []).map((c) => ({
    value: c.id,
    label: c.nome,
  }))

  return (
    <div className="space-y-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-xl font-semibold text-gray-900">Nova obra</h1>
        <p className="text-sm text-gray-500 mt-1">
          Valores e percentuais de pagamento vêm das propostas/contratos vinculados.
        </p>
      </div>
      <NovaObraForm clienteOptions={clienteOptions} />
    </div>
  )
}
