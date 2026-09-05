/* Verificações da leitura do bilhete e do passe por email.

   Duas regras acima de todas:
     • na dúvida, ninguém perde a vaga
     • nada disto pode levantar exceção — uma falha na leitura ou no
       email não pode desfazer uma inscrição que já está guardada */

import assert from 'node:assert/strict'
import { decidirDaLeitura, validarComprovativo, validadorLigado, DECISOES } from './validador.js'
import { corpoDoPasse, enviarPasse, emailPlausivel, normalizarEmail, correioLigado } from './correio.js'

let passou = 0
const ok = n => { console.log('  ✓', n); passou++ }

console.log('\nDecidir a partir do que se leu')
{
  const d = decidirDaLeitura({
    e_bilhete: true, legivel: true, decisao: 'valido',
    referencia: 'ABC-123', motivo: 'Bilhete do 7WONDERS.',
  })
  assert.equal(d.decisao, DECISOES.VALIDO)
  assert.equal(d.referencia, 'ABC-123');               ok('bilhete legível do evento é válido')
}
{
  const d = decidirDaLeitura({ e_bilhete: false, legivel: true, decisao: 'valido', motivo: 'É uma selfie.' })
  assert.equal(d.decisao, DECISOES.RECUSADO)
  assert.match(d.motivo, /selfie/);                    ok('não sendo bilhete, recusa mesmo que diga válido')
}
{
  const d = decidirDaLeitura({ e_bilhete: true, legivel: false, decisao: 'valido', motivo: 'Está desfocado.' })
  assert.equal(d.decisao, DECISOES.RECUSADO);          ok('ilegível recusa-se, para se anexar outro')
}
{
  const d = decidirDaLeitura({ e_bilhete: true, legivel: true, decisao: 'duvida', motivo: 'Não se lê o evento.' })
  assert.equal(d.decisao, DECISOES.DUVIDA);            ok('dúvida fica para a equipa')
}
{
  const d = decidirDaLeitura({ e_bilhete: true, legivel: true, decisao: 'recusado', motivo: '' })
  assert.equal(d.decisao, DECISOES.RECUSADO)
  assert.ok(d.motivo.length > 0);                      ok('recusa sem motivo escrito ganha um motivo')
}
{
  assert.equal(decidirDaLeitura(null).decisao, DECISOES.DUVIDA);  ok('sem leitura nenhuma, dúvida')
  assert.equal(decidirDaLeitura(undefined).decisao, DECISOES.DUVIDA)
  ok('resposta vazia do modelo não estoira')
}
{
  const d = decidirDaLeitura({
    e_bilhete: true, legivel: true, decisao: 'valido',
    referencia: 'x'.repeat(500), motivo: 'y'.repeat(2000),
  })
  assert.ok(d.referencia.length <= 120)
  assert.ok(d.motivo.length <= 300);                   ok('texto comprido do modelo é cortado')
}

console.log('\nQuando não há por onde ler')
{
  assert.equal(validadorLigado({}), false)
  assert.equal(validadorLigado({ ANTHROPIC_API_KEY: 'sk-x' }), true);  ok('sabe dizer se está ligado')
}
{
  const d = await validarComprovativo('fotos/a.jpg', {})
  assert.equal(d.decisao, DECISOES.DUVIDA);            ok('sem chave, a vaga fica guardada')
}
{
  const d = await validarComprovativo(null, { ANTHROPIC_API_KEY: 'sk-x' })
  assert.equal(d.decisao, DECISOES.DUVIDA);            ok('sem comprovativo, dúvida e não erro')
}
{
  // Sem base de dados o ficheiro não se vai buscar a lado nenhum.
  const d = await validarComprovativo('fotos/a.jpg', { ANTHROPIC_API_KEY: 'sk-x' })
  assert.equal(d.decisao, DECISOES.DUVIDA);            ok('ficheiro que não se abre não custa a vaga a ninguém')
}

console.log('\nO passe por email')
{
  assert.equal(emailPlausivel('marta@exemplo.pt'), true)
  assert.equal(emailPlausivel('marta@exemplo'), false)
  assert.equal(emailPlausivel('sem arroba'), false)
  assert.equal(emailPlausivel(''), false)
  assert.equal(emailPlausivel(null), false);           ok('reconhece um email escrito à pressa')
  assert.equal(normalizarEmail('  Marta@Exemplo.PT '), 'marta@exemplo.pt')
  ok('email normalizado, para não haver duas contas iguais')
}
{
  const { assunto, texto, html } = corpoDoPasse({ nome: 'Marta Ribeiro', aulas: ['barre', 'yoga'] })
  assert.match(texto, /Marta, está confirmado/)
  assert.match(texto, /Barre Class/)
  assert.match(texto, /Yoga/)
  assert.match(texto, /12 SETEMBRO 2026/);             ok('o passe leva as aulas, o dia e o sítio')
  assert.ok(texto.indexOf('Yoga') < texto.indexOf('Barre Class'))
  ok('e por ordem de hora, não pela ordem em que se inscreveu')
  assert.match(assunto, /7WONDERS/);                   ok('o assunto diz de onde vem')
  assert.ok(!html.includes('<script'));                ok('nada de script dentro do email')
}
{
  const { assunto } = corpoDoPasse({ nome: 'Rui', aulas: ['yoga'] })
  assert.match(assunto, /Yoga/);                       ok('com uma aula só, o assunto diz qual é')
}
{
  const { html } = corpoDoPasse({ nome: '<b>Marta</b>', aulas: [] })
  assert.ok(!html.includes('<b>Marta</b>'))
  assert.ok(html.includes('&lt;b&gt;Marta&lt;/b&gt;')); ok('o nome escrito com marcação vai escapado')
}
{
  const { texto } = corpoDoPasse({ nome: '', aulas: [] })
  assert.match(texto, /Olá/);                          ok('sem nome, o passe sai à mesma')
}
{
  assert.equal(correioLigado({}), false)
  assert.deepEqual(await enviarPasse({ nome: 'Ana', email: 'ana@exemplo.pt', aulas: ['yoga'] }, {}),
    { enviado: false, motivo: 'SEM_CHAVE' })
  ok('sem chave de email a inscrição segue na mesma')
}
{
  const r = await enviarPasse({ nome: 'Ana', email: 'nao-e-email', aulas: [] }, { RESEND_API_KEY: 'x' })
  assert.equal(r.enviado, false)
  assert.equal(r.motivo, 'EMAIL_INVALIDO');            ok('email mal escrito não vai para a rua')
}

console.log(`\n✅ ${passou} verificações passaram\n`)
