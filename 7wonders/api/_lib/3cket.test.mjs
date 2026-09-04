import assert from 'node:assert/strict'
import {
  createTicketing, createMockTicketing, normalisePhone, isPlausiblePhone,
  TicketError, TICKET_ERRORS,
} from './3cket.js'
import { signSession, readSession } from './session.js'

let passed = 0
const ok = (name) => { console.log('  ✓', name); passed++ }
async function throwsCode(fn, code, name) {
  try { await fn(); assert.fail(`${name}: devia ter falhado com ${code}`) }
  catch (e) {
    assert.equal(e.code, code, `${name}: esperado ${code}, veio ${e.code}`)
    ok(name)
  }
}

console.log('\nNormalização de telefone')
assert.equal(normalisePhone('912345678'), '+351912345678');        ok('nacional 9 dígitos')
assert.equal(normalisePhone('912 345 678'), '+351912345678');      ok('com espaços')
assert.equal(normalisePhone('+351 912 345 678'), '+351912345678'); ok('já em formato +')
assert.equal(normalisePhone('00351912345678'), '+351912345678');   ok('prefixo 00')
assert.equal(normalisePhone('351912345678'), '+351912345678');     ok('indicativo sem +')
assert.equal(normalisePhone('+44 7700 900123'), '+447700900123');  ok('estrangeiro')
assert.equal(isPlausiblePhone('+351912345678'), true);             ok('plausível')
assert.equal(isPlausiblePhone('+12'), false);                      ok('curto demais')

/* ── fetch de mentira, a imitar as respostas documentadas ── */
function fakeApi(script) {
  const calls = []
  const fetchImpl = async (url, options) => {
    const path = url.replace('https://api.3cket.com', '')
    const body = JSON.parse(options.body)
    calls.push({ path, body, auth: options.headers.Authorization })
    const reply = script[path]
    const resolved = typeof reply === 'function' ? reply(body) : reply
    return { status: resolved.status, text: async () => JSON.stringify(resolved.body ?? null) }
  }
  return { fetchImpl, calls }
}
const client = (script) => {
  const { fetchImpl, calls } = fakeApi(script)
  return { api: createTicketing({ apiUrl: 'https://api.3cket.com', secretKey: 'CHAVE', fetchImpl }), calls }
}

console.log('\nPasso 1 — pedir PIN')
{
  const { api, calls } = client({
    '/external/account/phone_validation': { status: 201, body: { expires_at: '2026-09-12T14:30:13Z' } },
  })
  const r = await api.requestPin('912 345 678')
  assert.equal(r.phone, '+351912345678')
  assert.equal(r.expiresAt, '2026-09-12T14:30:13Z')
  assert.equal(calls[0].body.mobile_phone, '+351912345678'); ok('envia o número em formato +')
  assert.equal(calls[0].auth, 'Bearer CHAVE');               ok('leva a chave no header')
  ok('201 devolve expires_at')
}
{
  const { api } = client({
    '/external/account/phone_validation': {
      status: 400, body: { error: { code: 'operation_started' }, expires_at: '2026-09-12T14:30:13Z' },
    },
  })
  await throwsCode(() => api.requestPin('912345678'), TICKET_ERRORS.PIN_ALREADY_SENT, 'PIN ainda válido')
}
{
  const { api } = client({
    '/external/account/phone_validation': { status: 400, body: { error: { code: 'invalid_input' } } },
  })
  await throwsCode(() => api.requestPin('912345678'), TICKET_ERRORS.PHONE_INVALID, 'número inválido')
}
{
  const { api } = client({
    '/external/account/phone_validation': { status: 401, body: { message: 'Unauthorized.' } },
  })
  await throwsCode(() => api.requestPin('912345678'), TICKET_ERRORS.TICKETING_UNAVAILABLE,
    '401 não expõe o motivo ao utilizador')
}

console.log('\nPassos 2–4 — validar e confirmar bilhete')
const happy = {
  '/external/account/pin_validation': { status: 201, body: { id: 'conta-abc' } },
  '/external/cashless/wallet':        { status: 200, body: { wallet: 'carteira-xyz' } },
  '/external/tickets':                { status: 201, body: [{ ticket_id: 't1', ticket_name: 'Blind Ticket' }] },
}
{
  const { api, calls } = client(happy)
  const r = await api.verifyPin('912345678', '1558')
  assert.equal(r.accountId, 'conta-abc')
  assert.equal(r.walletId, 'carteira-xyz')
  assert.equal(r.tickets.length, 1)
  assert.equal(calls.length, 3);                       ok('encadeia as três chamadas')
  assert.equal(typeof calls[0].body.pin, 'number');    ok('o pin vai como número, não texto')
  assert.equal(calls[1].body.account, 'conta-abc');    ok('passa o account id à carteira')
  assert.equal(calls[2].body.wallet_id, 'carteira-xyz'); ok('passa a carteira aos bilhetes')
  ok('caminho feliz devolve conta + bilhetes')
}
{
  const { api } = client({ ...happy, '/external/tickets': { status: 201, body: [] } })
  await throwsCode(() => api.verifyPin('912345678', '1558'), TICKET_ERRORS.NO_TICKET,
    'lista vazia = sem bilhete, sem acesso')
}
{
  const { api } = client({
    '/external/account/pin_validation': { status: 400, body: { error: { code: 'operation_pin_mismatch' } } },
  })
  await throwsCode(() => api.verifyPin('912345678', '9999'), TICKET_ERRORS.PIN_WRONG, 'PIN errado')
}
{
  const { api } = client({
    '/external/account/pin_validation': { status: 404, body: { message: 'Operation not found' } },
  })
  await throwsCode(() => api.verifyPin('912345678', '1558'), TICKET_ERRORS.PIN_NOT_REQUESTED, 'PIN nunca pedido')
}
{
  const { api } = client({
    '/external/account/pin_validation': { status: 404, body: { message: 'Account not registered' } },
  })
  await throwsCode(() => api.verifyPin('912345678', '1558'), TICKET_ERRORS.ACCOUNT_NOT_REGISTERED, 'conta não registada')
}
{
  const { api, calls } = client({
    ...happy, '/external/cashless/wallet': { status: 404, body: { message: 'Account not found' } },
  })
  await throwsCode(() => api.verifyPin('912345678', '1558'), TICKET_ERRORS.ACCOUNT_NOT_REGISTERED, 'carteira inexistente')
  assert.equal(calls.length, 2); ok('para no passo 3, não chega a pedir bilhetes')
}
{
  const { api } = client({ ...happy, '/external/tickets': { status: 201, body: { ticket_id: 'solto' } } })
  const r = await api.verifyPin('912345678', '1558')
  assert.equal(r.tickets.length, 1); ok('aceita um bilhete solto além da lista')
}
{
  const api = createTicketing({
    apiUrl: 'https://api.3cket.com', secretKey: 'K',
    fetchImpl: async () => { throw new Error('rede em baixo') },
  })
  await throwsCode(() => api.requestPin('912345678'), TICKET_ERRORS.TICKETING_UNAVAILABLE, 'rede em baixo')
}

console.log('\nCliente de simulação')
{
  const mock = createMockTicketing()
  const r = await mock.requestPin('912345678')
  assert.equal(r.mockPin, '1234'); ok('devolve o PIN de teste')
  await throwsCode(() => mock.requestPin('912345678'), TICKET_ERRORS.PIN_ALREADY_SENT, 'não reenvia enquanto válido')
  await throwsCode(() => mock.verifyPin('912345678', '0000'), TICKET_ERRORS.PIN_WRONG, 'rejeita PIN errado')
  const s = await mock.verifyPin('912345678', '1234')
  assert.ok(s.accountId); ok('entra com o PIN certo')
  const mock2 = createMockTicketing()
  await mock2.requestPin('912345670')
  await throwsCode(() => mock2.verifyPin('912345670', '1234'), TICKET_ERRORS.NO_TICKET,
    'número acabado em 0 = sem bilhete')
}

console.log('\nSessão assinada')
{
  const env = { SESSION_SECRET: 'segredo-de-teste' }
  const token = signSession({ accountId: 'conta-abc', phone: '+351912345678' }, env)
  const read = readSession(token, env)
  assert.equal(read.accountId, 'conta-abc'); ok('lê o que assinou')
  assert.equal(readSession(token, { SESSION_SECRET: 'outro' }), null); ok('rejeita outra chave')
  const [data] = token.split('.')
  assert.equal(readSession(data + '.assinaturaFalsa', env), null); ok('rejeita assinatura forjada')
  const forged = Buffer.from(JSON.stringify({ accountId: 'intruso', exp: Date.now() + 1e6 })).toString('base64url')
  assert.equal(readSession(forged + '.x', env), null); ok('rejeita corpo trocado')
  const expired = signSession({ accountId: 'x' }, env, -1)
  assert.equal(readSession(expired, env), null); ok('rejeita sessão expirada')
}

console.log(`\n✅ ${passed} verificações passaram\n`)
