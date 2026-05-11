'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import FdForm from '../../fd-form'
import {
  formValuesToPayload,
  type FdFormValues,
} from '../../fd-form-helpers'
import { updateFd } from './actions'

type EditarFdFormProps = {
  id: string
  defaultValues: FdFormValues
  obraOptions: readonly { value: string; label: string }[]
}

export default function EditarFdForm({
  id,
  defaultValues,
  obraOptions,
}: EditarFdFormProps) {
  const router = useRouter()

  async function handleSubmit(values: FdFormValues) {
    const result = await updateFd(id, formValuesToPayload(values))

    if (!result.ok) {
      toast.error(`Não foi possível salvar: ${result.error}`)
      return
    }

    toast.success('Lançamento atualizado')
    router.push(`/fd/${id}`)
    router.refresh()
  }

  return (
    <FdForm
      defaultValues={defaultValues}
      obraOptions={obraOptions}
      submitLabel="Salvar alterações"
      cancelHref={`/fd/${id}`}
      onSubmit={handleSubmit}
    />
  )
}
