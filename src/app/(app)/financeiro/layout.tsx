import type { ReactNode } from 'react'

import { requirePerfil } from '@/lib/auth-guards'

export default async function FinanceiroLayout({
  children,
}: {
  children: ReactNode
}) {
  await requirePerfil(['admin', 'financeiro', 'visualizador'])
  return <>{children}</>
}
