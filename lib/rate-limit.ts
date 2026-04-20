const store = new Map<string, { count: number; reset: number }>()

// Returns true if the request is allowed, false if rate limit exceeded.
// limit: max requests per window. windowMs: window size in milliseconds.
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.reset) {
    store.set(key, { count: 1, reset: now + windowMs })
    return true
  }

  if (entry.count >= limit) return false
  entry.count++
  return true
}
