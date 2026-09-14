/**
 * Two narrow checks made before the contact endpoint looks at a payload:
 * the media type the body claims to be, and whether a browser submitted it
 * from this site.
 *
 * Neither is bot defence. A non-browser client can omit or forge both headers;
 * they exist so that a browser page on another site cannot quietly drive this
 * endpoint from a visitor's machine, and so malformed requests fail early with
 * the right status.
 */

/** `application/json`, with any parameters (such as `; charset=utf-8`) ignored. */
export function isJsonContentType(value: string | null): boolean {
  if (!value) return false
  const type = value.split(';', 1)[0]
  return type !== undefined && type.trim().toLowerCase() === 'application/json'
}

/** Hosts this request arrived on, per the proxy headers Vercel sets. */
export function requestHosts(request: Request): string[] {
  return [request.headers.get('host'), request.headers.get('x-forwarded-host')]
    .flatMap((value) => (value ? value.split(',') : []))
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)
}

/**
 * True when the request carries no `Origin` (a non-browser client, which cannot
 * be judged by this check) or when the `Origin` matches the host the request
 * arrived on, or one of the explicitly trusted origins.
 */
export function isSameOriginRequest(
  request: Request,
  trustedOrigins: readonly string[] = [],
): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return true

  let host: string
  try {
    host = new URL(origin).host.toLowerCase()
  } catch {
    return false
  }

  if (requestHosts(request).includes(host)) return true

  for (const trusted of trustedOrigins) {
    try {
      if (new URL(trusted).host.toLowerCase() === host) return true
    } catch {
      // A malformed configured origin is ignored, not treated as a match.
    }
  }

  return false
}
