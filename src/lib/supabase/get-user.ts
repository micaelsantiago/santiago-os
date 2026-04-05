import { redirect } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createClient } from './server'
import type { Database } from './database.types'
import type { Module } from '@/lib/rbac'

interface AuthResult {
  supabase: SupabaseClient<Database>
  user: User
}

interface AuthResultWithRole extends AuthResult {
  profile: { role: 'master' | 'member'; master_id: string | null }
  effectiveUserId: string
  isMaster: boolean
}

export async function getAuthenticatedUser(): Promise<AuthResult> {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) redirect('/login')

  return { supabase, user }
}

export async function getAuthenticatedUserWithRole(): Promise<AuthResultWithRole> {
  const { supabase, user } = await getAuthenticatedUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, master_id')
    .eq('id', user.id)
    .single()

  // Se não tem profile, assume master (primeiro acesso, trigger cria)
  const role = (profile?.role as 'master' | 'member') ?? 'master'
  const master_id = profile?.master_id ?? null
  const isMaster = role === 'master'
  const effectiveUserId = isMaster ? user.id : master_id!

  return {
    supabase,
    user,
    profile: { role, master_id },
    effectiveUserId,
    isMaster,
  }
}

export async function checkModuleAccess(module: Module): Promise<AuthResultWithRole> {
  const auth = await getAuthenticatedUserWithRole()

  if (auth.isMaster) return auth

  const { data } = await auth.supabase
    .from('member_permissions')
    .select('module')
    .eq('member_id', auth.user.id)
    .eq('module', module)
    .single()

  if (!data) redirect('/no-access')

  return auth
}
