/* POST /api/auth/verify-pin   { phone, pin }
   Encadeia PIN → conta → carteira → bilhetes. Só devolve sessão a
   quem tem mesmo bilhete para o evento.

   → 200 { token, user }
   → 400 { error }   PIN errado, PIN não pedido, conta não registada
   → 403 { error }   NO_TICKET — validou, mas não tem bilhete
   → 503 { error }   a bilheteira não respondeu                       */

import { ticketingFromEnv, TicketError, TICKET_ERRORS, normalisePhone } from '../_lib/3cket.js'
import { signSession } from '../_lib/session.js'
import { readJsonBody, send, onlyPost, rateLimit, clientIp } from '../_lib/http.js'

export default async function handler(req, res) {
  if (onlyPost(req, res)) return

  const { phone, pin } = readJsonBody(req)
  if (!phone || !pin) return send(res, 400, { error: TICKET_ERRORS.PIN_WRONG })

  // Sem isto, um PIN de 4 dígitos adivinha-se em 10 000 tentativas.
  const guard = rateLimit(`verify:${normalisePhone(phone)}`, { max: 8, windowMs: 15 * 60_000 })
  if (!guard.allowed) {
    return send(res, 429, { error: 'TOO_MANY_REQUESTS', retryAfterSeconds: guard.retryAfterSeconds })
  }
  const byIp = rateLimit(`verify-ip:${clientIp(req)}`, { max: 30, windowMs: 15 * 60_000 })
  if (!byIp.allowed) {
    return send(res, 429, { error: 'TOO_MANY_REQUESTS', retryAfterSeconds: byIp.retryAfterSeconds })
  }

  const { client } = ticketingFromEnv()

  try {
    const account = await client.verifyPin(phone, pin)

    const token = signSession({
      accountId: account.accountId,
      phone: account.phone,
      tickets: account.tickets.length,
    })

    return send(res, 200, {
      token,
      user: {
        accountId: account.accountId,
        phone: account.phone,
        ticketName: account.tickets[0]?.ticket_name || null,
        ticketCount: account.tickets.length,
      },
    })
  } catch (error) {
    if (error instanceof TicketError) {
      if (error.code === TICKET_ERRORS.NO_TICKET) return send(res, 403, { error: error.code })
      const status = error.code === TICKET_ERRORS.TICKETING_UNAVAILABLE ? 503 : 400
      return send(res, status, { error: error.code })
    }
    return send(res, 503, { error: TICKET_ERRORS.TICKETING_UNAVAILABLE })
  }
}
