import { notFound, redirect } from 'next/navigation'

import { getCurrentProfile } from '@/lib/supabase/profile'
import { createClient } from '@/lib/supabase/server'
import type { Obra } from '@/lib/types'

import { obraToFormValues } from '../../obra-form-helpers'
import EditarObraForm from './editar-form'

type PageProps = {
  params: { id: string }
}

export default async function EditarObraPage({ params }: PageProps) {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')

  if (profile.perfil !== 'admin' && profile.perfil !== 'comercial') {
    redirect(`/obras/${params.id}`)
  }

  const supabase = createClient()

  const [obraResult, clientesResult] = await Promise.all([
    supabase.from('obras').select('*').eq('id', params.id).maybeSingle(),
    supabase.from('clientes').select('id, nome').order('nome'),
  ])

  if (!obraResult.data) notFound()

  const obra = obraResult.data as Obra

  const clienteOptions = (clientesResult.data ?? []).map((c) => ({
    value: c.id,
    label: c.nome,
  }))

  return (
    <div className="space-y-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-xl font-semibold text-gray-900">Editar obra</h1>
        <p className="text-sm text-gray-500 mt-1">
          {obra.codigo_obra} — {obra.nome}
        </p>
      </div>
      <EditarObraForm
        id={obra.id}
        defaultValues={obraToFormValues(obra)}
        clienteOptions={clienteOptions}
        canDelete={profile.perfil === 'admin'}
      />
    </div>
  )
}
