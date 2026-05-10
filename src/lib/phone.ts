/**
 * Aplica máscara brasileira de telefone no valor digitado.
 * Fixo: (XX) XXXX-XXXX (10 dígitos)
 * Celular: (XX) XXXXX-XXXX (11 dígitos)
 * Trata qualquer input, removendo não-dígitos e truncando em 11.
 */
export function formatPhoneMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)

  if (digits.length === 0) return ''
  if (digits.length <= 2) return `(${digits}`
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

/** Regex que valida o formato final da máscara (10 ou 11 dígitos mascarados). */
export const PHONE_REGEX = /^\(\d{2}\) \d{4,5}-\d{4}$/
