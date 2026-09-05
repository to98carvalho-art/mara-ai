/* ════════════════════════════════════════════════════════════════
   VAGAS — acesso à base de dados, sempre do lado do servidor.

   O browser nunca fala com o Supabase. Fala com as funções de
   api/aulas/, e são elas que usam a chave de serviço. Assim a
   contagem de vagas é a mesma para toda a gente e ninguém a
   consegue falsificar a partir do telemóvel.
   ════════════════════════════════════════════════════════════════ */

import { createClient } from '@supabase/supabase-js'

export const ERROS_AULA = {
  AULA_DESCONHECIDA: 'AULA_DESCONHECIDA',
  SEM_INSCRICAO:     'SEM_INSCRICAO',
  JA_INSCRITO:       'JA_INSCRITO',
  NAO_INSCRITO:      'NAO_INSCRITO',
  SEM_VAGAS:         'SEM_VAGAS',
  INDISPONIVEL:      'INDISPONIVEL',
}

export class ErroDeAula extends Error {
  constructor(codigo) { super(codigo); this.codigo = codigo }
}

let cliente = null

/* Devolve o cliente, ou null se a base de dados ainda não estiver
   configurada — nesse caso a app corre em modo local. */
export function baseDeDados(env = process.env) {
  // Copiar e colar traz quase sempre um espaço ou uma quebra de linha
  // atrás. Não é razão para o site inteiro ficar sem base de dados.
  const url = (env.SUPABASE_URL || '').trim()
  const chave = (env.SUPABASE_SERVICE_ROLE_KEY || '').trim()
  if (!url || !chave) return null
  cliente ||= createClient(url, chave, { auth: { persistSession: false } })
  return cliente
}

/* As funções do Postgres levantam exceções com o código no texto. */
function traduzir(erro) {
  const cru = `${erro?.message || ''}`.toUpperCase()
  const conhecido = Object.keys(ERROS_AULA).find(c => cru.includes(c))
  return new ErroDeAula(conhecido || ERROS_AULA.INDISPONIVEL)
}

export async function disponibilidade(env) {
  const db = baseDeDados(env)
  if (!db) return null
  const { data, error } = await db.from('disponibilidade').select('*')
  if (error) throw traduzir(error)
  return Object.fromEntries((data || []).map(l => [l.aula_id, {
    lugares: l.lugares, ocupados: l.ocupados, livres: l.livres,
  }]))
}

export async function minhasInscricoes(conta, env) {
  const db = baseDeDados(env)
  if (!db || !conta) return []
  // Uma inscrição recusada já não vale: a vaga voltou a ficar livre
  // e o horário não a pode mostrar como marcada.
  const { data, error } = await db
    .from('inscricoes').select('aula_id, criado_em')
    .eq('conta', conta).neq('estado', 'recusado')
  if (error) throw traduzir(error)
  return (data || []).map(l => l.aula_id)
}

export async function inscrever(aulaId, conta, telefone, extras = {}, env) {
  const db = baseDeDados(env)
  if (!db) throw new ErroDeAula(ERROS_AULA.INDISPONIVEL)
  const { error } = await db.rpc('inscrever', {
    p_aula: aulaId, p_conta: conta, p_telefone: telefone,
    p_nome: extras.nome ?? null,
    p_comprovativo: extras.comprovativo ?? null,
    p_impressao: extras.impressao ?? null,
    p_email: extras.email ?? null,
    p_estado: extras.estado ?? 'por_validar',
  })
  if (error) throw traduzir(error)
}

/* ── o bilhete de uma pessoa ────────────────────────────────────
   Um bilhete é da pessoa, não de uma aula. Quem já foi validado
   uma vez não volta a anexar nada nem a ser lido outra vez — sai
   mais barato e é menos chato. */

export async function bilheteDaConta(conta, env) {
  const db = baseDeDados(env)
  if (!db || !conta) return null
  const { data, error } = await db
    .from('inscricoes')
    .select('estado, nome, email, referencia, nota, comprovativo, impressao')
    .eq('conta', conta)
    .order('criado_em', { ascending: false })
  if (error) throw traduzir(error)
  if (!data?.length) return null

  // Basta uma linha válida: a decisão vale para a conta toda.
  const valida = data.find(l => l.estado === 'valido')
  return valida || data[0]
}

export async function validarConta(conta, estado, { nota, referencia, automatico } = {}, env) {
  const db = baseDeDados(env)
  if (!db) throw new ErroDeAula(ERROS_AULA.INDISPONIVEL)
  const { error } = await db.rpc('validar_conta', {
    p_conta: conta, p_estado: estado,
    p_nota: nota ?? null, p_referencia: referencia ?? null,
    p_automatico: Boolean(automatico),
  })
  if (error) throw traduzir(error)
}

/* Quantas outras pessoas já usaram este bilhete. Não recusa nada
   por si: um PDF com quatro bilhetes de um grupo é normal, e
   recusar por engano quem pagou seria pior. Só chama a equipa. */
export async function contasComOMesmoBilhete({ referencia, impressao }, conta, env) {
  const db = baseDeDados(env)
  if (!db) return 0

  const marcas = [referencia && ['referencia', referencia], impressao && ['impressao', impressao]]
    .filter(Boolean)
  if (!marcas.length) return 0

  const contas = new Set()
  for (const [coluna, valor] of marcas) {
    const { data } = await db
      .from('inscricoes').select('conta').eq(coluna, valor).neq('estado', 'recusado').limit(50)
    for (const linha of data || []) if (linha.conta !== conta) contas.add(linha.conta)
  }
  return contas.size
}

export async function marcarAvisado(conta, env) {
  const db = baseDeDados(env)
  if (!db) return
  await db.rpc('marcar_avisado', { p_conta: conta })
}

export async function anular(aulaId, conta, env) {
  const db = baseDeDados(env)
  if (!db) throw new ErroDeAula(ERROS_AULA.INDISPONIVEL)
  const { error } = await db.rpc('anular', { p_aula: aulaId, p_conta: conta })
  if (error) throw traduzir(error)
}
