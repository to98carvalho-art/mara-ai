/* Utilitários partilhados pelas funções de servidor. */

export function readJsonBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string') {
    try { return JSON.parse(req.body) } catch { return {} }
  }
  return {}
}

export function send(res, status, payload) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(payload))
}

export function onlyPost(req, res) {
  if (req.method === 'POST') return false
  res.setHeader('Allow', 'POST')
  send(res, 405, { error: 'METHOD_NOT_ALLOWED' })
  return true
}

/* Trava simples de abuso.
   O passo 1 envia SMS a sério — cada pedido custa dinheiro e chateia
   quem recebe. Isto corta os disparos em série de uma mesma origem.
   Vive na memória da instância: ajuda, mas não substitui uma trava
   partilhada se o evento crescer. */
const hits = new Map()

export function rateLimit(key, { max = 5, windowMs = 10 * 60_000 } = {}) {
  const now = Date.now()
  const entry = hits.get(key)

  if (!entry || entry.resetAt <= now) {
    hits.set(key, { count: 1, resetAt: now + windowMs })
    if (hits.size > 5000) {                       // limpeza preguiçosa
      for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k)
    }
    return { allowed: true, remaining: max - 1 }
  }

  entry.count += 1
  if (entry.count > max) {
    return { allowed: false, retryAfterSeconds: Math.ceil((entry.resetAt - now) / 1000) }
  }
  return { allowed: true, remaining: max - entry.count }
}

export function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim()
  return req.socket?.remoteAddress || 'desconhecido'
}
