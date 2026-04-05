import { getAuthenticatedUserWithRole } from '@/lib/supabase/get-user'
import { ALL_MODULES } from '@/lib/rbac'
import type { Module } from '@/lib/rbac'
import { AppShell } from '@/components/layout/AppShell'

interface AppLayoutProps {
  children: React.ReactNode
}

export default async function AppLayout({ children }: AppLayoutProps) {
  const { supabase, user, isMaster } = await getAuthenticatedUserWithRole()

  let allowedModules: Module[]

  if (isMaster) {
    allowedModules = [...ALL_MODULES]
  } else {
    const { data: permissions } = await supabase
      .from('member_permissions')
      .select('module')
      .eq('member_id', user.id)

    allowedModules = (permissions ?? []).map((p) => p.module) as Module[]
  }

  return (
    <AppShell allowedModules={allowedModules} isMaster={isMaster}>
      {children}
    </AppShell>
  )
}
