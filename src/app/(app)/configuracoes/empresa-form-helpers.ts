import { z } from 'zod'

import { PHONE_REGEX } from '@/lib/phone'
import type { Empresa } from '@/lib/types'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const empresaSchema = z.object({
  nome: z.string().trim().min(2, 'Mínimo 2 caracteres').max(200),
  razao_social: z.string().trim().min(2, 'Mínimo 2 caracteres').max(200),
  cnpj: z.string().max(20).optional().default(''),
  email: z
    .string()
    .optional()
    .default('')
    .refine((v) => !v || EMAIL_REGEX.test(v), { message: 'Email inválido' }),
  telefone: z
    .string()
    .optional()
    .default('')
    .refine((v) => !v || PHONE_REGEX.test(v), {
      message: 'Formato: (XX) XXXXX-XXXX',
    }),
  endereco: z.string().max(200).optional().default(''),
  cidade: z.string().max(100).optional().default(''),
  cep: z.string().max(15).optional().default(''),
  inscricao_estadual: z.string().max(30).optional().default(''),
  inscricao_municipal: z.string().max(30).optional().default(''),
})

export type EmpresaFormValues = z.input<typeof empresaSchema>

export type EmpresaPayload = {
  nome: string
  razao_social: string
  cnpj: string | null
  email: string | null
  telefone: string | null
  endereco: string | null
  cidade: string | null
  cep: string | null
  inscricao_estadual: string | null
  inscricao_municipal: string | null
}

function emptyToNull(value: string | undefined | null): string | null {
  const trimmed = (value ?? '').trim()
  return trimmed === '' ? null : trimmed
}

export function formValuesToPayload(values: EmpresaFormValues): EmpresaPayload {
  return {
    nome: (values.nome ?? '').trim(),
    razao_social: (values.razao_social ?? '').trim(),
    cnpj: emptyToNull(values.cnpj),
    email: emptyToNull(values.email),
    telefone: emptyToNull(values.telefone),
    endereco: emptyToNull(values.endereco),
    cidade: emptyToNull(values.cidade),
    cep: emptyToNull(values.cep),
    inscricao_estadual: emptyToNull(values.inscricao_estadual),
    inscricao_municipal: emptyToNull(values.inscricao_municipal),
  }
}

export function empresaToFormValues(e: Empresa): EmpresaFormValues {
  return {
    nome: e.nome ?? '',
    razao_social: e.razao_social ?? '',
    cnpj: e.cnpj ?? '',
    email: e.email ?? '',
    telefone: e.telefone ?? '',
    endereco: e.endereco ?? '',
    cidade: e.cidade ?? '',
    cep: e.cep ?? '',
    inscricao_estadual: e.inscricao_estadual ?? '',
    inscricao_municipal: e.inscricao_municipal ?? '',
  }
}
