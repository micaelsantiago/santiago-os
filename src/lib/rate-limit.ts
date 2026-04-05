interface RateLimitEntry {
  timestamps: number[]
}

const store = new Map<string, RateLimitEntry>()

const CLEANUP_INTERVAL = 5 * 60 * 1000
const MAX_WINDOW = 15 * 60 * 1000

if (typeof globalThis !== 'undefined' && !('__rateLimitCleanup' in globalThis)) {
  ;(globalThis as Record<string, unknown>).__rateLimitCleanup = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of store) {
      entry.timestamps = entry.timestamps.filter((t) => now - t < MAX_WINDOW)
      if (entry.timestamps.length === 0) store.delete(key)
    }
  }, CLEANUP_INTERVAL)
}

interface RateLimitConfig {
  maxAttempts: number
  windowMs: number
}

interface RateLimitResult {
  allowed: boolean
  retryAfterMs: number
}

export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  const now = Date.now()
  const entry = store.get(key) ?? { timestamps: [] }

  entry.timestamps = entry.timestamps.filter((t) => now - t < config.windowMs)

  if (entry.timestamps.length >= config.maxAttempts) {
    const oldestInWindow = entry.timestamps[0]
    const retryAfterMs = config.windowMs - (now - oldestInWindow)
    return { allowed: false, retryAfterMs }
  }

  entry.timestamps.push(now)
  store.set(key, entry)
  return { allowed: true, retryAfterMs: 0 }
}

/** Exposed for testing only */
export function _resetStore() {
  store.clear()
}
