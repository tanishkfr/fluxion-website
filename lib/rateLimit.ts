/**
 * A small sliding-window limiter held in module memory.
 *
 * Serverless instances are not shared, so this caps one warm instance rather
 * than the whole deployment. That is enough to stop a script hammering the
 * endpoint, and it costs nothing. If enquiry volume ever justifies it, swap the
 * Map for a shared store (Vercel KV, Upstash) behind the same function.
 */

const WINDOW_MS = 10 * 60 * 1000
const MAX_IN_WINDOW = 5
/** Stop the map growing without bound on a long-lived instance. */
const MAX_KEYS = 5000

const hits = new Map<string, number[]>()

export interface RateResult {
  ok: boolean
  /** Seconds until the caller may try again. Only meaningful when ok is false. */
  retryAfter: number
}

export function rateLimit(key: string, now = Date.now()): RateResult {
  if (hits.size > MAX_KEYS) hits.clear()

  const cutoff = now - WINDOW_MS
  const recent = (hits.get(key) ?? []).filter((t) => t > cutoff)

  if (recent.length >= MAX_IN_WINDOW) {
    const oldest = recent[0] ?? now
    hits.set(key, recent)
    return { ok: false, retryAfter: Math.ceil((oldest + WINDOW_MS - now) / 1000) }
  }

  recent.push(now)
  hits.set(key, recent)
  return { ok: true, retryAfter: 0 }
}

/** Best-effort client address from the proxy headers Vercel sets. */
export function clientKey(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first
  }
  return headers.get('x-real-ip') ?? 'unknown'
}
