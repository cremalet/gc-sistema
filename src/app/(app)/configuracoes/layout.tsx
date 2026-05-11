import type { ReactNode } from 'react'

import { requirePerfil } from '@/lib/auth-guards'

export default async function ConfiguracoesLayout({
  children,
}: {
  children: ReactNode
}) {
  await requirePerfil(['admin'])
  return <>{children}</>
}
