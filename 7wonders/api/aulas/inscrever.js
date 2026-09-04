/* POST /api/aulas/inscrever   { aulaId }   + Authorization: Bearer …
   → 200 { ok: true }
   → 401 sessão em falta ou expirada
   → 409 já inscrito / sem vagas                                    */

import { inscrever, ErroDeAula, ERROS_AULA } from '../_lib/aulas.js'
import { readSession } from '../_lib/session.js'
import { readJsonBody, send, onlyPost } from '../_lib/http.js'

export default async function handler(req, res) {
  if (onlyPost(req, res)) return

  const ficha = readSession((req.headers.authorization || '').replace(/^Bearer /, ''))
  if (!ficha) return send(res, 401, { error: 'SESSAO_INVALIDA' })

  const { aulaId } = readJsonBody(req)
  if (!aulaId) return send(res, 400, { error: 'AULA_DESCONHECIDA' })

  try {
    await inscrever(aulaId, ficha.accountId, ficha.phone)
    return send(res, 200, { ok: true })
  } catch (erro) {
    if (erro instanceof ErroDeAula) {
      // 409 = o pedido estava certo, o mundo é que mudou (esgotou,
      // ou já cá estavas). 503 = a culpa é nossa. 400 = pedido mal
      // formado. Confundi-los faz a app mentir a quem a usa.
      const estado =
        [ERROS_AULA.JA_INSCRITO, ERROS_AULA.SEM_VAGAS].includes(erro.codigo) ? 409
        : erro.codigo === ERROS_AULA.INDISPONIVEL ? 503
        : 400
      return send(res, estado, { error: erro.codigo })
    }
    return send(res, 503, { error: ERROS_AULA.INDISPONIVEL })
  }
}
