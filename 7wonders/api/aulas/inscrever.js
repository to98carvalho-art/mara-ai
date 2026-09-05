/* POST /api/aulas/inscrever
   { aulaId, nome, telefone, comprovativo, impressao }

   Sem a API da 3cket, a prova de bilhete é o ficheiro que a pessoa
   anexa. A vaga fica reservada logo, por validar, e a organização
   decide depois — esperar deixaria quem se inscreve sem saber se tem
   lugar.

   Devolve uma ficha de sessão para o mesmo telemóvel poder cancelar
   e ver as suas aulas mais tarde.

   → 200 { ok, token }
   → 409 já inscrito / sem vagas
   → 503 base de dados em baixo                                      */

import { inscrever, ErroDeAula, ERROS_AULA } from '../_lib/aulas.js'
import { readSession, signSession } from '../_lib/session.js'
import { normalisePhone, isPlausiblePhone } from '../_lib/3cket.js'
import { readJsonBody, send, onlyPost, rateLimit, clientIp } from '../_lib/http.js'

export default async function handler(req, res) {
  if (onlyPost(req, res)) return

  const corpo = readJsonBody(req)
  const { aulaId, comprovativo, impressao } = corpo
  if (!aulaId) return send(res, 400, { error: 'AULA_DESCONHECIDA' })

  // Quem já entrou neste dispositivo não volta a escrever tudo.
  const ficha = readSession((req.headers.authorization || '').replace(/^Bearer /, ''))

  const telefone = ficha?.phone || normalisePhone(corpo.telefone || '')
  if (!isPlausiblePhone(telefone)) return send(res, 400, { error: 'TELEFONE_INVALIDO' })

  const nome = String(corpo.nome || ficha?.nome || '').trim()
  if (!nome || nome.length > 80) return send(res, 400, { error: 'NOME_EM_FALTA' })

  // O comprovativo é obrigatório na primeira inscrição. Nas seguintes
  // já não: a pessoa é a mesma, e a prova já está entregue.
  if (!ficha && !comprovativo) return send(res, 400, { error: 'COMPROVATIVO_EM_FALTA' })

  const guarda = rateLimit(`inscrever:${clientIp(req)}`, { max: 30, windowMs: 30 * 60_000 })
  if (!guarda.allowed) return send(res, 429, { error: 'TOO_MANY_REQUESTS' })

  try {
    await inscrever(aulaId, telefone, telefone, { nome, comprovativo, impressao })
    return send(res, 200, {
      ok: true,
      token: signSession({ accountId: telefone, phone: telefone, nome }),
      user: { accountId: telefone, phone: telefone, nome },
    })
  } catch (erro) {
    if (erro instanceof ErroDeAula) {
      const estado =
        [ERROS_AULA.JA_INSCRITO, ERROS_AULA.SEM_VAGAS].includes(erro.codigo) ? 409
        : erro.codigo === ERROS_AULA.INDISPONIVEL ? 503
        : 400
      return send(res, estado, { error: erro.codigo })
    }
    return send(res, 503, { error: ERROS_AULA.INDISPONIVEL })
  }
}
