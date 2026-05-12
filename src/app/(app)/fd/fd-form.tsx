'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useForm, useWatch } from 'react-hook-form'

import FormField from '@/components/form/FormField'
import FormSection from '@/components/form/FormSection'
import Input from '@/components/form/Input'
import Select from '@/components/form/Select'
import Textarea from '@/components/form/Textarea'
import { UNIDADE_FD_OPTIONS } from '@/lib/fd'
import { formatCurrency } from '@/lib/format'

import { fdSchema, type FdFormValues } from './fd-form-helpers'

type FdFormProps = {
  defaultValues: FdFormValues
  obraOptions: readonly { value: string; label: string }[]
  submitLabel: string
  cancelHref: string
  onSubmit: (values: FdFormValues) => Promise<void>
}

const UNIDADE_OPTIONS = [
  { value: '', label: '—' },
  ...UNIDADE_FD_OPTIONS.map((u) => ({ value: u, label: u })),
]

export default function FdForm({
  defaultValues,
  obraOptions,
  submitLabel,
  cancelHref,
  onSubmit,
}: FdFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FdFormValues>({
    resolver: zodResolver(fdSchema),
    defaultValues,
  })

  // Cálculo em tempo real da diferença a favor (valor - valor_descontar)
  const valor = useWatch({ control, name: 'valor' }) ?? 0
  const valorDescontar = useWatch({ control, name: 'valor_descontar' }) ?? 0
  const diferenca = Number(valor) - Number(valorDescontar)
  const diferencaCor =
    diferenca > 0
      ? 'text-green-700'
      : diferenca < 0
        ? 'text-red-700'
        : 'text-gray-500'

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-4xl mx-auto bg-white rounded-lg border border-gray-200 shadow-sm p-8 space-y-8"
      noValidate
    >
      <FormSection title="Identificação">
        <FormField
          label="Pedido / Documento"
          htmlFor="pedido_documento"
          hint='Ex: "PED-2026-042"'
          error={errors.pedido_documento?.message}
        >
          <Input
            id="pedido_documento"
            type="text"
            disabled={isSubmitting}
            {...register('pedido_documento')}
          />
        </FormField>

        <FormField
          label="Item / Parcela"
          htmlFor="item_parcela"
          hint='Ex: "3/5"'
          error={errors.item_parcela?.message}
        >
          <Input
            id="item_parcela"
            type="text"
            disabled={isSubmitting}
            {...register('item_parcela')}
          />
        </FormField>
      </FormSection>

      <FormSection title="Obra">
        <FormField
          label="Obra"
          htmlFor="obra_id"
          required
          hint={
            obraOptions.length === 0
              ? 'Nenhuma obra cadastrada — cadastre antes em /obras'
              : undefined
          }
          error={errors.obra_id?.message}
          className="md:col-span-2"
        >
          <Select
            id="obra_id"
            options={obraOptions}
            placeholder="— Selecione uma obra —"
            disabled={isSubmitting || obraOptions.length === 0}
            {...register('obra_id')}
          />
        </FormField>
      </FormSection>

      <FormSection title="Datas">
        <FormField
          label="Data de lançamento"
          htmlFor="data_lancamento"
          required
          error={errors.data_lancamento?.message}
        >
          <Input
            id="data_lancamento"
            type="date"
            disabled={isSubmitting}
            {...register('data_lancamento')}
          />
        </FormField>

        <FormField
          label="Data de vencimento"
          htmlFor="data_vencimento"
          error={errors.data_vencimento?.message}
        >
          <Input
            id="data_vencimento"
            type="date"
            disabled={isSubmitting}
            {...register('data_vencimento')}
          />
        </FormField>

        <FormField
          label="Data de pagamento"
          htmlFor="data_pagamento"
          hint="Preencha quando o cliente pagar o fornecedor"
          error={errors.data_pagamento?.message}
        >
          <Input
            id="data_pagamento"
            type="date"
            disabled={isSubmitting}
            {...register('data_pagamento')}
          />
        </FormField>
      </FormSection>

      <FormSection title="Produto / Serviço">
        <FormField label="Código" htmlFor="codigo" error={errors.codigo?.message}>
          <Input
            id="codigo"
            type="text"
            disabled={isSubmitting}
            {...register('codigo')}
          />
        </FormField>

        <FormField
          label="Unidade"
          htmlFor="unidade"
          error={errors.unidade?.message}
        >
          <Select
            id="unidade"
            options={UNIDADE_OPTIONS}
            disabled={isSubmitting}
            {...register('unidade')}
          />
        </FormField>

        <FormField
          label="Especificação"
          htmlFor="especificacao"
          error={errors.especificacao?.message}
          className="md:col-span-2"
        >
          <Textarea
            id="especificacao"
            rows={2}
            disabled={isSubmitting}
            {...register('especificacao')}
          />
        </FormField>

        <FormField
          label="Quantidade"
          htmlFor="quantidade"
          error={errors.quantidade?.message}
        >
          <Input
            id="quantidade"
            type="number"
            step="0.0001"
            min="0"
            disabled={isSubmitting}
            {...register('quantidade', { valueAsNumber: true })}
          />
        </FormField>

        <FormField
          label="Preço unitário (R$)"
          htmlFor="preco_unitario"
          error={errors.preco_unitario?.message}
        >
          <Input
            id="preco_unitario"
            type="number"
            step="0.0001"
            min="0"
            disabled={isSubmitting}
            {...register('preco_unitario', { valueAsNumber: true })}
          />
        </FormField>
      </FormSection>

      <FormSection title="Fornecedor e valores">
        <FormField
          label="Fornecedor"
          htmlFor="fornecedor"
          required
          error={errors.fornecedor?.message}
          className="md:col-span-2"
        >
          <Input
            id="fornecedor"
            type="text"
            disabled={isSubmitting}
            {...register('fornecedor')}
          />
        </FormField>

        <FormField
          label="Valor (R$)"
          htmlFor="valor"
          required
          hint="O que o cliente gastou com o fornecedor"
          error={errors.valor?.message}
        >
          <Input
            id="valor"
            type="number"
            step="0.01"
            min="0"
            disabled={isSubmitting}
            {...register('valor', { valueAsNumber: true })}
          />
        </FormField>

        <FormField
          label="Valor a descontar (R$)"
          htmlFor="valor_descontar"
          required
          hint="O que não concordamos"
          error={errors.valor_descontar?.message}
        >
          <Input
            id="valor_descontar"
            type="number"
            step="0.01"
            min="0"
            disabled={isSubmitting}
            {...register('valor_descontar', { valueAsNumber: true })}
          />
        </FormField>

        <div className="md:col-span-2 bg-gray-50 border border-gray-200 rounded-md p-4 flex items-baseline justify-between">
          <span className="text-sm text-gray-700">Diferença a nosso favor:</span>
          <span className={`text-lg font-semibold tabular-nums ${diferencaCor}`}>
            {formatCurrency(diferenca)}
          </span>
        </div>
      </FormSection>

      <FormSection title="Justificativa e observação">
        <FormField
          label="Justificativa"
          htmlFor="justificativa"
          hint="Por que aceitamos esse desconto?"
          error={errors.justificativa?.message}
          className="md:col-span-2"
        >
          <Textarea
            id="justificativa"
            rows={2}
            disabled={isSubmitting}
            {...register('justificativa')}
          />
        </FormField>

        <FormField
          label="Observação"
          htmlFor="observacao"
          error={errors.observacao?.message}
          className="md:col-span-2"
        >
          <Textarea
            id="observacao"
            rows={2}
            disabled={isSubmitting}
            {...register('observacao')}
          />
        </FormField>
      </FormSection>

      <section className="space-y-4">
        <header className="pb-2 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Evidências</h2>
        </header>
        <p className="text-sm text-gray-500">
          Evidências podem ser adicionadas na aba &ldquo;Evidências&rdquo; da
          tela de detalhes após salvar.
        </p>
      </section>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <Link
          href={cancelHref}
          className="px-4 py-2 rounded-md border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Salvando...' : submitLabel}
        </button>
      </div>
    </form>
  )
}
