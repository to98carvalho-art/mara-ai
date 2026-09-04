/* POST /api/aulas/anular   { aulaId }   + Authorization: Bearer …  */

import { anular, ErroDeAula, ERROS_AULA } from '../_lib/aulas.js'
import { readSession } from '../_lib/session.js'
import { readJsonBody, send, onlyPost } from '../_lib/http.js'

export default async function handler(req, res) {
  if (onlyPost(req, res)) return

  const ficha = readSession((req.headers.authorization || '').replace(/^Bearer /, ''))
  if (!ficha) return send(res, 401, { error: 'SESSAO_INVALIDA' })

  const { aulaId } = readJsonBody(req)
  if (!aulaId) return send(res, 400, { error: 'AULA_DESCONHECIDA' })

  try {
    await anular(aulaId, ficha.accountId)
    return send(res, 200, { ok: true })
  } catch (erro) {
    if (erro instanceof ErroDeAula) {
      const estado = erro.codigo === ERROS_AULA.INDISPONIVEL ? 503 : 400
      return send(res, estado, { error: erro.codigo })
    }
    return send(res, 503, { error: ERROS_AULA.INDISPONIVEL })
  }
}
