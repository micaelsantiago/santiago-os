'use server'

import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { revalidatePath } from 'next/cache'

import { getAuthenticatedUserWithRole } from '@/lib/supabase/get-user'
import {
  createMemberSchema,
  updateMemberPermissionsSchema,
} from '@/modules/settings/types/member.types'
import type {
  CreateMemberInput,
  Member,
  UpdateMemberPermissionsInput,
} from '@/modules/settings/types/member.types'

const uuidParam = z.string().uuid()

function getAdminClient() {
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

export async function getMembers(): Promise<{ success?: true; data?: Member[]; error?: string }> {
  const auth = await getAuthenticatedUserWithRole()
  if (!auth.isMaster) return { error: 'Não autorizado' }

  const { data: members, error } = await auth.supabase
    .from('profiles')
    .select('id, name, role, created_at')
    .order('created_at', { ascending: true })

  if (error) return { error: 'Erro ao buscar membros' }

  // Buscar permissões de todos os members
  const memberIds = (members ?? []).filter((m) => m.role === 'member').map((m) => m.id)

  let permissionsMap: Record<string, string[]> = {}
  if (memberIds.length > 0) {
    const { data: permissions } = await auth.supabase
      .from('member_permissions')
      .select('member_id, module')
      .in('member_id', memberIds)

    permissionsMap = (permissions ?? []).reduce(
      (acc, p) => {
        if (!acc[p.member_id]) acc[p.member_id] = []
        acc[p.member_id].push(p.module)
        return acc
      },
      {} as Record<string, string[]>,
    )
  }

  // Buscar emails via admin API
  const adminSupabase = getAdminClient()
  const { data: authUsers } = await adminSupabase.auth.admin.listUsers()
  const emailMap = (authUsers?.users ?? []).reduce(
    (acc, u) => {
      acc[u.id] = u.email ?? ''
      return acc
    },
    {} as Record<string, string>,
  )

  const result: Member[] = (members ?? []).map((m) => ({
    id: m.id,
    name: m.name,
    email: emailMap[m.id] ?? '',
    role: m.role as 'master' | 'member',
    modules: permissionsMap[m.id] ?? [],
    created_at: m.created_at,
  }))

  return { success: true, data: result }
}

export async function createMember(input: CreateMemberInput) {
  const auth = await getAuthenticatedUserWithRole()
  if (!auth.isMaster) return { error: 'Não autorizado' }

  const parsed = createMemberSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.flatten() }

  const adminSupabase = getAdminClient()

  // 1. Criar auth user
  const { data: newUser, error: authError } = await adminSupabase.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
  })

  if (authError || !newUser.user) return { error: authError?.message ?? 'Erro ao criar usuário' }

  // 2. Criar profile
  const { error: profileError } = await adminSupabase.from('profiles').insert({
    id: newUser.user.id,
    name: parsed.data.name,
    role: 'member',
    master_id: auth.user.id,
  })

  if (profileError) {
    // Rollback: deletar auth user
    await adminSupabase.auth.admin.deleteUser(newUser.user.id)
    return { error: 'Erro ao criar perfil' }
  }

  // 3. Inserir permissões de módulo
  const permissions = parsed.data.modules.map((module) => ({
    member_id: newUser.user.id,
    module,
  }))

  const { error: permError } = await adminSupabase.from('member_permissions').insert(permissions)

  if (permError) return { error: 'Erro ao configurar permissões' }

  revalidatePath('/settings/members')
  return { success: true, data: { id: newUser.user.id } }
}

export async function updateMemberPermissions(input: UpdateMemberPermissionsInput) {
  const auth = await getAuthenticatedUserWithRole()
  if (!auth.isMaster) return { error: 'Não autorizado' }

  const parsed = updateMemberPermissionsSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.flatten() }

  // Verificar que o target é member (não master)
  const { data: target } = await auth.supabase
    .from('profiles')
    .select('role')
    .eq('id', parsed.data.memberId)
    .single()

  if (!target || target.role !== 'member') return { error: 'Membro não encontrado' }

  const adminSupabase = getAdminClient()

  // Replace: deletar permissões existentes e inserir novas
  await adminSupabase.from('member_permissions').delete().eq('member_id', parsed.data.memberId)

  const permissions = parsed.data.modules.map((module) => ({
    member_id: parsed.data.memberId,
    module,
  }))

  const { error } = await adminSupabase.from('member_permissions').insert(permissions)

  if (error) return { error: 'Erro ao atualizar permissões' }

  revalidatePath('/settings/members')
  return { success: true }
}

export async function deleteMember(memberId: string) {
  if (!uuidParam.safeParse(memberId).success) return { error: 'ID inválido' }

  const auth = await getAuthenticatedUserWithRole()
  if (!auth.isMaster) return { error: 'Não autorizado' }

  // Verificar que o target não é master
  const { data: target } = await auth.supabase
    .from('profiles')
    .select('role')
    .eq('id', memberId)
    .single()

  if (!target) return { error: 'Membro não encontrado' }
  if (target.role === 'master') return { error: 'Não é possível deletar o master' }

  const adminSupabase = getAdminClient()
  const { error } = await adminSupabase.auth.admin.deleteUser(memberId)

  if (error) return { error: 'Erro ao deletar membro' }

  revalidatePath('/settings/members')
  return { success: true }
}
