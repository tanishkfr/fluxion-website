/**
 * Content Security Policy.
 *
 * Derived from this project's built output rather than from a checklist. Every
 * script, stylesheet, font, image and fetch the browser makes is same-origin:
 * Next's own chunks and fonts, `/_next/image`, `/fonts`, and the contact form's
 * POST to `/api/contact`. No third-party origin is needed in production, so
 * none is allowed.
 *
 * Two allowances are real, and the policy is not described as strict because of
 * them:
 *
 * - `script-src 'unsafe-inline'` — Next emits inline bootstrap and flight-data
 *   scripts into the HTML. Covering those with a nonce would make every page
 *   render dynamically; this site is otherwise fully static, so the inline
 *   allowance is the deliberate trade.
 * - `style-src 'unsafe-inline'` — the pages emit inline style attributes (the
 *   hero's per-line stagger delays, the scroll engine's custom properties) and
 *   one inline <style> inside the no-JavaScript fallback.
 *
 * Preview deployments also keep the Vercel Toolbar working, which needs its own
 * origins; that allowance is added only when the deployment is not production.
 */
const isProduction = process.env.VERCEL_ENV === 'production'
const isDev = process.env.NODE_ENV !== 'production'

function contentSecurityPolicy() {
  const scriptSrc = ["'self'", "'unsafe-inline'"]
  const connectSrc = ["'self'"]
  const fontSrc = ["'self'"]
  const imgSrc = ["'self'", 'data:', 'blob:']
  const frameSrc = ["'none'"]

  if (!isProduction) {
    scriptSrc.push('https://vercel.live')
    connectSrc.push('https://vercel.live', 'wss://ws.vercel.live')
    fontSrc.push('https://vercel.live', 'https://assets.vercel.com')
    imgSrc.push('https://vercel.live', 'https://vercel.com')
    frameSrc[0] = 'https://vercel.live'
  }

  // Development only: the dev runtime evaluates modules for hot reloading.
  if (isDev) scriptSrc.push("'unsafe-eval'")

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc.join(' ')}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src ${imgSrc.join(' ')}`,
    `font-src ${fontSrc.join(' ')}`,
    `connect-src ${connectSrc.join(' ')}`,
    "media-src 'self'",
    `frame-src ${frameSrc.join(' ')}`,
    "worker-src 'self' blob:",
    "manifest-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
  ]

  // Nothing here navigates over plain HTTP in production; development on
  // http://localhost does not need the directive.
  if (!isDev) directives.push('upgrade-insecure-requests')

  return directives.join('; ')
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: contentSecurityPolicy() },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Tightened from SAMEORIGIN: nothing on this site is meant to be
          // framed, by this origin or any other. Vercel's own HSTS header is
          // left alone rather than duplicated here.
          { key: 'X-Frame-Options', value: 'DENY' },
          {
            key: 'Permissions-Policy',
            value:
              'camera=(), microphone=(), geolocation=(), payment=(), usb=(), serial=(), magnetometer=(), gyroscope=(), accelerometer=(), interest-cohort=()',
          },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ]
  },
}

export default nextConfig
