import { redirect } from 'next/navigation'

import { getCurrentProfile } from './supabase/profile'
import type { Perfil, Profile } from './types'

/**
 * Garante que o usuário está autenticado e tem um dos perfis permitidos.
 * Use no topo de Server Components / layouts protegidos por rota.
 *
 * - Sem perfil (anônimo / não-cadastrado) → /login
 * - Perfil fora da allow-list → / (dashboard)
 */
export async function requirePerfil(
  allowed: readonly Perfil[],
): Promise<Profile> {
  const profile = await getCurrentProfile()
  if (!profile) redirect('/login')
  if (!allowed.includes(profile.perfil)) redirect('/')
  return profile
}
