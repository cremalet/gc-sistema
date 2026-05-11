import { z } from 'zod'

import { UNIDADE_FD_OPTIONS } from '@/lib/fd'
import type { Fd } from '@/lib/types'

export const fdSchema = z
  .object({
    obra_id: z.string().uuid('Selecione uma obra'),
    pedido_documento: z.string().max(100).optional().default(''),
    item_parcela: z.string().max(50).optional().default(''),
    data_lancamento: z.string().min(1, 'Data de lançamento obrigatória'),
    data_vencimento: z.string().optional().default(''),
    data_pagamento: z.string().optional().default(''),
    codigo: z.string().max(100).optional().default(''),
    especificacao: z.string().max(1000).optional().default(''),
    unidade: z.string().optional().default(''),
    quantidade: z.coerce.number().min(0).optional().default(0),
    preco_unitario: z.coerce.number().min(0).optional().default(0),
    fornecedor: z
      .string()
      .trim()
      .min(3, 'Fornecedor precisa ter ao menos 3 caracteres')
      .max(200),
    valor: z.coerce.number().min(0, 'Valor não pode ser negativo'),
    valor_descontar: z
      .coerce.number()
      .min(0, 'Valor a descontar não pode ser negativo'),
    justificativa: z.string().max(1000).optional().default(''),
    observacao: z.string().max(1000).optional().default(''),
  })
  .refine((data) => data.valor_descontar <= data.valor, {
    message: 'Valor a descontar não pode exceder o valor',
    path: ['valor_descontar'],
  })

export type FdFormValues = z.input<typeof fdSchema>

export type FdPayload = {
  obra_id: string
  pedido_documento: string | null
  item_parcela: string | null
  data_lancamento: string
  data_vencimento: string | null
  data_pagamento: string | null
  codigo: string | null
  especificacao: string | null
  unidade: string | null
  quantidade: number | null
  preco_unitario: number | null
  fornecedor: string
  valor: number
  valor_descontar: number
  justificativa: string | null
  observacao: string | null
}

function emptyToNull(value: string | undefined | null): string | null {
  const trimmed = (value ?? '').trim()
  return trimmed === '' ? null : trimmed
}

export function formValuesToPayload(values: FdFormValues): FdPayload {
  const unidade = emptyToNull(values.unidade)
  const isValidUnidade =
    unidade !== null && (UNIDADE_FD_OPTIONS as readonly string[]).includes(unidade)

  return {
    obra_id: values.obra_id,
    pedido_documento: emptyToNull(values.pedido_documento),
    item_parcela: emptyToNull(values.item_parcela),
    data_lancamento:
      values.data_lancamento ?? new Date().toISOString().slice(0, 10),
    data_vencimento: emptyToNull(values.data_vencimento),
    data_pagamento: emptyToNull(values.data_pagamento),
    codigo: emptyToNull(values.codigo),
    especificacao: emptyToNull(values.especificacao),
    unidade: isValidUnidade ? unidade : null,
    quantidade:
      values.quantidade != null && values.quantidade !== 0
        ? Number(values.quantidade)
        : null,
    preco_unitario:
      values.preco_unitario != null && values.preco_unitario !== 0
        ? Number(values.preco_unitario)
        : null,
    fornecedor: (values.fornecedor ?? '').trim(),
    valor: Number(values.valor ?? 0),
    valor_descontar: Number(values.valor_descontar ?? 0),
    justificativa: emptyToNull(values.justificativa),
    observacao: emptyToNull(values.observacao),
  }
}

export function fdToFormValues(fd: Fd): FdFormValues {
  return {
    obra_id: fd.obra_id,
    pedido_documento: fd.pedido_documento ?? '',
    item_parcela: fd.item_parcela ?? '',
    data_lancamento: fd.data_lancamento ?? '',
    data_vencimento: fd.data_vencimento ?? '',
    data_pagamento: fd.data_pagamento ?? '',
    codigo: fd.codigo ?? '',
    especificacao: fd.especificacao ?? '',
    unidade: fd.unidade ?? '',
    quantidade: fd.quantidade ?? 0,
    preco_unitario: fd.preco_unitario ?? 0,
    fornecedor: fd.fornecedor ?? '',
    valor: fd.valor ?? 0,
    valor_descontar: fd.valor_descontar ?? 0,
    justificativa: fd.justificativa ?? '',
    observacao: fd.observacao ?? '',
  }
}

export function emptyFormValues(): FdFormValues {
  return {
    obra_id: '',
    pedido_documento: '',
    item_parcela: '',
    data_lancamento: new Date().toISOString().slice(0, 10),
    data_vencimento: '',
    data_pagamento: '',
    codigo: '',
    especificacao: '',
    unidade: '',
    quantidade: 0,
    preco_unitario: 0,
    fornecedor: '',
    valor: 0,
    valor_descontar: 0,
    justificativa: '',
    observacao: '',
  }
}
