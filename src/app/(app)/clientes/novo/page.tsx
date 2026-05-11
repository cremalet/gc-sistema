import { redirect } from 'next/navigation'

import { getCurrentProfile } from '@/lib/supabase/profile'

import NovoClienteForm from './novo-form'

export default async function NovoClientePage() {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')

  if (profile.perfil !== 'admin' && profile.perfil !== 'comercial') {
    redirect('/clientes')
  }

  return (
    <div className="space-y-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-xl font-semibold text-gray-900">Novo cliente</h1>
        <p className="text-sm text-gray-500 mt-1">
          Preencha os dados do cliente. Só nome é obrigatório.
        </p>
      </div>
      <NovoClienteForm returnHref="/clientes" />
    </div>
  )
}
