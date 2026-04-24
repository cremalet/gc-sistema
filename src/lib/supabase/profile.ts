import { cache } from 'react'

import { createClient } from './server'
import type { Profile } from './types'

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

  return data
})
