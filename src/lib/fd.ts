import type { Fd, StatusFdPagamento } from './types'

/**
 * Status de pagamento de FD é DERIVADO em runtime — não existe coluna no banco.
 * Regras:
 *   - data_pagamento != null              → 'pago'
 *   - data_pagamento null + vencimento <  → 'vencido'
 *   - caso contrário                       → 'pendente'
 */
export function computeStatusFd(
  fd: Pick<Fd, 'data_pagamento' | 'data_vencimento'>,
): StatusFdPagamento {
  if (fd.data_pagamento) return 'pago'

  if (fd.data_vencimento) {
    const hoje = new Date().toISOString().slice(0, 10)
    if (fd.data_vencimento < hoje) return 'vencido'
  }

  return 'pendente'
}

export const STATUS_FD_LABELS: Record<StatusFdPagamento, string> = {
  pendente: 'Pendente',
  pago: 'Pago',
  vencido: 'Vencido',
}

export function formatStatusFdLabel(s: StatusFdPagamento): string {
  return STATUS_FD_LABELS[s]
}

export const UNIDADE_FD_OPTIONS = ['UN', 'KG', 'M', 'M2', 'PC', 'OUTRO'] as const
export type UnidadeFd = (typeof UNIDADE_FD_OPTIONS)[number]
