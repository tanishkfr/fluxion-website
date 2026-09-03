import type { ContactValues } from '@/lib/validate'

/**
 * Enquiry delivery via the Resend HTTP API.
 *
 * Called with fetch rather than the SDK so the project carries no email
 * dependency. The API key is read from the environment at call time and never
 * leaves the server.
 */

const ENDPOINT = 'https://api.resend.com/emails'
const DEFAULT_FROM = 'Fluxion Studios <onboarding@resend.dev>'
const DEFAULT_TO = 'fluxion.workspace@gmail.com'

export type SendResult =
  | { ok: true }
  | { ok: false; reason: 'unconfigured' }
  | { ok: false; reason: 'provider'; status: number }

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/** Subjects must stay on one line. */
function oneLine(value: string): string {
  return value.replace(/[\r\n]+/g, ' ').slice(0, 120)
}

function textBody(values: ContactValues): string {
  return [
    `Name       ${values.name}`,
    `Email      ${values.email}`,
    `Business   ${values.company}`,
    `Needs      ${values.need}`,
    `Budget     ${values.budget || '—'}`,
    `Timeline   ${values.timeline || '—'}`,
    '',
    values.message,
  ].join('\n')
}

function htmlBody(values: ContactValues): string {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:4px 24px 4px 0;color:#666;font:400 13px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;vertical-align:top">${label}</td><td style="padding:4px 0;color:#111;font:400 14px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">${escapeHtml(value)}</td></tr>`

  return [
    '<div style="background:#FFF6E2;padding:32px">',
    '<div style="max-width:600px;margin:0 auto;background:#fff;padding:32px;border-top:3px solid #F5141F">',
    '<p style="margin:0 0 24px;font:600 12px/1 -apple-system,BlinkMacSystemFont,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:#F5141F">New enquiry</p>',
    '<table style="border-collapse:collapse;width:100%">',
    row('Name', values.name),
    row('Email', values.email),
    row('Business', values.company),
    row('Needs', values.need),
    row('Budget', values.budget || '—'),
    row('Timeline', values.timeline || '—'),
    '</table>',
    '<hr style="border:none;border-top:1px solid #eee;margin:24px 0">',
    `<p style="margin:0;white-space:pre-wrap;color:#111;font:400 15px/1.7 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">${escapeHtml(values.message)}</p>`,
    '</div></div>',
  ].join('')
}

export function isConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY)
}

export async function sendEnquiry(values: ContactValues): Promise<SendResult> {
  const key = process.env.RESEND_API_KEY
  if (!key) return { ok: false, reason: 'unconfigured' }

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM || DEFAULT_FROM,
      to: [process.env.CONTACT_TO || DEFAULT_TO],
      reply_to: values.email,
      subject: oneLine(`New enquiry — ${values.company} (${values.need})`),
      text: textBody(values),
      html: htmlBody(values),
    }),
  })

  if (!response.ok) {
    // The body can echo request details, so keep it out of the logs.
    console.error(`[contact] Resend responded ${response.status}`)
    return { ok: false, reason: 'provider', status: response.status }
  }

  return { ok: true }
}
