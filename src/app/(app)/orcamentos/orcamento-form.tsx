'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useForm } from 'react-hook-form'

import FormField from '@/components/form/FormField'
import FormSection from '@/components/form/FormSection'
import Input from '@/components/form/Input'
import Select from '@/components/form/Select'
import Textarea from '@/components/form/Textarea'

import {
  orcamentoSchema,
  type OrcamentoFormValues,
} from './orcamento-form-helpers'

type OrcamentoFormProps = {
  defaultValues: OrcamentoFormValues
  obraOptions: readonly { value: string; label: string }[]
  clienteOptions: readonly { value: string; label: string }[]
  submitLabel: string
  cancelHref: string
  /** Chamado com os valores validados. Responsável por toast + navegação. */
  onSubmit: (values: OrcamentoFormValues) => Promise<void>
}

export default function OrcamentoForm({
  defaultValues,
  obraOptions,
  clienteOptions,
  submitLabel,
  cancelHref,
  onSubmit,
}: OrcamentoFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OrcamentoFormValues>({
    resolver: zodResolver(orcamentoSchema),
    defaultValues,
  })

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-3xl mx-auto bg-white rounded-lg border border-gray-200 shadow-sm p-8 space-y-8"
      noValidate
    >
      <FormSection title="Identificação">
        <FormField
          label="Número"
          htmlFor="numero"
          hint="Opcional. Ex: ORC-2026-001"
          error={errors.numero?.message}
        >
          <Input
            id="numero"
            type="text"
            placeholder="ORC-2026-001"
            disabled={isSubmitting}
            {...register('numero')}
          />
        </FormField>

        <FormField
          label="Data da solicitação"
          htmlFor="data_solicitacao"
          required
          error={errors.data_solicitacao?.message}
        >
          <Input
            id="data_solicitacao"
            type="date"
            disabled={isSubmitting}
            {...register('data_solicitacao')}
          />
        </FormField>
      </FormSection>

      <FormSection title="Cliente">
        <FormField
          label="Cliente"
          htmlFor="cliente_id"
          required
          hint={
            clienteOptions.length === 0
              ? 'Nenhum cliente cadastrado ainda — cadastre um antes'
              : 'Não encontrou o cliente? Cadastre antes em /clientes'
          }
          error={errors.cliente_id?.message}
          className="md:col-span-2"
        >
          <Select
            id="cliente_id"
            options={clienteOptions}
            placeholder="— Selecione um cliente —"
            disabled={isSubmitting || clienteOptions.length === 0}
            {...register('cliente_id')}
          />
        </FormField>

        <p className="text-xs text-gray-500 md:col-span-2">
          <Link
            href="/clientes/novo"
            className="underline hover:text-gray-700"
            target="_blank"
          >
            + Cadastrar novo cliente
          </Link>
        </p>
      </FormSection>

      <FormSection title="Escopo">
        <FormField
          label="Descrição"
          htmlFor="descricao"
          hint="Até 1000 caracteres"
          error={errors.descricao?.message}
          className="md:col-span-2"
        >
          <Textarea
            id="descricao"
            rows={4}
            disabled={isSubmitting}
            {...register('descricao')}
          />
        </FormField>

        <FormField
          label="Escopo resumo"
          htmlFor="escopo_resumo"
          error={errors.escopo_resumo?.message}
          className="md:col-span-2"
        >
          <Textarea
            id="escopo_resumo"
            rows={3}
            disabled={isSubmitting}
            {...register('escopo_resumo')}
          />
        </FormField>

        <FormField
          label="Valor estimado (R$)"
          htmlFor="valor_estimado"
          error={errors.valor_estimado?.message}
        >
          <Input
            id="valor_estimado"
            type="number"
            step="0.01"
            min="0"
            disabled={isSubmitting}
            {...register('valor_estimado', { valueAsNumber: true })}
          />
        </FormField>

        <FormField
          label="Prazo estimado"
          htmlFor="prazo_estimado"
          hint='Ex: "60 dias"'
          error={errors.prazo_estimado?.message}
        >
          <Input
            id="prazo_estimado"
            type="text"
            disabled={isSubmitting}
            {...register('prazo_estimado')}
          />
        </FormField>
      </FormSection>

      <FormSection title="Responsável e vinculação">
        <FormField
          label="Responsável"
          htmlFor="responsavel"
          hint="Vendedor responsável pelo orçamento"
          error={errors.responsavel?.message}
        >
          <Input
            id="responsavel"
            type="text"
            disabled={isSubmitting}
            {...register('responsavel')}
          />
        </FormField>

        <FormField
          label="Vincular a obra existente"
          htmlFor="obra_id"
          hint="Opcional"
          error={errors.obra_id?.message}
        >
          <Select
            id="obra_id"
            options={obraOptions}
            placeholder="— Nenhuma —"
            disabled={isSubmitting || obraOptions.length === 0}
            {...register('obra_id')}
          />
        </FormField>

        <FormField
          label="Observações"
          htmlFor="observacao"
          error={errors.observacao?.message}
          className="md:col-span-2"
        >
          <Textarea
            id="observacao"
            rows={3}
            disabled={isSubmitting}
            {...register('observacao')}
          />
        </FormField>
      </FormSection>

      <section className="space-y-4">
        <header className="pb-2 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Anexos</h2>
        </header>
        <p className="text-sm text-gray-500">
          Anexos podem ser gerenciados na aba &ldquo;Anexos&rdquo; da tela de
          detalhes.
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
