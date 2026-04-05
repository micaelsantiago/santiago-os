import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { checkRateLimit, _resetStore } from '@/lib/rate-limit'

beforeEach(() => {
  _resetStore()
  vi.useFakeTimers()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('checkRateLimit', () => {
  const config = { maxAttempts: 3, windowMs: 60_000 }

  it('permite tentativas dentro do limite', () => {
    expect(checkRateLimit('key1', config).allowed).toBe(true)
    expect(checkRateLimit('key1', config).allowed).toBe(true)
    expect(checkRateLimit('key1', config).allowed).toBe(true)
  })

  it('bloqueia após exceder o limite', () => {
    checkRateLimit('key2', config)
    checkRateLimit('key2', config)
    checkRateLimit('key2', config)

    const result = checkRateLimit('key2', config)
    expect(result.allowed).toBe(false)
    expect(result.retryAfterMs).toBeGreaterThan(0)
  })

  it('retorna retryAfterMs correto', () => {
    checkRateLimit('key3', config)
    vi.advanceTimersByTime(10_000)
    checkRateLimit('key3', config)
    vi.advanceTimersByTime(10_000)
    checkRateLimit('key3', config)

    const result = checkRateLimit('key3', config)
    expect(result.allowed).toBe(false)
    // O timestamp mais antigo tem 20s, então faltam ~40s da janela de 60s
    expect(result.retryAfterMs).toBeLessThanOrEqual(60_000)
    expect(result.retryAfterMs).toBeGreaterThan(30_000)
  })

  it('libera após a janela expirar', () => {
    checkRateLimit('key4', config)
    checkRateLimit('key4', config)
    checkRateLimit('key4', config)

    expect(checkRateLimit('key4', config).allowed).toBe(false)

    vi.advanceTimersByTime(60_001)

    expect(checkRateLimit('key4', config).allowed).toBe(true)
  })

  it('isola chaves diferentes', () => {
    checkRateLimit('a', config)
    checkRateLimit('a', config)
    checkRateLimit('a', config)

    expect(checkRateLimit('a', config).allowed).toBe(false)
    expect(checkRateLimit('b', config).allowed).toBe(true)
  })
})
