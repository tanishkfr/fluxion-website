/**
 * A bounded body read for the contact endpoint.
 *
 * `Content-Length` is a hint: a client can omit it or understate it, and
 * `request.json()` would then read whatever arrives. This reads the actual
 * bytes off the request stream, stops as soon as the ceiling is crossed, and
 * hands back text only for a body that stayed inside it. It measures UTF-8
 * bytes, so a multi-byte body cannot slip past on character count.
 */

export const MAX_BODY_BYTES = 16 * 1024

export type BoundedBody = { ok: true; text: string } | { ok: false; reason: 'too-large' }

export async function readBodyBounded(
  request: Request,
  limit: number = MAX_BODY_BYTES,
): Promise<BoundedBody> {
  const stream = request.body
  if (!stream) return { ok: true, text: '' }

  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  let size = 0

  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    if (!value) continue

    size += value.byteLength
    if (size > limit) {
      // Stop pulling the stream rather than buffering the rest of an oversized
      // body just to measure it.
      await reader.cancel().catch(() => undefined)
      return { ok: false, reason: 'too-large' }
    }

    chunks.push(value)
  }

  const merged = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    merged.set(chunk, offset)
    offset += chunk.byteLength
  }

  return { ok: true, text: new TextDecoder('utf-8').decode(merged) }
}
