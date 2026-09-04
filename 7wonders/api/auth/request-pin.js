/* POST /api/auth/request-pin   { phone }
   → 200 { expiresAt }         a 3cket enviou o PIN por SMS
   → 400 { error }             número inválido / PIN ainda por expirar
   → 429 { error }             pedidos a mais do mesmo sítio
   → 503 { error }             a bilheteira não respondeu             */

import { ticketingFromEnv, TicketError, TICKET_ERRORS, normalisePhone } from '../_lib/3cket.js'
import { readJsonBody, send, onlyPost, rateLimit, clientIp } from '../_lib/http.js'

export default async function handler(req, res) {
  if (onlyPost(req, res)) return

  const { phone } = readJsonBody(req)
  if (!phone) return send(res, 400, { error: TICKET_ERRORS.PHONE_INVALID })

  // Trava dupla: por número (não chatear a mesma pessoa) e por origem
  // (não deixar uma máquina disparar SMS a meio país).
  const normalised = normalisePhone(phone)
  const byPhone = rateLimit(`pin:${normalised}`, { max: 3, windowMs: 15 * 60_000 })
  if (!byPhone.allowed) {
    return send(res, 429, { error: 'TOO_MANY_REQUESTS', retryAfterSeconds: byPhone.retryAfterSeconds })
  }
  const byIp = rateLimit(`ip:${clientIp(req)}`, { max: 12, windowMs: 15 * 60_000 })
  if (!byIp.allowed) {
    return send(res, 429, { error: 'TOO_MANY_REQUESTS', retryAfterSeconds: byIp.retryAfterSeconds })
  }

  const { client, isMock } = ticketingFromEnv()

  try {
    const result = await client.requestPin(phone)
    return send(res, 200, {
      expiresAt: result.expiresAt,
      // Só em modo de simulação, para dar para testar sem SMS a sério.
      ...(isMock ? { mock: true, mockPin: result.mockPin } : {}),
    })
  } catch (error) {
    if (error instanceof TicketError) {
      const status = error.code === TICKET_ERRORS.TICKETING_UNAVAILABLE ? 503 : 400
      return send(res, status, {
        error: error.code,
        expiresAt: error.details?.expiresAt ?? null,
        // O que a bilheteira respondeu, palavra por palavra. Sem isto,
        // «número inválido» não diz a ninguém o que corrigir.
        detalhe: error.details?.upstream ?? null,
        enviado: error.details?.enviado ?? null,
      })
    }
    return send(res, 503, { error: TICKET_ERRORS.TICKETING_UNAVAILABLE })
  }
}
