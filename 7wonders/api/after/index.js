/* POST /api/after   { nome, apelido, telefone, email, razoes }
   Guarda uma candidatura ao after party.

   → 200 { ok: true }
   → 400 { error, campo }   falta ou está mal preenchido
   → 429                    demasiados pedidos da mesma origem
   → 503                    não conseguimos guardar

   Nunca respondemos "enviada" sem ter guardado. Uma confirmação
   falsa perde candidaturas de gente a sério.                       */

import { baseDeDados } from '../_lib/aulas.js'
import { normalisePhone, isPlausiblePhone } from '../_lib/3cket.js'
import { readJsonBody, send, onlyPost, rateLimit, clientIp } from '../_lib/http.js'

const LIMITES = { nome: 80, apelido: 80, email: 160, razoes: 2000 }

export function validar(corpo) {
  const limpo = {}

  for (const campo of ['nome', 'apelido', 'email', 'razoes']) {
    const valor = String(corpo?.[campo] ?? '').trim()
    if (!valor) return { erro: 'CAMPO_EM_FALTA', campo }
    if (valor.length > LIMITES[campo]) return { erro: 'CAMPO_LONGO', campo }
    limpo[campo] = valor
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpo.email)) {
    return { erro: 'EMAIL_INVALIDO', campo: 'email' }
  }

  const telefone = normalisePhone(corpo?.telefone ?? '')
  if (!isPlausiblePhone(telefone)) return { erro: 'TELEFONE_INVALIDO', campo: 'telefone' }
  limpo.telefone = telefone

  // Três razões pedidas; uma palavra solta não é uma candidatura.
  if (limpo.razoes.length < 12) return { erro: 'RAZOES_CURTAS', campo: 'razoes' }

  return { limpo }
}

export default async function handler(req, res) {
  if (onlyPost(req, res)) return

  const guarda = rateLimit(`after:${clientIp(req)}`, { max: 6, windowMs: 30 * 60_000 })
  if (!guarda.allowed) {
    return send(res, 429, { error: 'TOO_MANY_REQUESTS', retryAfterSeconds: guarda.retryAfterSeconds })
  }

  const { erro, campo, limpo } = validar(readJsonBody(req))
  if (erro) return send(res, 400, { error: erro, campo })

  const db = baseDeDados()
  if (!db) return send(res, 503, { error: 'INDISPONIVEL' })

  const { error } = await db.rpc('candidatar_after', {
    p_nome: limpo.nome, p_apelido: limpo.apelido, p_telefone: limpo.telefone,
    p_email: limpo.email, p_razoes: limpo.razoes,
  })
  if (error) return send(res, 503, { error: 'INDISPONIVEL' })

  return send(res, 200, { ok: true })
}
