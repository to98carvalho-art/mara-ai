/* POST /api/organizacao/entrar   { palavra }
   → 200 { token }   ficha da equipa, válida 12 horas
   → 401             palavra errada
   → 503             ainda não foi definida palavra nenhuma          */

import { timingSafeEqual, createHash } from 'node:crypto'
import { signSession } from '../_lib/session.js'
import { readJsonBody, send, onlyPost, rateLimit, clientIp } from '../_lib/http.js'

/* Comparar com === deixa medir o tempo e adivinhar a palavra letra a
   letra. Compara-se o resumo das duas, sempre do mesmo tamanho. */
function igual(a, b) {
  const ra = createHash('sha256').update(String(a)).digest()
  const rb = createHash('sha256').update(String(b)).digest()
  return timingSafeEqual(ra, rb)
}

export default async function handler(req, res) {
  if (onlyPost(req, res)) return

  const guarda = rateLimit(`equipa:${clientIp(req)}`, { max: 10, windowMs: 15 * 60_000 })
  if (!guarda.allowed) {
    return send(res, 429, { error: 'TOO_MANY_REQUESTS', retryAfterSeconds: guarda.retryAfterSeconds })
  }

  const esperada = process.env.ADMIN_PASSWORD
  if (!esperada) return send(res, 503, { error: 'SEM_PALAVRA_PASSE' })

  const { palavra } = readJsonBody(req)
  if (!palavra || !igual(palavra, esperada)) return send(res, 401, { error: 'PALAVRA_ERRADA' })

  return send(res, 200, { token: signSession({ papel: 'organizacao' }, process.env, 12) })
}
