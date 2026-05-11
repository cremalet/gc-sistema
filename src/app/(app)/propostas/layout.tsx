import type { ReactNode } from 'react'

import { requirePerfil } from '@/lib/auth-guards'

export default async function PropostasLayout({
  children,
}: {
  children: ReactNode
}) {
  await requirePerfil(['admin', 'comercial', 'visualizador'])
  return <>{children}</>
}
