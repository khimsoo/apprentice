import { rateLimit } from '@/lib/rate-limit'

// Block requests to private/internal IP ranges to prevent SSRF
function isPrivateHostname(hostname: string): boolean {
  const lower = hostname.toLowerCase()
  const privatePatterns = [
    /^localhost$/i,
    /^127\./,
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[01])\./,
    /^192\.168\./,
    /^169\.254\./,
    /^\[::1\]$/,
    /^\[fc[0-9a-f]{2}:/i,
    /^\[fe[89ab][0-9a-f]:/i,
    /^0\./,
    /^::1$/,
  ]
  return privatePatterns.some((re) => re.test(lower))
}

export async function GET(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown'
  if (!rateLimit(ip, 10, 60_000)) {
    return Response.json({ ok: false, error: 'rate_limited' }, { status: 429 })
  }

  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return Response.json({ ok: false, error: 'missing_url' }, { status: 400 })
  }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return Response.json({ ok: false, error: 'invalid_url' })
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return Response.json({ ok: false, error: 'invalid_protocol' })
  }

  if (isPrivateHostname(parsed.hostname)) {
    return Response.json({ ok: false, error: 'invalid_url' })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  try {
    const res = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; link-checker/1.0)' },
    })
    clearTimeout(timeout)

    // Some servers reject HEAD — retry with GET if 405
    if (res.status === 405) {
      const getController = new AbortController()
      const getTimeout = setTimeout(() => getController.abort(), 8000)
      try {
        const getRes = await fetch(url, {
          method: 'GET',
          signal: getController.signal,
          redirect: 'follow',
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; link-checker/1.0)' },
        })
        clearTimeout(getTimeout)
        return Response.json({ ok: getRes.ok, status: getRes.status })
      } catch {
        clearTimeout(getTimeout)
        return Response.json({ ok: false, error: 'unreachable' })
      }
    }

    return Response.json({ ok: res.ok, status: res.status })
  } catch (err) {
    clearTimeout(timeout)
    const isTimeout = err instanceof Error && err.name === 'AbortError'
    return Response.json({ ok: false, error: isTimeout ? 'timeout' : 'unreachable' })
  }
}
