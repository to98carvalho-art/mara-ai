/* POST /api/organizacao/inscricoes   { estado? }
   Lista as inscrições para a equipa rever, com um endereço de curta
   duração para ver cada comprovativo.

   A maior parte já vem decidida pela leitura automática. O que fica
   por validar é o que a máquina não quis decidir sozinha — e é isso
   que interessa à equipa.

   Marca também os comprovativos repetidos — o mesmo print a circular
   por um grupo inteiro é o abuso mais provável.                     */

import { baseDeDados } from '../_lib/aulas.js'
import { enderecoParaVer } from '../_lib/armazenamento.js'
import { readSession } from '../_lib/session.js'
import { readJsonBody, send, onlyPost } from '../_lib/http.js'

export default async function handler(req, res) {
  if (onlyPost(req, res)) return

  const ficha = readSession((req.headers.authorization || '').replace(/^Bearer /, ''))
  if (ficha?.papel !== 'organizacao') return send(res, 401, { error: 'SESSAO_INVALIDA' })

  const db = baseDeDados()
  if (!db) return send(res, 503, { error: 'INDISPONIVEL' })

  const { estado } = readJsonBody(req)

  let consulta = db
    .from('inscricoes')
    .select('id, aula_id, nome, telefone, email, bolso, estado, referencia, automatico, comprovativo, impressao, criado_em, nota, aulas ( nome )')
    .order('criado_em', { ascending: false })
    .limit(500)
  if (estado) consulta = consulta.eq('estado', estado)

  const { data, error } = await consulta
  if (error) return send(res, 503, { error: 'INDISPONIVEL' })

  const quantasVezes = new Map()
  for (const l of data || []) {
    if (l.impressao) quantasVezes.set(l.impressao, (quantasVezes.get(l.impressao) || 0) + 1)
  }

  const inscricoes = await Promise.all((data || []).map(async l => ({
    id: l.id,
    aula: l.aulas?.nome || l.aula_id,
    nome: l.nome,
    telefone: l.telefone,
    email: l.email,
    estado: l.estado,
    referencia: l.referencia,
    automatico: l.automatico,
    quando: l.criado_em,
    nota: l.nota,
    comprovativo: await enderecoParaVer(l.comprovativo),
    ehPdf: Boolean(l.comprovativo?.endsWith('.pdf')),
    repetido: l.impressao ? quantasVezes.get(l.impressao) > 1 : false,
  })))

  const contagem = { por_validar: 0, valido: 0, recusado: 0 }
  for (const l of data || []) contagem[l.estado] = (contagem[l.estado] || 0) + 1

  return send(res, 200, { inscricoes, contagem })
}
