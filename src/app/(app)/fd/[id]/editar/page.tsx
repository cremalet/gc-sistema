import { notFound, redirect } from 'next/navigation'

import { getCurrentProfile } from '@/lib/supabase/profile'
import { createClient } from '@/lib/supabase/server'
import type { Fd } from '@/lib/types'

import { fdToFormValues } from '../../fd-form-helpers'
import EditarFdForm from './editar-form'

type PageProps = {
  params: { id: string }
}

export default async function EditarFdPage({ params }: PageProps) {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')

  if (profile.perfil !== 'admin' && profile.perfil !== 'financeiro') {
    redirect(`/fd/${params.id}`)
  }

  const supabase = createClient()

  const [fdResult, obrasResult] = await Promise.all([
    supabase.from('fd').select('*').eq('id', params.id).maybeSingle(),
    supabase
      .from('obras')
      .select('id, codigo_obra, nome')
      .order('codigo_obra', { ascending: false }),
  ])

  if (!fdResult.data) notFound()

  const fd = fdResult.data as Fd

  const obraOptions = (obrasResult.data ?? []).map((o) => ({
    value: o.id,
    label: `${o.codigo_obra} — ${o.nome}`,
  }))

  return (
    <div className="space-y-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl font-semibold text-gray-900">
          Editar lançamento de FD
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          {fd.fornecedor}
          {fd.pedido_documento ? ` — ${fd.pedido_documento}` : ''}
        </p>
      </div>
      <EditarFdForm
        id={fd.id}
        defaultValues={fdToFormValues(fd)}
        obraOptions={obraOptions}
      />
    </div>
  )
}
