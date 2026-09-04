/* Verificações das funções de servidor das aulas.

   O SQL — a trava de vagas — é testado à parte, contra um Postgres a
   sério, em supabase/testar-vagas.sh. Aqui prova-se o portão: quem
   não tem sessão válida não escreve nada, e a falta de base de dados
   não fecha o site.                                                  */

import assert from 'node:assert/strict'
import listar from './index.js'
import inscreverHandler from './inscrever.js'
import anularHandler from './anular.js'
import { signSession } from '../_lib/session.js'

let passou = 0
const ok = n => { console.log('  ✓', n); passou++ }

/* req/res de mentira, suficientes para os handlers */
function pedido({ method = 'POST', body = {}, auth } = {}) {
  return {
    method, body,
    headers: auth ? { authorization: `Bearer ${auth}` } : {},
    socket: { remoteAddress: '127.0.0.1' },
  }
}
function resposta() {
  const r = {
    statusCode: 0, corpo: null, cabecalhos: {},
    setHeader(k, v) { this.cabecalhos[k] = v },
    end(texto) { this.corpo = texto ? JSON.parse(texto) : null },
  }
  return r
}

const ambiente = { SESSION_SECRET: 'segredo-de-teste' }
const fichaValida = signSession({ accountId: 'conta-1', phone: '+351911111111' }, ambiente)

console.log('\nListar aulas (rota pública)')
{
  const res = resposta()
  await listar(pedido(), res)
  assert.equal(res.statusCode, 200)
  assert.equal(res.corpo.modo, 'local');            ok('sem base de dados, responde "local"')
  ok('e devolve 200 — o horário abre sempre')
}
{
  const res = resposta()
  await listar(pedido({ method: 'GET' }), res)
  assert.equal(res.statusCode, 405);                ok('recusa métodos que não sejam POST')
}

console.log('\nInscrever')
{
  const res = resposta()
  await inscreverHandler(pedido({ body: { aulaId: 'barre' } }), res)
  assert.equal(res.statusCode, 401)
  assert.equal(res.corpo.error, 'SESSAO_INVALIDA'); ok('sem sessão, recusa')
}
{
  const res = resposta()
  await inscreverHandler(pedido({ body: { aulaId: 'barre' }, auth: 'inventado.assinatura' }), res)
  assert.equal(res.statusCode, 401);                ok('sessão forjada, recusa')
}
{
  const expirada = signSession({ accountId: 'x' }, ambiente, -1)
  const res = resposta()
  await inscreverHandler(pedido({ body: { aulaId: 'barre' }, auth: expirada }), res)
  assert.equal(res.statusCode, 401);                ok('sessão expirada, recusa')
}
{
  process.env.SESSION_SECRET = ambiente.SESSION_SECRET
  const res = resposta()
  await inscreverHandler(pedido({ body: {}, auth: fichaValida }), res)
  assert.equal(res.statusCode, 400)
  assert.equal(res.corpo.error, 'AULA_DESCONHECIDA'); ok('sem aula indicada, recusa')
}
{
  const res = resposta()
  await inscreverHandler(pedido({ body: { aulaId: 'barre' }, auth: fichaValida }), res)
  assert.equal(res.statusCode, 503)
  assert.equal(res.corpo.error, 'INDISPONIVEL');     ok('com sessão mas sem base de dados, 503')
}

console.log('\nAnular')
{
  const res = resposta()
  await anularHandler(pedido({ body: { aulaId: 'barre' } }), res)
  assert.equal(res.statusCode, 401);                ok('sem sessão, recusa')
}
{
  const res = resposta()
  await anularHandler(pedido({ body: { aulaId: 'barre' }, auth: fichaValida }), res)
  assert.equal(res.statusCode, 503);                ok('sem base de dados, 503')
}

console.log(`\n✅ ${passou} verificações passaram\n`)
