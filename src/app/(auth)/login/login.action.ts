'use server'

import { headers } from 'next/headers'
import { z } from 'zod'

import { checkRateLimit } from '@/lib/rate-limit'
import { createClient } from '@/lib/supabase/server'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const LOGIN_RATE_LIMIT = {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000,
}

export async function loginAction(input: { email: string; password: string }) {
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) return { error: 'Dados inválidos' }

  const headersList = await headers()
  const ip = headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  const rateLimitKey = `login:${ip}:${parsed.data.email}`
  const { allowed, retryAfterMs } = checkRateLimit(rateLimitKey, LOGIN_RATE_LIMIT)

  if (!allowed) {
    const retryMinutes = Math.ceil(retryAfterMs / 60_000)
    return { error: `Muitas tentativas. Tente novamente em ${retryMinutes} minuto(s).` }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) return { error: 'Email ou senha incorretos' }
  return { success: true }
}
