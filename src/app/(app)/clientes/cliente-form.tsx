'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { Controller, useForm } from 'react-hook-form'

import FormField from '@/components/form/FormField'
import FormSection from '@/components/form/FormSection'
import Input from '@/components/form/Input'
import Textarea from '@/components/form/Textarea'
import { formatPhoneMask } from '@/lib/phone'

import {
  clienteSchema,
  type ClienteFormValues,
} from './cliente-form-helpers'

type ClienteFormProps = {
  defaultValues: ClienteFormValues
  submitLabel: string
  cancelHref: string
  onSubmit: (values: ClienteFormValues) => Promise<void>
}

export default function ClienteForm({
  defaultValues,
  submitLabel,
  cancelHref,
  onSubmit,
}: ClienteFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
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
          label="Nome"
          htmlFor="nome"
          required
          hint="Razão social ou nome completo (PF)"
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
          label="CNPJ / CPF"
          htmlFor="cnpj_cpf"
          hint="Opcional. Aceita PF e PJ. Sem validação de formato"
          error={errors.cnpj_cpf?.message}
          className="md:col-span-2"
        >
          <Input
            id="cnpj_cpf"
            type="text"
            disabled={isSubmitting}
            {...register('cnpj_cpf')}
          />
        </FormField>
      </FormSection>

      <FormSection title="Contato">
        <FormField
          label="Contato"
          htmlFor="contato"
          hint="Nome da pessoa de contato"
          error={errors.contato?.message}
        >
          <Input
            id="contato"
            type="text"
            disabled={isSubmitting}
            {...register('contato')}
          />
        </FormField>

        <FormField
          label="Telefone"
          htmlFor="telefone"
          error={errors.telefone?.message}
        >
          <Controller
            name="telefone"
            control={control}
            render={({ field }) => (
              <Input
                id="telefone"
                type="tel"
                placeholder="(00) 00000-0000"
                disabled={isSubmitting}
                value={field.value ?? ''}
                onChange={(e) =>
                  field.onChange(formatPhoneMask(e.target.value))
                }
                onBlur={field.onBlur}
                ref={field.ref}
              />
            )}
          />
        </FormField>

        <FormField
          label="Email"
          htmlFor="email"
          error={errors.email?.message}
        >
          <Input
            id="email"
            type="email"
            disabled={isSubmitting}
            {...register('email')}
          />
        </FormField>
      </FormSection>

      <FormSection title="Endereço">
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
