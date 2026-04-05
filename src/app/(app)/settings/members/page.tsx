import { getAuthenticatedUserWithRole } from '@/lib/supabase/get-user'
import { redirect } from 'next/navigation'
import { getMembers } from '@/modules/settings/actions/member.actions'
import { MembersPageClient } from './MembersPageClient'

export default async function MembersPage() {
  const { isMaster } = await getAuthenticatedUserWithRole()
  if (!isMaster) redirect('/no-access')

  const result = await getMembers()
  const members = result.success ? (result.data ?? []) : []

  return <MembersPageClient initialMembers={members} />
}
