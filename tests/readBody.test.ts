import assert from 'node:assert/strict'
import test from 'node:test'

import { MAX_BODY_BYTES, readBodyBounded } from '../lib/readBody.ts'

const URL = 'http://localhost:3000/api/contact'

function post(body: string): Request {
  return new Request(URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
  })
}

test('a body comfortably under the limit is returned intact', async () => {
  const payload = JSON.stringify({ name: 'Ada', message: 'Hello there.' })
  const result = await readBodyBounded(post(payload))
  assert.equal(result.ok, true)
  assert.equal(result.ok && result.text, payload)
})

test('a body exactly at the limit is accepted', async () => {
  const payload = 'a'.repeat(MAX_BODY_BYTES)
  const request = post(payload)
  request.headers.delete('content-length')

  const result = await readBodyBounded(request)
  assert.equal(result.ok, true)
  assert.equal(result.ok && result.text.length, MAX_BODY_BYTES)
})

test('one byte over the limit is refused', async () => {
  const result = await readBodyBounded(post('a'.repeat(MAX_BODY_BYTES + 1)))
  assert.deepEqual(result, { ok: false, reason: 'too-large' })
})

test('a missing Content-Length does not bypass the limit', async () => {
  const request = post('a'.repeat(MAX_BODY_BYTES + 1))
  request.headers.delete('content-length')
  assert.equal(request.headers.get('content-length'), null)

  const result = await readBodyBounded(request)
  assert.deepEqual(result, { ok: false, reason: 'too-large' })
})

test('a dishonest small Content-Length does not bypass the limit', async () => {
  const request = post('a'.repeat(MAX_BODY_BYTES + 1))
  request.headers.set('content-length', '10')
  assert.equal(request.headers.get('content-length'), '10')

  const result = await readBodyBounded(request)
  assert.deepEqual(result, { ok: false, reason: 'too-large' })
})

test('the byte ceiling counts UTF-8 bytes, not characters', async () => {
  // 6000 characters, 18000 bytes.
  const payload = '€'.repeat(6000)
  assert.equal(payload.length, 6000)

  const result = await readBodyBounded(post(payload))
  assert.deepEqual(result, { ok: false, reason: 'too-large' })
})

test('an empty body is returned as empty text rather than rejected', async () => {
  const request = new Request(URL, { method: 'POST' })
  const result = await readBodyBounded(request)
  assert.equal(result.ok, true)
  assert.equal(result.ok && result.text, '')
})

test('the limit is a parameter, so the helper is not tied to the endpoint', async () => {
  const result = await readBodyBounded(post('12345'), 4)
  assert.deepEqual(result, { ok: false, reason: 'too-large' })
})
