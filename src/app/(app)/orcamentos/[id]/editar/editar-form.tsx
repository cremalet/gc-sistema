'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import OrcamentoForm from '../../orcamento-form'
import {
  formValuesToPayload,
  type OrcamentoFormValues,
} from '../../orcamento-form-helpers'
import { updateOrcamento } from './actions'

type EditarOrcamentoFormProps = {
  id: string
  defaultValues: OrcamentoFormValues
  obraOptions: readonly { value: string; label: string }[]
  clienteOptions: readonly { value: string; label: string }[]
}

export default function EditarOrcamentoForm({
  id,
  defaultValues,
  obraOptions,
  clienteOptions,
}: EditarOrcamentoFormProps) {
  const router = useRouter()

  async function handleSubmit(values: OrcamentoFormValues) {
    const result = await updateOrcamento(id, formValuesToPayload(values))

    if (!result.ok) {
      toast.error(`Não foi possível salvar: ${result.error}`)
      return
    }

    toast.success('Orçamento atualizado')
    router.push(`/orcamentos/${id}`)
    router.refresh()
  }

  return (
    <OrcamentoForm
      defaultValues={defaultValues}
      obraOptions={obraOptions}
      clienteOptions={clienteOptions}
      submitLabel="Salvar alterações"
      cancelHref={`/orcamentos/${id}`}
      onSubmit={handleSubmit}
    />
  )
}
