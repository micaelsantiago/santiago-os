import { describe, expect, it } from 'vitest'
import { cn } from '@/lib/utils'
import { getQueryClient, makeQueryClient } from '@/lib/query-client'

describe('cn', () => {
  it('combina classes', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('resolve conflitos do tailwind', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2')
  })

  it('aceita condicionais', () => {
    expect(cn('base', false && 'hidden', 'end')).toBe('base end')
  })

  it('retorna string vazia sem args', () => {
    expect(cn()).toBe('')
  })
})

describe('makeQueryClient', () => {
  it('cria QueryClient com defaults', () => {
    const client = makeQueryClient()
    const defaults = client.getDefaultOptions()
    expect(defaults.queries?.staleTime).toBe(60_000)
    expect(defaults.queries?.refetchOnWindowFocus).toBe(false)
  })
})

describe('getQueryClient', () => {
  it('retorna nova instância no servidor (sem window)', () => {
    const original = globalThis.window
    // @ts-expect-error -- simulate SSR
    delete globalThis.window

    const a = getQueryClient()
    const b = getQueryClient()
    expect(a).not.toBe(b)

    globalThis.window = original
  })

  it('retorna singleton no browser', () => {
    // window exists in this environment by default via globalThis
    const originalWindow = globalThis.window
    // @ts-expect-error -- simulate browser
    globalThis.window = {} as Window & typeof globalThis

    const a = getQueryClient()
    const b = getQueryClient()
    expect(a).toBe(b)

    globalThis.window = originalWindow
  })
})
