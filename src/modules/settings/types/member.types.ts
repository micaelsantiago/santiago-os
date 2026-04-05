import { z } from 'zod'
import { ALL_MODULES } from '@/lib/rbac'

export const createMemberSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
  name: z.string().min(1).max(255),
  modules: z.array(z.enum(ALL_MODULES)).min(1, 'Selecione pelo menos um módulo'),
})

export const updateMemberPermissionsSchema = z.object({
  memberId: z.string().uuid(),
  modules: z.array(z.enum(ALL_MODULES)).min(1, 'Selecione pelo menos um módulo'),
})

export const memberSchema = z.object({
  id: z.string().uuid(),
  name: z.string().nullable(),
  email: z.string().email(),
  role: z.enum(['master', 'member']),
  modules: z.array(z.string()),
  created_at: z.string().nullable(),
})

export type CreateMemberInput = z.infer<typeof createMemberSchema>
export type UpdateMemberPermissionsInput = z.infer<typeof updateMemberPermissionsSchema>
export type Member = z.infer<typeof memberSchema>
