import type { ReactNode } from 'react'

import { requirePerfil } from '@/lib/auth-guards'

export default async function ExecucaoLayout({
  children,
}: {
  children: ReactNode
}) {
  await requirePerfil(['admin', 'producao', 'medicao', 'visualizador'])
  return <>{children}</>
}
