import { NextResponse } from 'next/server'

import { isConfigured, sendEnquiry } from '@/lib/mailer'
import { clientKey, rateLimit } from '@/lib/rateLimit'
import { MAX_BODY_BYTES, readBodyBounded } from '@/lib/readBody'
import { isJsonContentType, isSameOriginRequest } from '@/lib/requestChecks'
import { coerce, hasErrors, validate } from '@/lib/validate'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Anything faster than this was not typed by a person. */
const MIN_FILL_MS = 2500

/**
 * Every response describes one submission, so nothing here may be cached — not
 * a success, not an error, not a rate-limit refusal. Applied in one place so
 * no reply can be added without it.
 */
const NO_STORE = { 'Cache-Control': 'no-store' } as const

function json(body: unknown, status: number, headers: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { ...NO_STORE, ...headers } })
}

/** The configured canonical origin, when one is set for this deployment. */
function trustedOrigins(): string[] {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim()
  return configured ? [configured] : []
}

export async function POST(request: Request) {
  // A browser sends `Origin` on a POST; requiring it to match the host the
  // request arrived on keeps another site from driving this endpoint through a
  // visitor's browser. It is deliberately not treated as spam control.
  if (!isSameOriginRequest(request, trustedOrigins())) {
    return json({ ok: false, message: 'That request did not come from this site.' }, 403)
  }

  if (!isJsonContentType(request.headers.get('content-type'))) {
    return json({ ok: false, message: 'That request is not in a format we can read.' }, 415)
  }

  // `Content-Length` is never trusted. The body is read against a hard byte
  // ceiling and only parsed once it is inside it.
  const read = await readBodyBounded(request, MAX_BODY_BYTES)
  if (!read.ok) {
    return json({ ok: false, message: 'That message is too long to send.' }, 413)
  }

  let payload: unknown
  try {
    payload = JSON.parse(read.text)
  } catch {
    return json({ ok: false, message: 'We could not read that request.' }, 400)
  }

  const body = (payload ?? {}) as Record<string, unknown>

  // Honeypot: a real person never fills a field they cannot see. Answer as if
  // it worked so the bot has nothing to learn from.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return json({ ok: true }, 200)
  }

  // Time trap: the client stamps when the form was first rendered.
  const startedAt = Number(body.startedAt)
  if (Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < MIN_FILL_MS) {
    return json({ ok: true }, 200)
  }

  const values = coerce(body)
  const errors = validate(values)
  if (hasErrors(errors)) {
    return json({ ok: false, errors }, 422)
  }

  // Counted only once a submission is actually deliverable, so someone
  // correcting form errors can never lock themselves out. Validation is pure
  // CPU with no outbound calls, so it needs no budget of its own.
  const limit = rateLimit(clientKey(request.headers))
  if (!limit.ok) {
    return json(
      {
        ok: false,
        message: 'That is a few messages in a short window. Try again shortly, or email us directly.',
      },
      429,
      { 'Retry-After': String(limit.retryAfter) },
    )
  }

  if (!isConfigured()) {
    console.error('[contact] RESEND_API_KEY is not set — enquiry was not delivered.')
    return json(
      {
        ok: false,
        message: 'Our mail service is not connected yet. Please email us directly for now.',
      },
      503,
    )
  }

  try {
    const result = await sendEnquiry(values)
    if (!result.ok) {
      return json(
        { ok: false, message: 'We could not send that just now. Please email us directly.' },
        502,
      )
    }
  } catch {
    console.error('[contact] Delivery threw before a response was received.')
    return json(
      { ok: false, message: 'We could not send that just now. Please email us directly.' },
      502,
    )
  }

  return json({ ok: true }, 200)
}

export function GET() {
  return json({ ok: false, message: 'Method not allowed.' }, 405, { Allow: 'POST' })
}
