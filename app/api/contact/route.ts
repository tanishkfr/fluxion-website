import { NextResponse } from 'next/server'

import { isConfigured, sendEnquiry } from '@/lib/mailer'
import { clientKey, rateLimit } from '@/lib/rateLimit'
import { coerce, hasErrors, validate } from '@/lib/validate'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Anything faster than this was not typed by a person. */
const MIN_FILL_MS = 2500
const MAX_BODY_BYTES = 16 * 1024

export async function POST(request: Request) {
  const length = Number(request.headers.get('content-length') ?? 0)
  if (length > MAX_BODY_BYTES) {
    return NextResponse.json({ ok: false, message: 'That message is too long to send.' }, { status: 413 })
  }

  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ ok: false, message: 'We could not read that request.' }, { status: 400 })
  }

  const body = (payload ?? {}) as Record<string, unknown>

  // Honeypot: a real person never fills a field they cannot see. Answer as if
  // it worked so the bot has nothing to learn from.
  if (typeof body.website === 'string' && body.website.trim() !== '') {
    return NextResponse.json({ ok: true })
  }

  // Time trap: the client stamps when the form was first rendered.
  const startedAt = Number(body.startedAt)
  if (Number.isFinite(startedAt) && startedAt > 0 && Date.now() - startedAt < MIN_FILL_MS) {
    return NextResponse.json({ ok: true })
  }

  const values = coerce(body)
  const errors = validate(values)
  if (hasErrors(errors)) {
    return NextResponse.json({ ok: false, errors }, { status: 422 })
  }

  // Counted only once a submission is actually deliverable, so someone
  // correcting form errors can never lock themselves out. Validation is pure
  // CPU with no outbound calls, so it needs no budget of its own.
  const limit = rateLimit(clientKey(request.headers))
  if (!limit.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: 'That is a few messages in a short window. Try again shortly, or email us directly.',
      },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    )
  }

  if (!isConfigured()) {
    console.error('[contact] RESEND_API_KEY is not set — enquiry was not delivered.')
    return NextResponse.json(
      {
        ok: false,
        message: 'Our mail service is not connected yet. Please email us directly for now.',
      },
      { status: 503 },
    )
  }

  try {
    const result = await sendEnquiry(values)
    if (!result.ok) {
      return NextResponse.json(
        { ok: false, message: 'We could not send that just now. Please email us directly.' },
        { status: 502 },
      )
    }
  } catch {
    console.error('[contact] Delivery threw before a response was received.')
    return NextResponse.json(
      { ok: false, message: 'We could not send that just now. Please email us directly.' },
      { status: 502 },
    )
  }

  return NextResponse.json({ ok: true })
}

export function GET() {
  return NextResponse.json({ ok: false, message: 'Method not allowed.' }, { status: 405 })
}
