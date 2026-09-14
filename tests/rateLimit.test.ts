import assert from 'node:assert/strict'
import test from 'node:test'

import { clientKey, rateLimit } from '../lib/rateLimit.ts'

const WINDOW_MS = 10 * 60 * 1000
const MAX = 5

/** A key per test, so the module's shared window cannot leak between tests. */
function key(name: string): string {
  return `test-${name}`
}

test('five submissions pass and the sixth in the window is refused', () => {
  const now = 1_000_000
  const k = key('sixth')

  for (let i = 0; i < MAX; i += 1) {
    assert.equal(rateLimit(k, now + i).ok, true, `submission ${i + 1} should pass`)
  }

  const blocked = rateLimit(k, now + MAX)
  assert.equal(blocked.ok, false)
  assert.equal(blocked.retryAfter, WINDOW_MS / 1000)
})

test('one millisecond before the oldest hit expires, the window is still full', () => {
  const now = 2_000_000
  const k = key('edge-inside')

  for (let i = 0; i < MAX; i += 1) rateLimit(k, now + i)

  const blocked = rateLimit(k, now + WINDOW_MS - 1)
  assert.equal(blocked.ok, false)
  assert.equal(blocked.retryAfter, 1)
})

test('a hit exactly one window old no longer counts', () => {
  const now = 3_000_000
  const k = key('edge-outside')

  for (let i = 0; i < MAX; i += 1) rateLimit(k, now + i)

  const allowed = rateLimit(k, now + WINDOW_MS)
  assert.equal(allowed.ok, true)
  assert.equal(allowed.retryAfter, 0)
})

test('retryAfter counts down as the oldest hit ages', () => {
  const now = 4_000_000
  const k = key('retry')

  for (let i = 0; i < MAX; i += 1) rateLimit(k, now + i)

  assert.equal(rateLimit(k, now + 200_000).retryAfter, 400)
  assert.equal(rateLimit(k, now + 400_000).retryAfter, 200)
  assert.equal(rateLimit(k, now + 590_000).retryAfter, 10)
})

test('separate keys keep separate budgets', () => {
  const now = 5_000_000
  const a = key('separate-a')
  const b = key('separate-b')

  for (let i = 0; i < MAX; i += 1) rateLimit(a, now + i)

  assert.equal(rateLimit(a, now + MAX).ok, false)
  assert.equal(rateLimit(b, now + MAX).ok, true)
})

test('clientKey takes the first forwarded address', () => {
  const headers = new Headers({ 'x-forwarded-for': '203.0.113.9, 10.0.0.1' })
  assert.equal(clientKey(headers), '203.0.113.9')
})

test('clientKey falls back to x-real-ip and then to a fixed placeholder', () => {
  assert.equal(clientKey(new Headers({ 'x-real-ip': '198.51.100.7' })), '198.51.100.7')
  assert.equal(clientKey(new Headers()), 'unknown')
})
