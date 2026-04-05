import { beforeEach, describe, expect, it, vi } from 'vitest'
import { _resetStore } from '@/lib/rate-limit'

// Mock next/headers
vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue({
    get: (name: string) => (name === 'x-forwarded-for' ? '127.0.0.1' : null),
  }),
}))

// Mock Supabase
const mockSignIn = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue({
    auth: {
      signInWithPassword: (...args: unknown[]) => mockSignIn(...args),
    },
  }),
}))

// Import after mocks
const { loginAction } = await import('@/app/(auth)/login/login.action')

beforeEach(() => {
  _resetStore()
  mockSignIn.mockReset()
})

describe('loginAction', () => {
  it('retorna erro com input inválido', async () => {
    const result = await loginAction({ email: 'not-email', password: '' })
    expect(result.error).toBe('Dados inválidos')
  })

  it('login com sucesso', async () => {
    mockSignIn.mockResolvedValueOnce({ error: null })

    const result = await loginAction({ email: 'user@test.com', password: 'pass123' })
    expect(result).toEqual({ success: true })
    expect(mockSignIn).toHaveBeenCalledWith({ email: 'user@test.com', password: 'pass123' })
  })

  it('retorna erro genérico em falha de auth', async () => {
    mockSignIn.mockResolvedValueOnce({ error: { message: 'Invalid credentials' } })

    const result = await loginAction({ email: 'user@test.com', password: 'wrong' })
    expect(result.error).toBe('Email ou senha incorretos')
  })

  it('bloqueia após 5 tentativas', async () => {
    mockSignIn.mockResolvedValue({ error: { message: 'fail' } })

    for (let i = 0; i < 5; i++) {
      await loginAction({ email: 'user@test.com', password: 'wrong' })
    }

    const result = await loginAction({ email: 'user@test.com', password: 'wrong' })
    expect(result.error).toMatch(/Muitas tentativas/)
  })

  it('rate limit isola emails diferentes', async () => {
    mockSignIn.mockResolvedValue({ error: { message: 'fail' } })

    for (let i = 0; i < 5; i++) {
      await loginAction({ email: 'user1@test.com', password: 'wrong' })
    }

    // user1 bloqueado
    const blocked = await loginAction({ email: 'user1@test.com', password: 'wrong' })
    expect(blocked.error).toMatch(/Muitas tentativas/)

    // user2 ainda funciona
    const allowed = await loginAction({ email: 'user2@test.com', password: 'wrong' })
    expect(allowed.error).toBe('Email ou senha incorretos')
  })
})
