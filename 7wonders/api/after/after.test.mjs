/* Verificações da candidatura ao after party. */
import assert from 'node:assert/strict'
import handler, { validar } from './index.js'

let passou = 0
const ok = n => { console.log('  ✓', n); passou++ }

const base = {
  nome: 'Marta', apelido: 'Ribeiro', telefone: '912345678',
  email: 'marta@exemplo.pt', razoes: '1. Levo o meu irmão\n2. Danço bem\n3. Sei o caminho',
}

console.log('\nO que passa')
{
  const { limpo, erro } = validar(base)
  assert.equal(erro, undefined)
  assert.equal(limpo.telefone, '+351912345678'); ok('número fica em formato internacional')
  assert.equal(limpo.nome, 'Marta');             ok('candidatura completa é aceite')
}
{
  const { limpo } = validar({ ...base, nome: '  Marta  ', email: ' marta@exemplo.pt ' })
  assert.equal(limpo.nome, 'Marta')
  assert.equal(limpo.email, 'marta@exemplo.pt'); ok('espaços à volta são limpos')
}

console.log('\nO que é recusado')
for (const campo of ['nome', 'apelido', 'email', 'razoes']) {
  const r = validar({ ...base, [campo]: '   ' })
  assert.equal(r.erro, 'CAMPO_EM_FALTA')
  assert.equal(r.campo, campo);                  ok(`${campo} em branco`)
}
{
  const r = validar({ ...base, email: 'marta.exemplo.pt' })
  assert.equal(r.erro, 'EMAIL_INVALIDO');        ok('email sem @')
}
{
  const r = validar({ ...base, telefone: '12' })
  assert.equal(r.erro, 'TELEFONE_INVALIDO');     ok('número curto demais')
}
{
  const r = validar({ ...base, telefone: '' })
  assert.equal(r.erro, 'TELEFONE_INVALIDO');     ok('número em branco')
}
{
  const r = validar({ ...base, razoes: 'porque sim' })
  assert.equal(r.erro, 'RAZOES_CURTAS');         ok('razões curtas demais')
}
{
  const r = validar({ ...base, nome: 'a'.repeat(200) })
  assert.equal(r.erro, 'CAMPO_LONGO');           ok('campo demasiado longo')
}
{
  const r = validar({ ...base, razoes: 'x'.repeat(3000) })
  assert.equal(r.erro, 'CAMPO_LONGO');           ok('texto gigante é travado antes da base de dados')
}

console.log('\nA função de servidor')
function resposta() {
  return {
    statusCode: 0, corpo: null,
    setHeader() {},
    end(t) { this.corpo = t ? JSON.parse(t) : null },
  }
}
const pedido = (body, method = 'POST') => ({
  method, body, headers: {}, socket: { remoteAddress: '10.0.0.9' },
})
{
  const res = resposta()
  await handler(pedido({}, 'GET'), res)
  assert.equal(res.statusCode, 405);             ok('recusa métodos que não sejam POST')
}
{
  const res = resposta()
  await handler(pedido({ ...base, email: 'nao-e-email' }), res)
  assert.equal(res.statusCode, 400)
  assert.equal(res.corpo.campo, 'email');        ok('diz qual foi o campo errado')
}
{
  const res = resposta()
  await handler(pedido(base), res)
  assert.equal(res.statusCode, 503)
  assert.equal(res.corpo.error, 'INDISPONIVEL'); ok('sem base de dados NÃO confirma o envio')
}
{
  // a trava de abuso conta por origem
  let ultima
  for (let i = 0; i < 10; i++) {
    ultima = resposta()
    await handler(pedido({ ...base, telefone: `91234567${i}` }), ultima)
  }
  assert.equal(ultima.statusCode, 429);          ok('corta o envio em série da mesma origem')
}

console.log(`\n✅ ${passou} verificações passaram\n`)
