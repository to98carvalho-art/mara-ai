/* Verificações da área da equipa. O que importa aqui é o portão:
   sem a palavra-passe certa, nada se lê nem se decide. */

import assert from 'node:assert/strict'
import entrar from './entrar.js'
import inscricoes from './inscricoes.js'
import decidir from './decidir.js'
import { signSession } from '../_lib/session.js'

let passou = 0
const ok = n => { console.log('  ✓', n); passou++ }

function resposta() {
  return { statusCode: 0, corpo: null, setHeader() {}, end(t) { this.corpo = t ? JSON.parse(t) : null } }
}
const pedido = (body = {}, auth, method = 'POST') => ({
  method, body,
  headers: auth ? { authorization: `Bearer ${auth}` } : {},
  socket: { remoteAddress: '10.1.1.' + Math.floor(Math.random() * 250) },
})

const ambiente = { SESSION_SECRET: 'segredo-de-teste' }
process.env.SESSION_SECRET = ambiente.SESSION_SECRET

console.log('\nEntrar')
{
  delete process.env.ADMIN_PASSWORD
  const res = resposta()
  await entrar(pedido({ palavra: 'seja o que for' }), res)
  assert.equal(res.statusCode, 503)
  assert.equal(res.corpo.error, 'SEM_PALAVRA_PASSE');  ok('sem palavra-passe definida, não deixa entrar ninguém')
}
process.env.ADMIN_PASSWORD = 'palavra-de-teste'
{
  const res = resposta()
  await entrar(pedido({ palavra: 'errada' }), res)
  assert.equal(res.statusCode, 401);                   ok('palavra errada, recusa')
}
{
  const res = resposta()
  await entrar(pedido({}), res)
  assert.equal(res.statusCode, 401);                   ok('sem palavra nenhuma, recusa')
}
{
  const res = resposta()
  await entrar(pedido({ palavra: 'palavra-de-teste' }), res)
  assert.equal(res.statusCode, 200)
  assert.ok(res.corpo.token);                          ok('palavra certa, dá ficha')
}
{
  const res = resposta()
  await entrar(pedido({}, undefined, 'GET'), res)
  assert.equal(res.statusCode, 405);                   ok('recusa métodos que não sejam POST')
}
{
  // dez tentativas seguidas da mesma origem e fecha
  const mesmaOrigem = () => ({
    method: 'POST', body: { palavra: 'errada' }, headers: {},
    socket: { remoteAddress: '10.9.9.9' },
  })
  let ultima
  for (let i = 0; i < 12; i++) { ultima = resposta(); await entrar(mesmaOrigem(), ultima) }
  assert.equal(ultima.statusCode, 429);                ok('trava quem tenta adivinhar à força')
}

console.log('\nVer e decidir')
const fichaDeParticipante = signSession({ accountId: '+351911111111', phone: '+351911111111' }, ambiente)
const fichaDaEquipa = signSession({ papel: 'organizacao' }, ambiente)

for (const [nome, funcao, corpo] of [
  ['listar', inscricoes, {}],
  ['decidir', decidir, { id: 'x', estado: 'valido' }],
]) {
  let res = resposta()
  await funcao(pedido(corpo), res)
  assert.equal(res.statusCode, 401);                   ok(`${nome}: sem ficha, recusa`)

  res = resposta()
  await funcao(pedido(corpo, 'inventada.assinatura'), res)
  assert.equal(res.statusCode, 401);                   ok(`${nome}: ficha forjada, recusa`)

  res = resposta()
  await funcao(pedido(corpo, fichaDeParticipante), res)
  assert.equal(res.statusCode, 401)
  ok(`${nome}: ficha de participante não serve para a área da equipa`)

  res = resposta()
  await funcao(pedido(corpo, fichaDaEquipa), res)
  assert.equal(res.statusCode, 503);                   ok(`${nome}: com ficha da equipa, chega à base de dados`)
}
{
  const res = resposta()
  await decidir(pedido({ id: 'x', estado: 'talvez' }, fichaDaEquipa), res)
  assert.equal(res.statusCode, 400);                   ok('decidir: estado inventado, recusa')
}

console.log(`\n✅ ${passou} verificações passaram\n`)
