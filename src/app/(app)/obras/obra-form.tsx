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
  obraSchema,
  type ObraFormValues,
} from './obra-form-helpers'

type ObraFormProps = {
  defaultValues: ObraFormValues
  clienteOptions: readonly { value: string; label: string }[]
  submitLabel: string
  cancelHref: string
  onSubmit: (values: ObraFormValues) => Promise<void>
}

const STATUS_OPTIONS = [
  { value: 'ativa', label: 'Ativa' },
  { value: 'concluida', label: 'Concluída' },
  { value: 'suspensa', label: 'Suspensa' },
  { value: 'cancelada', label: 'Cancelada' },
]

export default function ObraForm({
  defaultValues,
  clienteOptions,
  submitLabel,
  cancelHref,
  onSubmit,
}: ObraFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ObraFormValues>({
    resolver: zodResolver(obraSchema),
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
          label="Código da obra"
          htmlFor="codigo_obra"
          required
          hint='Ex: "OBRA-2026-001"'
          error={errors.codigo_obra?.message}
        >
          <Input
            id="codigo_obra"
            type="text"
            disabled={isSubmitting}
            {...register('codigo_obra')}
          />
        </FormField>

        <FormField
          label="Status"
          htmlFor="status"
          required
          error={errors.status?.message}
        >
          <Select
            id="status"
            options={STATUS_OPTIONS}
            disabled={isSubmitting}
            {...register('status')}
          />
        </FormField>

        <FormField
          label="Nome"
          htmlFor="nome"
          required
          error={errors.nome?.message}
          className="md:col-span-2"
        >
          <Input
            id="nome"
            type="text"
            disabled={isSubmitting}
            {...register('nome')}
          />
        </FormField>

        <FormField
          label="Cliente"
          htmlFor="cliente_id"
          required
          hint={
            clienteOptions.length === 0
              ? 'Nenhum cliente cadastrado — cadastre antes em /clientes'
              : undefined
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

      <FormSection title="Prazos">
        <FormField
          label="Prazo de execução"
          htmlFor="prazo_execucao"
          hint='Ex: "90 dias" ou descrição livre'
          error={errors.prazo_execucao?.message}
          className="md:col-span-2"
        >
          <Input
            id="prazo_execucao"
            type="text"
            disabled={isSubmitting}
            {...register('prazo_execucao')}
          />
        </FormField>

        <FormField
          label="Data de início"
          htmlFor="data_inicio"
          error={errors.data_inicio?.message}
        >
          <Input
            id="data_inicio"
            type="date"
            disabled={isSubmitting}
            {...register('data_inicio')}
          />
        </FormField>

        <FormField
          label="Data prevista de fim"
          htmlFor="data_prevista_fim"
          error={errors.data_prevista_fim?.message}
        >
          <Input
            id="data_prevista_fim"
            type="date"
            disabled={isSubmitting}
            {...register('data_prevista_fim')}
          />
        </FormField>

        <FormField
          label="Data real de fim"
          htmlFor="data_real_fim"
          hint='Preencha quando concluir'
          error={errors.data_real_fim?.message}
        >
          <Input
            id="data_real_fim"
            type="date"
            disabled={isSubmitting}
            {...register('data_real_fim')}
          />
        </FormField>
      </FormSection>

      <FormSection title="Localização da obra">
        <FormField
          label="Endereço"
          htmlFor="endereco"
          error={errors.endereco?.message}
          className="md:col-span-2"
        >
          <Input
            id="endereco"
            type="text"
            disabled={isSubmitting}
            {...register('endereco')}
          />
        </FormField>

        <FormField
          label="Cidade"
          htmlFor="cidade"
          error={errors.cidade?.message}
        >
          <Input
            id="cidade"
            type="text"
            disabled={isSubmitting}
            {...register('cidade')}
          />
        </FormField>

        <FormField label="CEP" htmlFor="cep" error={errors.cep?.message}>
          <Input
            id="cep"
            type="text"
            placeholder="00000-000"
            disabled={isSubmitting}
            {...register('cep')}
          />
        </FormField>
      </FormSection>

      <FormSection title="Observação">
        <FormField
          label="Observação"
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
