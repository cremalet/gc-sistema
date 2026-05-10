'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import Modal from '@/components/Modal'
import StatusBadge from '@/components/StatusBadge'
import FormField from '@/components/form/FormField'
import Input from '@/components/form/Input'
import Select from '@/components/form/Select'
import Textarea from '@/components/form/Textarea'
import {
  MOTIVO_REJEICAO_LABELS,
  type MotivoRejeicaoOrcamento,
  type OrcamentoStatus,
} from '@/lib/types'

import { changeOrcamentoStatus, type ChangeStatusInput } from './actions'

const STATUS_OPTIONS: readonly { value: OrcamentoStatus; label: string }[] = [
  { value: 'pendente', label: 'Pendente' },
  { value: 'analise', label: 'Em análise' },
  { value: 'enviado', label: 'Enviado' },
  { value: 'aprovado', label: 'Aprovado' },
  { value: 'rejeitado', label: 'Rejeitado' },
  { value: 'expirado', label: 'Expirado' },
]

// Derivado do mapping em lib/types, com "(descrever)" só no dropdown
// pra avisar que vai precisar preencher detalhes.
const MOTIVO_OPTIONS: readonly {
  value: MotivoRejeicaoOrcamento
  label: string
}[] = (
  Object.keys(MOTIVO_REJEICAO_LABELS) as MotivoRejeicaoOrcamento[]
).map((k) => ({
  value: k,
  label:
    k === 'outro' ? 'Outro (descrever)' : MOTIVO_REJEICAO_LABELS[k],
}))

const schema = z
  .object({
    novo_status: z.enum([
      'pendente',
      'analise',
      'enviado',
      'aprovado',
      'rejeitado',
      'expirado',
    ] as const),
    data_envio: z.string().optional().default(''),
    data_decisao: z.string().optional().default(''),
    vincular_obra: z.boolean().default(false),
    obra_id_vinculada: z.string().optional().default(''),
    motivo_rejeicao: z.string().optional().default(''),
    detalhe_rejeicao: z.string().optional().default(''),
  })
  .superRefine((data, ctx) => {
    if (data.novo_status === 'enviado' && !data.data_envio) {
      ctx.addIssue({
        path: ['data_envio'],
        code: 'custom',
        message: 'Data de envio é obrigatória',
      })
    }
    if (data.novo_status === 'aprovado' || data.novo_status === 'rejeitado') {
      if (!data.data_decisao) {
        ctx.addIssue({
          path: ['data_decisao'],
          code: 'custom',
          message: 'Data da decisão é obrigatória',
        })
      }
    }
    if (data.novo_status === 'aprovado' && data.vincular_obra) {
      if (!data.obra_id_vinculada) {
        ctx.addIssue({
          path: ['obra_id_vinculada'],
          code: 'custom',
          message: 'Selecione uma obra',
        })
      }
    }
    if (data.novo_status === 'rejeitado') {
      if (!data.motivo_rejeicao) {
        ctx.addIssue({
          path: ['motivo_rejeicao'],
          code: 'custom',
          message: 'Motivo é obrigatório',
        })
      }
      if (
        data.motivo_rejeicao === 'outro' &&
        !data.detalhe_rejeicao.trim()
      ) {
        ctx.addIssue({
          path: ['detalhe_rejeicao'],
          code: 'custom',
          message: 'Descreva os detalhes quando o motivo é "Outro"',
        })
      }
    }
  })

type FormValues = z.input<typeof schema>

type StatusDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  orcamentoId: string
  currentStatus: OrcamentoStatus
  /** Obra já vinculada ao orçamento (ou null). Pré-preenche o select. */
  currentObraId: string | null
  obraOptions: readonly { value: string; label: string }[]
  /** Chamado após sucesso — caller faz router.refresh(). */
  onSuccess: () => void
}

function todayIso(): string {
  return new Date().toISOString().slice(0, 10)
}

export default function StatusDialog({
  open,
  onOpenChange,
  orcamentoId,
  currentStatus,
  currentObraId,
  obraOptions,
  onSuccess,
}: StatusDialogProps) {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      novo_status: currentStatus,
      data_envio: todayIso(),
      data_decisao: todayIso(),
      vincular_obra: Boolean(currentObraId),
      obra_id_vinculada: currentObraId ?? '',
      motivo_rejeicao: '',
      detalhe_rejeicao: '',
    },
  })

  // Resetar o form toda vez que reabrir (pega valor mais recente do server)
  useEffect(() => {
    if (open) {
      reset({
        novo_status: currentStatus,
        data_envio: todayIso(),
        data_decisao: todayIso(),
        vincular_obra: Boolean(currentObraId),
        obra_id_vinculada: currentObraId ?? '',
        motivo_rejeicao: '',
        detalhe_rejeicao: '',
      })
    }
  }, [open, currentStatus, currentObraId, reset])

  const novoStatus = watch('novo_status')
  const vincularObra = watch('vincular_obra')
  const motivoRejeicao = watch('motivo_rejeicao')

  async function onSubmit(values: FormValues) {
    const payload: ChangeStatusInput = {
      novo_status: values.novo_status,
      data_envio: values.data_envio || null,
      data_decisao: values.data_decisao || null,
      motivo_rejeicao:
        values.motivo_rejeicao &&
        MOTIVO_OPTIONS.some((m) => m.value === values.motivo_rejeicao)
          ? (values.motivo_rejeicao as MotivoRejeicaoOrcamento)
          : null,
      detalhe_rejeicao: values.detalhe_rejeicao?.trim() || null,
      vincular_obra: Boolean(values.vincular_obra),
      obra_id_vinculada: values.obra_id_vinculada || null,
    }

    const result = await changeOrcamentoStatus(orcamentoId, payload)

    if (!result.ok) {
      toast.error(`Não foi possível mudar o status: ${result.error}`)
      return
    }

    toast.success('Status atualizado')
    onOpenChange(false)
    onSuccess()
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Mudar status"
      size="md"
      dismissible={!isSubmitting}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        <FormField label="Status atual">
          <div className="py-2">
            <StatusBadge status={currentStatus} />
          </div>
        </FormField>

        <FormField
          label="Novo status"
          htmlFor="novo_status"
          required
          error={errors.novo_status?.message}
        >
          <Select
            id="novo_status"
            options={STATUS_OPTIONS}
            disabled={isSubmitting}
            {...register('novo_status')}
          />
        </FormField>

        {novoStatus === 'enviado' && (
          <FormField
            label="Data de envio"
            htmlFor="data_envio"
            required
            error={errors.data_envio?.message}
          >
            <Input
              id="data_envio"
              type="date"
              disabled={isSubmitting}
              {...register('data_envio')}
            />
          </FormField>
        )}

        {(novoStatus === 'aprovado' || novoStatus === 'rejeitado') && (
          <FormField
            label="Data da decisão"
            htmlFor="data_decisao"
            required
            error={errors.data_decisao?.message}
          >
            <Input
              id="data_decisao"
              type="date"
              disabled={isSubmitting}
              {...register('data_decisao')}
            />
          </FormField>
        )}

        {novoStatus === 'aprovado' && (
          <div className="space-y-3 bg-gray-50 border border-gray-200 rounded-md p-3">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                disabled={isSubmitting}
                className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                {...register('vincular_obra')}
              />
              Vincular a obra existente
            </label>

            {vincularObra && (
              <FormField
                label="Obra"
                htmlFor="obra_id_vinculada"
                error={errors.obra_id_vinculada?.message}
              >
                <Select
                  id="obra_id_vinculada"
                  options={obraOptions}
                  placeholder="— Selecione —"
                  disabled={isSubmitting || obraOptions.length === 0}
                  {...register('obra_id_vinculada')}
                />
              </FormField>
            )}

            <button
              type="button"
              disabled
              title="Em breve"
              className="text-sm text-gray-500 border border-dashed border-gray-300 rounded-md px-3 py-1.5 cursor-not-allowed"
            >
              + Criar nova obra a partir deste orçamento (em breve)
            </button>
          </div>
        )}

        {novoStatus === 'rejeitado' && (
          <>
            <FormField
              label="Motivo da rejeição"
              htmlFor="motivo_rejeicao"
              required
              error={errors.motivo_rejeicao?.message}
            >
              <Select
                id="motivo_rejeicao"
                options={MOTIVO_OPTIONS}
                placeholder="— Selecione —"
                disabled={isSubmitting}
                {...register('motivo_rejeicao')}
              />
            </FormField>

            <FormField
              label="Detalhes"
              htmlFor="detalhe_rejeicao"
              required={motivoRejeicao === 'outro'}
              hint={
                motivoRejeicao === 'outro'
                  ? undefined
                  : 'Opcional — adiciona contexto sobre o motivo'
              }
              error={errors.detalhe_rejeicao?.message}
            >
              <Textarea
                id="detalhe_rejeicao"
                rows={3}
                disabled={isSubmitting}
                {...register('detalhe_rejeicao')}
              />
            </FormField>
          </>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 -mx-6 px-6 -mb-4 pb-4 bg-gray-50 rounded-b-lg">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Salvando...' : 'Salvar mudança'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
