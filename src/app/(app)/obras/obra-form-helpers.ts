import { z } from 'zod'

import type { Obra, ObraStatus } from '@/lib/types'

export const obraSchema = z
  .object({
    codigo_obra: z
      .string()
      .trim()
      .min(1, 'Código obrigatório')
      .max(50, 'Máximo 50 caracteres'),
    nome: z
      .string()
      .trim()
      .min(2, 'Nome precisa ter ao menos 2 caracteres')
      .max(200),
    cliente_id: z.string().uuid('Selecione um cliente'),
    status: z.enum(['ativa', 'concluida', 'suspensa', 'cancelada']),
    prazo_execucao: z.string().max(100).optional().default(''),
    data_inicio: z.string().optional().default(''),
    data_prevista_fim: z.string().optional().default(''),
    data_real_fim: z.string().optional().default(''),
    endereco: z.string().max(200).optional().default(''),
    cidade: z.string().max(100).optional().default(''),
    cep: z.string().max(15).optional().default(''),
    observacao: z.string().max(1000).optional().default(''),
  })
  .refine(
    (data) => {
      if (!data.data_inicio || !data.data_prevista_fim) return true
      return data.data_inicio <= data.data_prevista_fim
    },
    { message: 'Data prevista de fim deve ser igual ou após o início', path: ['data_prevista_fim'] },
  )

export type ObraFormValues = z.input<typeof obraSchema>

export type ObraPayload = {
  codigo_obra: string
  nome: string
  cliente_id: string
  status: ObraStatus
  prazo_execucao: string | null
  data_inicio: string | null
  data_prevista_fim: string | null
  data_real_fim: string | null
  endereco: string | null
  cidade: string | null
  cep: string | null
  observacao: string | null
}

function emptyToNull(value: string | undefined | null): string | null {
  const trimmed = (value ?? '').trim()
  return trimmed === '' ? null : trimmed
}

export function formValuesToPayload(values: ObraFormValues): ObraPayload {
  return {
    codigo_obra: (values.codigo_obra ?? '').trim(),
    nome: (values.nome ?? '').trim(),
    cliente_id: values.cliente_id,
    status: values.status,
    prazo_execucao: emptyToNull(values.prazo_execucao),
    data_inicio: emptyToNull(values.data_inicio),
    data_prevista_fim: emptyToNull(values.data_prevista_fim),
    data_real_fim: emptyToNull(values.data_real_fim),
    endereco: emptyToNull(values.endereco),
    cidade: emptyToNull(values.cidade),
    cep: emptyToNull(values.cep),
    observacao: emptyToNull(values.observacao),
  }
}

export function obraToFormValues(o: Obra): ObraFormValues {
  return {
    codigo_obra: o.codigo_obra ?? '',
    nome: o.nome ?? '',
    cliente_id: o.cliente_id,
    status: (o.status as ObraStatus) ?? 'ativa',
    prazo_execucao: o.prazo_execucao ?? '',
    data_inicio: o.data_inicio ?? '',
    data_prevista_fim: o.data_prevista_fim ?? '',
    data_real_fim: o.data_real_fim ?? '',
    endereco: o.endereco ?? '',
    cidade: o.cidade ?? '',
    cep: o.cep ?? '',
    observacao: o.observacao ?? '',
  }
}

export function emptyFormValues(): ObraFormValues {
  return {
    codigo_obra: '',
    nome: '',
    cliente_id: '',
    status: 'ativa',
    prazo_execucao: '',
    data_inicio: '',
    data_prevista_fim: '',
    data_real_fim: '',
    endereco: '',
    cidade: '',
    cep: '',
    observacao: '',
  }
}
