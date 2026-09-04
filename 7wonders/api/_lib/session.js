/* ════════════════════════════════════════════════════════════════
   SESSÃO — quem é o utilizador, depois de a 3cket confirmar bilhete.

   Não há palavras-passe. A prova de identidade é: recebeu o SMS no
   número dele, e esse número tem bilhete. A partir daí guardamos
   uma senha assinada pelo servidor.

   A senha é assinada (HMAC-SHA256), não encriptada: o browser
   consegue lê-la, mas não a consegue forjar nem alterar.
   ════════════════════════════════════════════════════════════════ */

import { createHmac, timingSafeEqual, randomBytes } from 'node:crypto'

const DEFAULT_TTL_HOURS = 72   // dura o fim de semana do evento

function secretFrom(env) {
  const secret = env.SESSION_SECRET
  if (secret) return secret
  if (env.NODE_ENV === 'production') {
    throw new Error('SESSION_SECRET em falta — obrigatória em produção')
  }
  // Em desenvolvimento gera-se uma por arranque: as sessões não
  // sobrevivem a um reinício, o que é exactamente o que queremos.
  globalThis.__devSessionSecret ||= randomBytes(32).toString('hex')
  return globalThis.__devSessionSecret
}

const b64url = buf => Buffer.from(buf).toString('base64url')

export function signSession(payload, env = process.env, ttlHours = DEFAULT_TTL_HOURS) {
  const body = {
    ...payload,
    iat: Date.now(),
    exp: Date.now() + ttlHours * 3600_000,
  }
  const data = b64url(JSON.stringify(body))
  const signature = createHmac('sha256', secretFrom(env)).update(data).digest('base64url')
  return `${data}.${signature}`
}

export function readSession(token, env = process.env) {
  if (typeof token !== 'string' || !token.includes('.')) return null
  const [data, signature] = token.split('.')
  if (!data || !signature) return null

  const expected = createHmac('sha256', secretFrom(env)).update(data).digest('base64url')
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  let payload
  try { payload = JSON.parse(Buffer.from(data, 'base64url').toString()) } catch { return null }
  if (!payload?.exp || payload.exp < Date.now()) return null
  return payload
}
