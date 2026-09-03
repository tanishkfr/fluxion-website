'use client'

import { useEffect, useId, useRef, useState, type FormEvent } from 'react'

import { site } from '@/content/site'
import {
  EMPTY_VALUES,
  FIELDS,
  hasErrors,
  validate,
  type ContactValues,
  type FieldErrors,
  type FieldName,
} from '@/lib/validate'

type Status = 'idle' | 'sending' | 'sent'

const copy = site.contact.form
const f = copy.fields

export default function ContactForm() {
  const uid = useId()
  const [values, setValues] = useState<ContactValues>(EMPTY_VALUES)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [status, setStatus] = useState<Status>('idle')
  const [formError, setFormError] = useState<string | null>(null)
  const [honeypot, setHoneypot] = useState('')

  const startedAt = useRef(0)
  const summaryRef = useRef<HTMLDivElement>(null)
  const successRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    startedAt.current = Date.now()
  }, [])

  const id = (field: string) => `${uid}-${field}`
  const errorId = (field: string) => `${uid}-${field}-error`

  const set = (field: FieldName, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    // Clear a field's error the moment the person starts fixing it.
    setErrors((prev) => {
      if (!prev[field]) return prev
      const next = { ...prev }
      delete next[field]
      return next
    })
  }

  const invalid = FIELDS.filter((field) => errors[field])
  const showSummary = invalid.length > 0 || formError !== null

  // Focus moves after React commits, not on an animation frame — a frame never
  // arrives in a background tab, and the message would go unannounced.
  useEffect(() => {
    if (showSummary) summaryRef.current?.focus()
  }, [showSummary])

  useEffect(() => {
    if (status === 'sent') successRef.current?.focus()
  }, [status])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const found = validate(values)
    if (hasErrors(found)) {
      setErrors(found)
      return
    }

    setErrors({})
    setStatus('sending')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, website: honeypot, startedAt: startedAt.current }),
      })

      const payload = (await response.json().catch(() => ({}))) as {
        ok?: boolean
        errors?: FieldErrors
        message?: string
      }

      if (response.ok && payload.ok) {
        setStatus('sent')
        setValues(EMPTY_VALUES)
        return
      }

      setStatus('idle')

      if (response.status === 422 && payload.errors) {
        setErrors(payload.errors)
        return
      }

      setFormError(payload.message ?? 'We could not send that just now.')
    } catch {
      setStatus('idle')
      setFormError('That did not reach us — check your connection and try again.')
    }
  }

  if (status === 'sent') {
    return (
      <div className="form-done" role="status" tabIndex={-1} ref={successRef}>
        <span className="form-done__dot" aria-hidden="true" />
        <h3 className="form-done__title">{copy.success.title}</h3>
        <p className="form-done__body">{copy.success.body}</p>
        <p className="form-done__body">
          <a className="link" href={`mailto:${site.email}`}>
            {site.email}
          </a>
        </p>
        <button
          type="button"
          className="btn btn--ghost"
          onClick={() => {
            setStatus('idle')
            startedAt.current = Date.now()
          }}
        >
          {copy.success.again}
        </button>
      </div>
    )
  }

  return (
    <form className="form" onSubmit={onSubmit} noValidate>
      {showSummary && (
        <div className="form__summary" role="alert" tabIndex={-1} ref={summaryRef}>
          {formError ? (
            <>
              <p className="form__summary-title">{copy.errorFallback}</p>
              <p>
                <a className="link" href={`mailto:${site.email}`}>
                  {site.email}
                </a>
              </p>
              <p className="form__summary-detail">{formError}</p>
            </>
          ) : (
            <>
              <p className="form__summary-title">
                {invalid.length === 1
                  ? 'One field needs another look.'
                  : `${invalid.length} fields need another look.`}
              </p>
              <ul>
                {invalid.map((field) => (
                  <li key={field}>
                    <a href={`#${id(field)}`}>{errors[field]}</a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      <div className="form__grid">
        <p className="field">
          <label htmlFor={id('name')}>{f.name.label}</label>
          <input
            id={id('name')}
            name="name"
            type="text"
            autoComplete="name"
            placeholder={f.name.placeholder}
            value={values.name}
            onChange={(e) => set('name', e.target.value)}
            aria-invalid={errors.name ? 'true' : undefined}
            aria-describedby={errors.name ? errorId('name') : undefined}
            required
          />
          {errors.name && (
            <span className="field__error" id={errorId('name')}>
              {errors.name}
            </span>
          )}
        </p>

        <p className="field">
          <label htmlFor={id('email')}>{f.email.label}</label>
          <input
            id={id('email')}
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder={f.email.placeholder}
            value={values.email}
            onChange={(e) => set('email', e.target.value)}
            aria-invalid={errors.email ? 'true' : undefined}
            aria-describedby={errors.email ? errorId('email') : undefined}
            required
          />
          {errors.email && (
            <span className="field__error" id={errorId('email')}>
              {errors.email}
            </span>
          )}
        </p>

        <p className="field field--wide">
          <label htmlFor={id('company')}>{f.company.label}</label>
          <input
            id={id('company')}
            name="company"
            type="text"
            autoComplete="organization"
            placeholder={f.company.placeholder}
            value={values.company}
            onChange={(e) => set('company', e.target.value)}
            aria-invalid={errors.company ? 'true' : undefined}
            aria-describedby={errors.company ? errorId('company') : undefined}
            required
          />
          {errors.company && (
            <span className="field__error" id={errorId('company')}>
              {errors.company}
            </span>
          )}
        </p>

        <p className="field field--wide">
          <label htmlFor={id('need')}>{f.need.label}</label>
          <span className="select">
            <select
              id={id('need')}
              name="need"
              value={values.need}
              onChange={(e) => set('need', e.target.value)}
              aria-invalid={errors.need ? 'true' : undefined}
              aria-describedby={errors.need ? errorId('need') : undefined}
              required
            >
              <option value="">{f.need.placeholder}</option>
              {f.need.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </span>
          {errors.need && (
            <span className="field__error" id={errorId('need')}>
              {errors.need}
            </span>
          )}
        </p>

        <p className="field">
          <label htmlFor={id('budget')}>
            {f.budget.label} <span className="field__optional">{f.budget.optional}</span>
          </label>
          <input
            id={id('budget')}
            name="budget"
            type="text"
            placeholder={f.budget.placeholder}
            value={values.budget}
            onChange={(e) => set('budget', e.target.value)}
            aria-invalid={errors.budget ? 'true' : undefined}
            aria-describedby={errors.budget ? errorId('budget') : undefined}
          />
          {errors.budget && (
            <span className="field__error" id={errorId('budget')}>
              {errors.budget}
            </span>
          )}
        </p>

        <p className="field">
          <label htmlFor={id('timeline')}>
            {f.timeline.label} <span className="field__optional">{f.timeline.optional}</span>
          </label>
          <span className="select">
            <select
              id={id('timeline')}
              name="timeline"
              value={values.timeline}
              onChange={(e) => set('timeline', e.target.value)}
              aria-invalid={errors.timeline ? 'true' : undefined}
              aria-describedby={errors.timeline ? errorId('timeline') : undefined}
            >
              <option value="">{f.timeline.placeholder}</option>
              {f.timeline.options.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </span>
          {errors.timeline && (
            <span className="field__error" id={errorId('timeline')}>
              {errors.timeline}
            </span>
          )}
        </p>

        <p className="field field--wide">
          <label htmlFor={id('message')}>{f.message.label}</label>
          <textarea
            id={id('message')}
            name="message"
            rows={5}
            placeholder={f.message.placeholder}
            value={values.message}
            onChange={(e) => set('message', e.target.value)}
            aria-invalid={errors.message ? 'true' : undefined}
            aria-describedby={errors.message ? errorId('message') : undefined}
            required
          />
          {errors.message && (
            <span className="field__error" id={errorId('message')}>
              {errors.message}
            </span>
          )}
        </p>
      </div>

      {/* Visually hidden and out of the tab order, but left in the accessibility
          tree with an honest label — hiding a focusable field with aria-hidden
          would be worse than telling anyone who reaches it to skip it. */}
      <div className="hp">
        <label htmlFor={id('website')}>Leave this field empty</label>
        <input
          id={id('website')}
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      <div className="form__foot">
        <button type="submit" className="btn btn--solid" disabled={status === 'sending'}>
          {status === 'sending' ? copy.submitting : copy.submit}
        </button>
        <p className="form__aside">
          Or just email{' '}
          <a className="link" href={`mailto:${site.email}`}>
            {site.email}
          </a>
        </p>
      </div>
    </form>
  )
}
