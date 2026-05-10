// Helpers puros do form de orçamento. SEM 'use client' pra poder ser
// importado tanto de Server Components (page.tsx de editar) quanto de
// Server Actions (actions.ts) quanto de Client Components.
//
// O componente React (que usa hooks) fica no orcamento-form.tsx (com 'use client').

import { z } from 'zod'

import { PHONE_REGEX } from '@/lib/phone'
import type { Orcamento } from '@/lib/types'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const orcamentoSchema = z.object({
  numero: z.string().max(50, 'Máximo 50 caracteres').optional().default(''),
  data_solicitacao: z.string().min(1, 'Data obrigatória'),
  cliente_nome: z
    .string()
    .trim()
    .min(3, 'Nome do cliente precisa ter ao menos 3 caracteres')
    .max(200, 'Máximo 200 caracteres'),
  cliente_contato: z.string().max(100).optional().default(''),
  cliente_telefone: z
    .string()
    .optional()
    .default('')
    .refine((v) => !v || PHONE_REGEX.test(v), {
      message: 'Formato: (XX) XXXXX-XXXX',
    }),
  cliente_email: z
    .string()
    .optional()
    .default('')
    .refine((v) => !v || EMAIL_REGEX.test(v), { message: 'Email inválido' }),
  cliente_cidade: z.string().max(100).optional().default(''),
  descricao: z.string().max(1000, 'Máximo 1000 caracteres').optional().default(''),
  escopo_resumo: z.string().max(500, 'Máximo 500 caracteres').optional().default(''),
  valor_estimado: z.coerce.number().min(0, 'Valor não pode ser negativo').default(0),
  prazo_estimado: z.string().max(50).optional().default(''),
  responsavel: z.string().max(100).optional().default(''),
  obra_id: z.string().optional().default(''),
  observacao: z.string().max(1000, 'Máximo 1000 caracteres').optional().default(''),
})

export type OrcamentoFormValues = z.input<typeof orcamentoSchema>

// Payload que os Server Actions (createOrcamento, updateOrcamento) aceitam.
export type OrcamentoPayload = {
  numero: string | null
  data_solicitacao: string
  cliente_nome: string
  cliente_contato: string | null
  cliente_telefone: string | null
  cliente_email: string | null
  cliente_cidade: string | null
  descricao: string | null
  escopo_resumo: string | null
  valor_estimado: number
  prazo_estimado: string | null
  responsavel: string | null
  obra_id: string | null
  observacao: string | null
}

function emptyToNull(value: string | undefined | null): string | null {
  const trimmed = (value ?? '').trim()
  return trimmed === '' ? null : trimmed
}

/** Converte valores do form (strings vazias) em payload (nulls). */
export function formValuesToPayload(
  values: OrcamentoFormValues,
): OrcamentoPayload {
  return {
    numero: emptyToNull(values.numero),
    data_solicitacao:
      values.data_solicitacao ?? new Date().toISOString().slice(0, 10),
    cliente_nome: (values.cliente_nome ?? '').trim(),
    cliente_contato: emptyToNull(values.cliente_contato),
    cliente_telefone: emptyToNull(values.cliente_telefone),
    cliente_email: emptyToNull(values.cliente_email),
    cliente_cidade: emptyToNull(values.cliente_cidade),
    descricao: emptyToNull(values.descricao),
    escopo_resumo: emptyToNull(values.escopo_resumo),
    valor_estimado: Number(values.valor_estimado ?? 0),
    prazo_estimado: emptyToNull(values.prazo_estimado),
    responsavel: emptyToNull(values.responsavel),
    obra_id: emptyToNull(values.obra_id),
    observacao: emptyToNull(values.observacao),
  }
}

/** Converte um Orcamento do banco em valores iniciais do form (nulls → ''). */
export function orcamentoToFormValues(o: Orcamento): OrcamentoFormValues {
  return {
    numero: o.numero ?? '',
    data_solicitacao: o.data_solicitacao ?? '',
    cliente_nome: o.cliente_nome ?? '',
    cliente_contato: o.cliente_contato ?? '',
    cliente_telefone: o.cliente_telefone ?? '',
    cliente_email: o.cliente_email ?? '',
    cliente_cidade: o.cliente_cidade ?? '',
    descricao: o.descricao ?? '',
    escopo_resumo: o.escopo_resumo ?? '',
    valor_estimado: o.valor_estimado ?? 0,
    prazo_estimado: o.prazo_estimado ?? '',
    responsavel: o.responsavel ?? '',
    obra_id: o.obra_id ?? '',
    observacao: o.observacao ?? '',
  }
}

export function emptyFormValues(): OrcamentoFormValues {
  return {
    numero: '',
    data_solicitacao: new Date().toISOString().slice(0, 10),
    cliente_nome: '',
    cliente_contato: '',
    cliente_telefone: '',
    cliente_email: '',
    cliente_cidade: '',
    descricao: '',
    escopo_resumo: '',
    valor_estimado: 0,
    prazo_estimado: '',
    responsavel: '',
    obra_id: '',
    observacao: '',
  }
}
