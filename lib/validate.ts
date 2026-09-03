import { site } from '@/content/site'

/**
 * One set of rules, used by the form in the browser and again on the server.
 * The server never trusts the client copy — it just happens to run the same
 * function, so the messages people see match the ones that actually decide.
 */

export const FIELDS = [
  'name',
  'email',
  'company',
  'need',
  'budget',
  'timeline',
  'message',
] as const

export type FieldName = (typeof FIELDS)[number]

export type ContactValues = Record<FieldName, string>

export type FieldErrors = Partial<Record<FieldName, string>>

export const EMPTY_VALUES: ContactValues = {
  name: '',
  email: '',
  company: '',
  need: '',
  budget: '',
  timeline: '',
  message: '',
}

const NEED_OPTIONS: readonly string[] = site.contact.form.fields.need.options
const TIMELINE_OPTIONS: readonly string[] = site.contact.form.fields.timeline.options

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

const LIMITS = {
  name: 80,
  email: 160,
  company: 120,
  budget: 80,
  message: 4000,
} as const

function trim(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

/** Normalise anything that arrived over the wire into the seven known fields. */
export function coerce(raw: unknown): ContactValues {
  const source = (raw ?? {}) as Record<string, unknown>
  const out = { ...EMPTY_VALUES }
  for (const field of FIELDS) out[field] = trim(source[field])
  return out
}

export function validate(values: ContactValues): FieldErrors {
  const errors: FieldErrors = {}

  if (!values.name) errors.name = 'Tell us your name.'
  else if (values.name.length > LIMITS.name) errors.name = 'That is longer than we can store.'

  if (!values.email) errors.email = 'We need an email address to reply to.'
  else if (values.email.length > LIMITS.email) errors.email = 'That is longer than we can store.'
  else if (!EMAIL.test(values.email)) errors.email = 'That email address does not look right.'

  if (!values.company) errors.company = 'Which business is this for?'
  else if (values.company.length > LIMITS.company) errors.company = 'That is longer than we can store.'

  if (!values.need) errors.need = 'Pick the closest option.'
  else if (!NEED_OPTIONS.includes(values.need)) errors.need = 'Pick one of the listed options.'

  if (values.budget && values.budget.length > LIMITS.budget) {
    errors.budget = 'Keep this short — a rough range is plenty.'
  }

  if (values.timeline && !TIMELINE_OPTIONS.includes(values.timeline)) {
    errors.timeline = 'Pick one of the listed options.'
  }

  if (!values.message) errors.message = 'Tell us a little about the project.'
  else if (values.message.length < 10) errors.message = 'A couple of sentences is plenty.'
  else if (values.message.length > LIMITS.message) {
    errors.message = 'That is longer than we can accept. Send us the short version.'
  }

  return errors
}

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0
}
