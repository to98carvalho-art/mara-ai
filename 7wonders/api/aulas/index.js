/* POST /api/aulas
   Devolve as vagas de todas as aulas e, se vier sessão, quais são
   as minhas. Não exige sessão: o horário é público.

   Diz também em que pé está a entrada de quem pergunta. Sem isso, a
   quem tivesse sido recusado não voltava a ser pedido o ficheiro — o
   ecrã achava que já se tinha identificado e a inscrição morria com
   um erro que a pessoa não sabia resolver.

   → 200 { modo: 'servidor', vagas, minhas, entrada }
   → 200 { modo: 'local' }   base de dados ainda não configurada    */

import { disponibilidade, minhasInscricoes, bilheteDaConta } from '../_lib/aulas.js'
import { readSession } from '../_lib/session.js'
import { send, onlyPost } from '../_lib/http.js'

export default async function handler(req, res) {
  if (onlyPost(req, res)) return

  try {
    const vagas = await disponibilidade()
    if (!vagas) return send(res, 200, { modo: 'local' })

    const ficha = readSession((req.headers.authorization || '').replace(/^Bearer /, ''))
    if (!ficha) return send(res, 200, { modo: 'servidor', vagas, minhas: [], entrada: null })

    const [minhas, bilhete] = await Promise.all([
      minhasInscricoes(ficha.accountId),
      bilheteDaConta(ficha.accountId),
    ])

    return send(res, 200, {
      modo: 'servidor', vagas, minhas,
      entrada: { estado: bilhete?.estado || null, nota: bilhete?.nota || '' },
    })
  } catch {
    // Se a base de dados falhar, o horário continua a abrir — sem
    // contagens, mas legível. Um erro aqui não pode fechar o site.
    return send(res, 200, { modo: 'local', avaria: true })
  }
}
