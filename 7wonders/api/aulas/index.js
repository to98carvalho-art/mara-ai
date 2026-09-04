/* POST /api/aulas
   Devolve as vagas de todas as aulas e, se vier sessão, quais são
   as minhas. Não exige sessão: o horário é público.

   → 200 { modo: 'servidor', vagas, minhas }
   → 200 { modo: 'local' }   base de dados ainda não configurada    */

import { disponibilidade, minhasInscricoes } from '../_lib/aulas.js'
import { readSession } from '../_lib/session.js'
import { send, onlyPost } from '../_lib/http.js'

export default async function handler(req, res) {
  if (onlyPost(req, res)) return

  try {
    const vagas = await disponibilidade()
    if (!vagas) return send(res, 200, { modo: 'local' })

    const ficha = readSession((req.headers.authorization || '').replace(/^Bearer /, ''))
    const minhas = ficha ? await minhasInscricoes(ficha.accountId) : []

    return send(res, 200, { modo: 'servidor', vagas, minhas })
  } catch {
    // Se a base de dados falhar, o horário continua a abrir — sem
    // contagens, mas legível. Um erro aqui não pode fechar o site.
    return send(res, 200, { modo: 'local', avaria: true })
  }
}
