import { notFound, redirect } from 'next/navigation'

import { getCurrentProfile } from '@/lib/supabase/profile'
import { createClient } from '@/lib/supabase/server'
import type { Cliente } from '@/lib/types'

import { clienteToFormValues } from '../../cliente-form-helpers'
import EditarClienteForm from './editar-form'

type PageProps = {
  params: { id: string }
}

export default async function EditarClientePage({ params }: PageProps) {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')

  if (profile.perfil !== 'admin' && profile.perfil !== 'comercial') {
    redirect('/clientes')
  }

  const supabase = createClient()

  const { data: cliente } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', params.id)
    .maybeSingle()

  if (!cliente) notFound()

  return (
    <div className="space-y-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-xl font-semibold text-gray-900">Editar cliente</h1>
        <p className="text-sm text-gray-500 mt-1">{cliente.nome}</p>
      </div>
      <EditarClienteForm
        id={cliente.id}
        defaultValues={clienteToFormValues(cliente as Cliente)}
        canDelete={profile.perfil === 'admin'}
      />
    </div>
  )
}
