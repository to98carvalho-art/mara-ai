/**
 * /api/session — cross-device session storage via Upstash Redis
 *
 * GET  /api/session?c=XXXX   → fetch session data for code
 * POST /api/session           → create new session (body: { code, ...data })
 * PATCH /api/session?c=XXXX  → merge updates into existing session (body: { chat2, ... })
 */

const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN
const TTL         = 172800 // 48 hours in seconds

async function redis(args) {
  const res = await fetch(REDIS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${REDIS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
  })
  if (!res.ok) throw new Error(`Redis HTTP ${res.status}`)
  return res.json()
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  if (!REDIS_URL || !REDIS_TOKEN) {
    return res.status(503).json({ error: 'Redis not configured', hint: 'Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to Vercel environment variables.' })
  }

  const code = (req.query.c || '').toUpperCase().trim()
  const key  = `ct_${code}`

  try {
    /* ── GET: retrieve session ──────────────────────── */
    if (req.method === 'GET') {
      if (!code) return res.status(400).json({ error: 'Missing code parameter.' })
      const { result } = await redis(['GET', key])
      if (!result) return res.status(404).json({ error: 'Código inválido ou expirado.' })
      return res.status(200).json(JSON.parse(result))
    }

    /* ── POST: create session ───────────────────────── */
    if (req.method === 'POST') {
      const body = req.body
      if (!body?.code) return res.status(400).json({ error: 'Missing code in body.' })
      const k = `ct_${body.code.toUpperCase()}`
      await redis(['SET', k, JSON.stringify(body), 'EX', TTL])
      return res.status(200).json({ ok: true })
    }

    /* ── PATCH: update existing session ─────────────── */
    if (req.method === 'PATCH') {
      if (!code) return res.status(400).json({ error: 'Missing code parameter.' })
      const { result } = await redis(['GET', key])
      if (!result) return res.status(404).json({ error: 'Session not found.' })
      const existing = JSON.parse(result)
      const merged   = { ...existing, ...req.body }
      await redis(['SET', key, JSON.stringify(merged), 'EX', TTL])
      return res.status(200).json({ ok: true })
    }

    return res.status(405).json({ error: 'Method not allowed.' })
  } catch (err) {
    console.error('session handler error:', err.message)
    return res.status(500).json({ error: err.message })
  }
}
