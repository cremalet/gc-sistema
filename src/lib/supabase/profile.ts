import { cache } from 'react'

import type { Profile } from '../types'
import { createClient } from './server'

// Cacheado por request via React cache — se layout e page chamarem no mesmo
// request, roda a query uma vez só.
export const getCurrentProfile = cache(async (): Promise<Profile | null> => {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select(
      'id, empresa_id, nome, email, perfil, ativo, created_at, updated_at',
    )
    .eq('id', user.id)
    .maybeSingle()

  // Cast: o banco garante perfil ∈ Perfil (CHECK constraint), mas o gen tipa
  // como `string`. Ver definição de Profile em lib/types.ts.
  return data as Profile | null
})
