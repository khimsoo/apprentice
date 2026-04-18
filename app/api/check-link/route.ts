export async function GET(request: Request) {
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
