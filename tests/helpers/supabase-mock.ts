import { vi } from 'vitest'

interface MockResult {
  data?: unknown
  error?: unknown
  count?: unknown
}

const resultQueue: MockResult[] = []

function createChainableMock() {
  const methods = [
    'from',
    'select',
    'insert',
    'update',
    'delete',
    'eq',
    'in',
    'is',
    'gte',
    'lte',
    'order',
    'limit',
    'range',
    'single',
  ] as const

  const mock: Record<string, unknown> = {}

  for (const method of methods) {
    mock[method] = vi.fn((..._args: unknown[]) => mock)
  }

  // Make the mock thenable so `await supabase.from(...).eq(...)` resolves
  mock.then = (resolve: (value: MockResult) => void) => {
    const result = resultQueue.shift() ?? { data: null, error: null }
    resolve(result)
  }

  return mock as Record<string, vi.Mock> & { then: (resolve: (value: MockResult) => void) => void }
}

export const mockSupabaseClient = createChainableMock()

/**
 * Enqueue a result that will be returned when the next Supabase chain is awaited.
 * Call once per `await` in the code under test, in order.
 */
export function mockResult(result: MockResult) {
  resultQueue.push(result)
}

export function resetMocks() {
  resultQueue.length = 0
  for (const [key, value] of Object.entries(mockSupabaseClient)) {
    if (key !== 'then' && typeof value === 'function' && 'mockClear' in value) {
      ;(value as vi.Mock).mockClear()
    }
  }
}

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn().mockResolvedValue(mockSupabaseClient),
}))

vi.mock('@/lib/supabase/get-user', () => ({
  getAuthenticatedUser: vi.fn().mockResolvedValue({
    supabase: mockSupabaseClient,
    user: { id: 'test-user-id', email: 'test@test.com' },
  }),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}))
