/* ════════════════════════════════════════════════════════════════
   3CKET — encadeamento das quatro chamadas

     1. phone_validation   → a 3cket envia o PIN por SMS
     2. pin_validation     → devolve o ACCOUNT ID
     3. cashless/wallet    → devolve o WALLET ID
     4. tickets            → lista de bilhetes → tem bilhete?

   ⚠️ Este ficheiro corre SEMPRE no servidor. A SECRET_KEY nunca
   pode chegar ao browser: com ela é possível consultar e cancelar
   bilhetes de terceiros.

   O passo 1 envia SMS a QUALQUER número válido, tenha bilhete ou
   não. Quem decide o acesso é o passo 4 — por isso o encadeamento
   vai sempre até ao fim antes de devolver uma sessão.
   ════════════════════════════════════════════════════════════════ */

export const TICKET_ERRORS = {
  PHONE_INVALID:          'PHONE_INVALID',
  PIN_ALREADY_SENT:       'PIN_ALREADY_SENT',
  PIN_WRONG:              'PIN_WRONG',
  PIN_NOT_REQUESTED:      'PIN_NOT_REQUESTED',
  ACCOUNT_NOT_REGISTERED: 'ACCOUNT_NOT_REGISTERED',
  NO_TICKET:              'NO_TICKET',
  TICKETING_UNAVAILABLE:  'TICKETING_UNAVAILABLE',
}

export class TicketError extends Error {
  constructor(code, details = {}) {
    super(code)
    this.code = code
    this.details = details
  }
}

/* Normaliza para o formato que a 3cket exige: + e indicativo.
   Aceita o que as pessoas escrevem a sério: 912345678, 912 345 678,
   00351912345678, +351 912 345 678. */
export function normalisePhone(input, defaultCountry = '351') {
  const raw = String(input || '').trim()
  let digits = raw.replace(/[^\d+]/g, '')

  if (digits.startsWith('+')) return '+' + digits.slice(1).replace(/\D/g, '')
  digits = digits.replace(/\D/g, '')
  if (digits.startsWith('00')) return '+' + digits.slice(2)
  if (digits.length === 9) return `+${defaultCountry}${digits}`   // número nacional
  if (digits.startsWith(defaultCountry)) return `+${digits}`
  return `+${digits}`
}

export function isPlausiblePhone(e164) {
  return /^\+\d{8,15}$/.test(e164)
}

/* ── cliente real ─────────────────────────────────────────────── */

export function createTicketing({ apiUrl, secretKey, fetchImpl = fetch, timeoutMs = 12000 }) {
  async function call(path, body) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    let response
    try {
      response = await fetchImpl(`${apiUrl}${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${secretKey}`,
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })
    } catch (cause) {
      throw new TicketError(TICKET_ERRORS.TICKETING_UNAVAILABLE, { path, cause: String(cause) })
    } finally {
      clearTimeout(timer)
    }

    const text = await response.text()
    let payload = null
    try { payload = text ? JSON.parse(text) : null } catch { /* resposta não-JSON */ }

    return { status: response.status, payload }
  }

  /* Passo 1 — pedir o PIN */
  async function requestPin(phone) {
    const mobile_phone = normalisePhone(phone)
    if (!isPlausiblePhone(mobile_phone)) throw new TicketError(TICKET_ERRORS.PHONE_INVALID)

    const { status, payload } = await call('/external/account/phone_validation', { mobile_phone })

    if (status === 201) return { phone: mobile_phone, expiresAt: payload?.expires_at || null }

    const code = payload?.error?.code
    if (code === 'operation_started') {
      throw new TicketError(TICKET_ERRORS.PIN_ALREADY_SENT, { expiresAt: payload?.expires_at || null })
    }
    if (code === 'invalid_input') throw new TicketError(TICKET_ERRORS.PHONE_INVALID)
    // 401 = chave errada ou evento expirado. Nunca expor isto ao utilizador.
    throw new TicketError(TICKET_ERRORS.TICKETING_UNAVAILABLE, { status, payload })
  }

  /* Passos 2, 3 e 4 — validar PIN, obter carteira, confirmar bilhete.
     Só devolve sucesso quando existe mesmo um bilhete para o evento. */
  async function verifyPin(phone, pin) {
    const mobile_phone = normalisePhone(phone)
    if (!isPlausiblePhone(mobile_phone)) throw new TicketError(TICKET_ERRORS.PHONE_INVALID)

    const digits = String(pin).replace(/\D/g, '')
    if (digits.length < 4) throw new TicketError(TICKET_ERRORS.PIN_WRONG)

    // 2 — PIN → account id  (o pin vai como número, não string)
    const step2 = await call('/external/account/pin_validation', {
      mobile_phone, pin: Number(digits),
    })
    if (step2.status !== 201) {
      const code = step2.payload?.error?.code
      const message = step2.payload?.message
      if (code === 'operation_pin_mismatch') throw new TicketError(TICKET_ERRORS.PIN_WRONG)
      if (code === 'invalid_input') throw new TicketError(TICKET_ERRORS.PHONE_INVALID)
      if (message === 'Operation not found') throw new TicketError(TICKET_ERRORS.PIN_NOT_REQUESTED)
      if (message === 'Account not registered') throw new TicketError(TICKET_ERRORS.ACCOUNT_NOT_REGISTERED)
      throw new TicketError(TICKET_ERRORS.TICKETING_UNAVAILABLE, { status: step2.status })
    }
    const accountId = step2.payload?.id
    if (!accountId) throw new TicketError(TICKET_ERRORS.TICKETING_UNAVAILABLE, { step: 'pin_validation' })

    // 3 — account id → wallet id
    const step3 = await call('/external/cashless/wallet', { account: accountId })
    if (step3.status !== 200 || !step3.payload?.wallet) {
      if (step3.payload?.message === 'Account not found') {
        throw new TicketError(TICKET_ERRORS.ACCOUNT_NOT_REGISTERED)
      }
      throw new TicketError(TICKET_ERRORS.TICKETING_UNAVAILABLE, { step: 'wallet', status: step3.status })
    }
    const walletId = step3.payload.wallet

    // 4 — wallet id → bilhetes. Lista vazia = sem acesso.
    const step4 = await call('/external/tickets', { wallet_id: walletId })
    if (step4.status !== 201 && step4.status !== 200) {
      throw new TicketError(TICKET_ERRORS.TICKETING_UNAVAILABLE, { step: 'tickets', status: step4.status })
    }

    const tickets = normaliseTickets(step4.payload)
    if (tickets.length === 0) throw new TicketError(TICKET_ERRORS.NO_TICKET)

    return { phone: mobile_phone, accountId, walletId, tickets }
  }

  return { requestPin, verifyPin }
}

/* A documentação mostra um bilhete solto num exemplo e fala em "lista".
   Aceitamos as duas formas para não partir se a API devolver uma só. */
function normaliseTickets(payload) {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.tickets)) return payload.tickets
  if (payload?.ticket_id) return [payload]
  return []
}

/* ── cliente de mentira, para desenvolver sem a chave real ────── */

export function createMockTicketing() {
  const pending = new Map()

  // Números de teste: qualquer número acabado em 0 fica "sem bilhete".
  const hasTicket = phone => !phone.endsWith('0')

  return {
    async requestPin(phone) {
      const mobile_phone = normalisePhone(phone)
      if (!isPlausiblePhone(mobile_phone)) throw new TicketError(TICKET_ERRORS.PHONE_INVALID)
      const existing = pending.get(mobile_phone)
      if (existing && existing.expiresAt > Date.now()) {
        throw new TicketError(TICKET_ERRORS.PIN_ALREADY_SENT, {
          expiresAt: new Date(existing.expiresAt).toISOString(),
        })
      }
      const expiresAt = Date.now() + 5 * 60_000
      pending.set(mobile_phone, { pin: '1234', expiresAt })
      return { phone: mobile_phone, expiresAt: new Date(expiresAt).toISOString(), mockPin: '1234' }
    },

    async verifyPin(phone, pin) {
      const mobile_phone = normalisePhone(phone)
      const entry = pending.get(mobile_phone)
      if (!entry || entry.expiresAt <= Date.now()) throw new TicketError(TICKET_ERRORS.PIN_NOT_REQUESTED)
      if (String(pin).replace(/\D/g, '') !== entry.pin) throw new TicketError(TICKET_ERRORS.PIN_WRONG)
      if (!hasTicket(mobile_phone)) throw new TicketError(TICKET_ERRORS.NO_TICKET)
      pending.delete(mobile_phone)
      return {
        phone: mobile_phone,
        accountId: 'mock-' + mobile_phone.slice(-9),
        walletId: 'mock-wallet',
        tickets: [{ ticket_id: 'mock-ticket', ticket_name: 'General Admission — 1st Release', paid_value: 15 }],
      }
    },
  }
}

/* Escolhe o cliente conforme existir ou não a chave.

   O cliente é reaproveitado entre pedidos: o simulador guarda os PINs
   pendentes em memória, e um cliente novo a cada chamada esqueceria o
   PIN acabado de enviar. */
let guardado = null

export function ticketingFromEnv(env = process.env) {
  const secretKey = env.THREECKET_SECRET_KEY
  const apiUrl = env.THREECKET_API_URL || 'https://api.3cket.com'
  const assinatura = `${apiUrl}::${secretKey ? 'real' : 'mock'}`

  if (guardado?.assinatura !== assinatura) {
    guardado = secretKey
      ? { assinatura, client: createTicketing({ apiUrl, secretKey }), isMock: false }
      : { assinatura, client: createMockTicketing(), isMock: true }
  }
  return guardado
}
