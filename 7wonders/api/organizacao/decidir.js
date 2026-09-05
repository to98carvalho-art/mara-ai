/* POST /api/organizacao/decidir   { id, estado, nota? }
   estado: 'valido' | 'recusado' | 'por_validar'

   Recusar liberta a vaga: a contagem deixa de contar as recusadas.  */

import { baseDeDados } from '../_lib/aulas.js'
import { readSession } from '../_lib/session.js'
import { readJsonBody, send, onlyPost } from '../_lib/http.js'

const ESTADOS = ['valido', 'recusado', 'por_validar']

export default async function handler(req, res) {
  if (onlyPost(req, res)) return

  const ficha = readSession((req.headers.authorization || '').replace(/^Bearer /, ''))
  if (ficha?.papel !== 'organizacao') return send(res, 401, { error: 'SESSAO_INVALIDA' })

  const { id, estado, nota } = readJsonBody(req)
  if (!id || !ESTADOS.includes(estado)) return send(res, 400, { error: 'PEDIDO_INVALIDO' })

  const db = baseDeDados()
  if (!db) return send(res, 503, { error: 'INDISPONIVEL' })

  const { error } = await db.rpc('decidir_inscricao', {
    p_id: id, p_estado: estado, p_nota: nota || null,
  })
  if (error) return send(res, 503, { error: 'INDISPONIVEL' })

  return send(res, 200, { ok: true })
}
