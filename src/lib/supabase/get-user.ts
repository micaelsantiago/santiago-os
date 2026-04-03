import { redirect } from 'next/navigation'
import { createServerClient } from './server'

export async function getAuthenticatedUser() {
  const supabase = await createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) redirect('/login')

  return { supabase, user }
}
