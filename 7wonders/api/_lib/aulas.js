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
  const url = env.SUPABASE_URL
  const chave = env.SUPABASE_SERVICE_ROLE_KEY
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
  const { data, error } = await db
    .from('inscricoes').select('aula_id, criado_em').eq('conta', conta)
  if (error) throw traduzir(error)
  return (data || []).map(l => l.aula_id)
}

export async function inscrever(aulaId, conta, telefone, env) {
  const db = baseDeDados(env)
  if (!db) throw new ErroDeAula(ERROS_AULA.INDISPONIVEL)
  const { error } = await db.rpc('inscrever', {
    p_aula: aulaId, p_conta: conta, p_telefone: telefone,
  })
  if (error) throw traduzir(error)
}

export async function anular(aulaId, conta, env) {
  const db = baseDeDados(env)
  if (!db) throw new ErroDeAula(ERROS_AULA.INDISPONIVEL)
  const { error } = await db.rpc('anular', { p_aula: aulaId, p_conta: conta })
  if (error) throw traduzir(error)
}
