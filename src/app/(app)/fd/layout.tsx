import type { ReactNode } from 'react'

import { requirePerfil } from '@/lib/auth-guards'

export default async function FdLayout({
  children,
}: {
  children: ReactNode
}) {
  await requirePerfil(['admin', 'financeiro', 'visualizador'])
  return <>{children}</>
}
