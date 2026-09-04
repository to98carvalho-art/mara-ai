/* ⚠️ TEMPORÁRIO — apagar assim que o problema estiver resolvido.

   POST /api/diagnostico-3cket  { phone }

   A 3cket responde «Validation error» sem dizer que campo está mal.
   Isto experimenta várias formas de enviar o mesmo número e mostra o
   que ela responde a cada uma, para se ver qual aceita.

   Nunca devolve a chave — só o que a 3cket disse.                    */

import { send, onlyPost, readJsonBody, rateLimit, clientIp } from './_lib/http.js'

export default async function handler(req, res) {
  if (onlyPost(req, res)) return

  // Cada tentativa pode enviar um SMS a sério. Trava a sério também.
  const guarda = rateLimit(`diag:${clientIp(req)}`, { max: 3, windowMs: 60 * 60_000 })
  if (!guarda.allowed) return send(res, 429, { error: 'TOO_MANY_REQUESTS' })

  const chave = process.env.THREECKET_SECRET_KEY
  if (!chave) return send(res, 503, { error: 'SEM_CHAVE' })
  const base = (process.env.THREECKET_API_URL || 'https://api.3cket.com').trim()

  const numero = String(readJsonBody(req).phone || '').replace(/\D/g, '')
  if (numero.length < 9) return send(res, 400, { error: 'PHONE_INVALID' })
  const nacional = numero.slice(-9)

  const tentativas = [
    ['com +351',        { mobile_phone: `+351${nacional}` }],
    ['sem +, com 351',  { mobile_phone: `351${nacional}` }],
    ['só os 9 dígitos', { mobile_phone: nacional }],
    ['00351',           { mobile_phone: `00351${nacional}` }],
    ['campo "phone"',   { phone: `+351${nacional}` }],
  ]

  const resultados = []
  for (const [descricao, corpo] of tentativas) {
    try {
      const r = await fetch(`${base}/external/account/phone_validation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${chave.trim()}` },
        body: JSON.stringify(corpo),
      })
      const texto = await r.text()
      resultados.push({ tentativa: descricao, enviado: corpo, status: r.status, resposta: texto.slice(0, 400) })
      if (r.status === 201) break            // acertou — não gastar mais SMS
    } catch (erro) {
      resultados.push({ tentativa: descricao, enviado: corpo, erro: String(erro).slice(0, 200) })
    }
  }

  return send(res, 200, { base, resultados })
}
