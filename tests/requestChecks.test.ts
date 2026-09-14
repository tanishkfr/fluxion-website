import assert from 'node:assert/strict'
import test from 'node:test'

import { isJsonContentType, isSameOriginRequest, requestHosts } from '../lib/requestChecks.ts'

/**
 * These functions only read `request.headers`, so the tests build that much of
 * a request. A real `Request` guards against setting `Host`/`Origin`, and a
 * standalone `Headers` is the honest way to supply them.
 */
function request(headers: Record<string, string>): Request {
  return { headers: new Headers(headers) } as unknown as Request
}

test('application/json is accepted, with or without parameters', () => {
  assert.equal(isJsonContentType('application/json'), true)
  assert.equal(isJsonContentType('application/json; charset=utf-8'), true)
  assert.equal(isJsonContentType('application/json;charset=utf-8'), true)
  assert.equal(isJsonContentType('  APPLICATION/JSON  '), true)
})

test('other media types are not accepted', () => {
  assert.equal(isJsonContentType('text/plain'), false)
  assert.equal(isJsonContentType('application/x-www-form-urlencoded'), false)
  assert.equal(isJsonContentType('multipart/form-data; boundary=x'), false)
  assert.equal(isJsonContentType('application/json-patch+json'), false)
  assert.equal(isJsonContentType(null), false)
})

test('requestHosts reads Host and a comma-separated forwarded host', () => {
  assert.deepEqual(requestHosts(request({ host: 'www.fluxionstudios.in' })), [
    'www.fluxionstudios.in',
  ])
  assert.deepEqual(requestHosts(request({ 'x-forwarded-host': 'A.example, B.example' })), [
    'a.example',
    'b.example',
  ])
})

test('a request without Origin passes, because it cannot be judged here', () => {
  assert.equal(isSameOriginRequest(request({ host: 'www.fluxionstudios.in' })), true)
})

test('an Origin matching the host it arrived on passes', () => {
  assert.equal(
    isSameOriginRequest(
      request({ host: 'www.fluxionstudios.in', origin: 'https://www.fluxionstudios.in' }),
    ),
    true,
  )
})

test('an Origin matching a forwarded host passes, including a local port', () => {
  assert.equal(
    isSameOriginRequest(
      request({
        'x-forwarded-host': 'fluxion-studios-git-branch.vercel.app',
        origin: 'https://fluxion-studios-git-branch.vercel.app',
      }),
    ),
    true,
  )
  assert.equal(
    isSameOriginRequest(request({ host: 'localhost:3000', origin: 'http://localhost:3000' })),
    true,
  )
})

test('an Origin with a different host is refused', () => {
  assert.equal(
    isSameOriginRequest(request({ host: 'www.fluxionstudios.in', origin: 'https://evil.example' })),
    false,
  )
  assert.equal(
    isSameOriginRequest(request({ host: 'www.fluxionstudios.in', origin: 'https://fluxionstudios.in' })),
    false,
  )
  assert.equal(
    isSameOriginRequest(request({ host: 'localhost:3000', origin: 'http://localhost:4000' })),
    false,
  )
})

test('a malformed Origin is refused rather than treated as missing', () => {
  assert.equal(
    isSameOriginRequest(request({ host: 'www.fluxionstudios.in', origin: 'not a url' })),
    false,
  )
  assert.equal(isSameOriginRequest(request({ host: 'www.fluxionstudios.in', origin: 'null' })), false)
})

test('an explicitly trusted origin passes even when it is not the request host', () => {
  assert.equal(
    isSameOriginRequest(
      request({ host: 'internal.example', origin: 'https://www.fluxionstudios.in' }),
      ['https://www.fluxionstudios.in'],
    ),
    true,
  )
  assert.equal(
    isSameOriginRequest(request({ host: 'internal.example', origin: 'https://www.fluxionstudios.in' }), [
      'not a url',
    ]),
    false,
  )
})
