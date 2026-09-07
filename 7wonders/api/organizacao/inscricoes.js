/* POST /api/organizacao/inscricoes   { vista?, estado? }

   Três vistas, uma função só. A Vercel no plano Hobby publica no
   máximo 12 funções e não vale a pena gastar uma por cada lista.

     rever   inscrições uma a uma, com o comprovativo à vista, para
             decidir o que a leitura automática não decidiu
     aulas   quem está inscrito em cada aula — a lista para levar
             para o recinto
     after   as candidaturas à After Party

   As fotos só saem na vista "rever": emitir um endereço assinado
   por linha é lento, e nas listas ninguém olha para elas.          */

import { baseDeDados } from '../_lib/aulas.js'
import { enderecoParaVer } from '../_lib/armazenamento.js'
import { readSession } from '../_lib/session.js'
import { readJsonBody, send, onlyPost } from '../_lib/http.js'

const CAMPOS = 'id, aula_id, nome, telefone, email, bolso, estado, referencia, automatico,' +
               ' comprovativo, impressao, criado_em, nota, aulas ( nome )'

export default async function handler(req, res) {
  if (onlyPost(req, res)) return

  const ficha = readSession((req.headers.authorization || '').replace(/^Bearer /, ''))
  if (ficha?.papel !== 'organizacao') return send(res, 401, { error: 'SESSAO_INVALIDA' })

  const db = baseDeDados()
  if (!db) return send(res, 503, { error: 'INDISPONIVEL' })

  const { vista = 'rever', estado } = readJsonBody(req)

  try {
    if (vista === 'after') return send(res, 200, await candidaturasAfter(db))
    if (vista === 'aulas') return send(res, 200, await porAula(db))
    return send(res, 200, await paraRever(db, estado))
  } catch {
    return send(res, 503, { error: 'INDISPONIVEL' })
  }
}

/* ── uma a uma, com foto ── */

async function paraRever(db, estado) {
  let consulta = db.from('inscricoes').select(CAMPOS)
    .order('criado_em', { ascending: false }).limit(500)
  if (estado) consulta = consulta.eq('estado', estado)

  const { data, error } = await consulta
  if (error) throw error

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

  return { inscricoes, contagem: contar(data) }
}

/* ── a lista de cada aula ── */

async function porAula(db) {
  const [{ data: linhas, error }, { data: aulas }] = await Promise.all([
    db.from('inscricoes')
      .select('id, aula_id, nome, telefone, email, estado, criado_em, aulas ( nome )')
      .neq('estado', 'recusado')
      .order('criado_em', { ascending: true }).limit(2000),
    db.from('aulas').select('id, nome, capacidade_convite, capacidade_bilhete, ocupado_convite, sem_limite'),
  ])
  if (error) throw error

  const porId = new Map()
  for (const a of aulas || []) {
    porId.set(a.id, {
      id: a.id,
      nome: a.nome,
      lugares: a.sem_limite ? null : a.capacidade_convite + a.capacidade_bilhete,
      pessoas: [],
    })
  }

  for (const l of linhas || []) {
    const aula = porId.get(l.aula_id) || porId.set(l.aula_id, {
      id: l.aula_id, nome: l.aulas?.nome || l.aula_id, lugares: null, pessoas: [],
    }).get(l.aula_id)
    aula.pessoas.push({
      nome: l.nome, telefone: l.telefone, email: l.email,
      estado: l.estado, quando: l.criado_em,
    })
  }

  // Aulas com gente primeiro: é para elas que se olha.
  const listas = [...porId.values()].sort((a, b) => b.pessoas.length - a.pessoas.length)
  return { listas, total: (linhas || []).length }
}

/* ── as candidaturas à After Party ── */

async function candidaturasAfter(db) {
  const { data, error } = await db.from('candidaturas_after')
    .select('id, nome, apelido, telefone, email, razoes, estado, criado_em')
    .order('criado_em', { ascending: false }).limit(1000)
  if (error) throw error

  const contagem = { nova: 0, aceite: 0, recusada: 0 }
  for (const c of data || []) contagem[c.estado] = (contagem[c.estado] || 0) + 1

  return { candidaturas: data || [], contagem }
}

function contar(linhas) {
  const contagem = { por_validar: 0, valido: 0, recusado: 0 }
  for (const l of linhas || []) contagem[l.estado] = (contagem[l.estado] || 0) + 1
  return contagem
}
