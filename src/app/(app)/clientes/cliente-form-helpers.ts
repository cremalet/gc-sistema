// Helpers puros do form de cliente. SEM 'use client' pra poder ser
// importado de Server Components (page.tsx de editar) e Server Actions.

import { z } from 'zod'

import { PHONE_REGEX } from '@/lib/phone'
import type { Cliente } from '@/lib/types'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const clienteSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(3, 'Nome precisa ter ao menos 3 caracteres')
    .max(200, 'Máximo 200 caracteres'),
  cnpj_cpf: z
    .string()
    .max(20, 'Máximo 20 caracteres')
    .optional()
    .default(''),
  contato: z.string().max(100).optional().default(''),
  telefone: z
    .string()
    .optional()
    .default('')
    .refine((v) => !v || PHONE_REGEX.test(v), {
      message: 'Formato: (XX) XXXXX-XXXX',
    }),
  email: z
    .string()
    .optional()
    .default('')
    .refine((v) => !v || EMAIL_REGEX.test(v), { message: 'Email inválido' }),
  endereco: z.string().max(200).optional().default(''),
  cidade: z.string().max(100).optional().default(''),
  cep: z.string().max(15).optional().default(''),
  observacao: z.string().max(1000).optional().default(''),
})

export type ClienteFormValues = z.input<typeof clienteSchema>

export type ClientePayload = {
  nome: string
  cnpj_cpf: string | null
  contato: string | null
  telefone: string | null
  email: string | null
  endereco: string | null
  cidade: string | null
  cep: string | null
  observacao: string | null
}

function emptyToNull(value: string | undefined | null): string | null {
  const trimmed = (value ?? '').trim()
  return trimmed === '' ? null : trimmed
}

export function formValuesToPayload(values: ClienteFormValues): ClientePayload {
  return {
    nome: (values.nome ?? '').trim(),
    cnpj_cpf: emptyToNull(values.cnpj_cpf),
    contato: emptyToNull(values.contato),
    telefone: emptyToNull(values.telefone),
    email: emptyToNull(values.email),
    endereco: emptyToNull(values.endereco),
    cidade: emptyToNull(values.cidade),
    cep: emptyToNull(values.cep),
    observacao: emptyToNull(values.observacao),
  }
}

export function clienteToFormValues(c: Cliente): ClienteFormValues {
  return {
    nome: c.nome ?? '',
    cnpj_cpf: c.cnpj_cpf ?? '',
    contato: c.contato ?? '',
    telefone: c.telefone ?? '',
    email: c.email ?? '',
    endereco: c.endereco ?? '',
    cidade: c.cidade ?? '',
    cep: c.cep ?? '',
    observacao: c.observacao ?? '',
  }
}

export function emptyFormValues(): ClienteFormValues {
  return {
    nome: '',
    cnpj_cpf: '',
    contato: '',
    telefone: '',
    email: '',
    endereco: '',
    cidade: '',
    cep: '',
    observacao: '',
  }
}
