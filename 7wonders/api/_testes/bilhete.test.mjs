/* Verificações da leitura do bilhete e do passe por email.

   Duas regras acima de todas:
     • na dúvida, ninguém perde a vaga
     • nada disto pode levantar exceção — uma falha na leitura ou no
       email não pode desfazer uma inscrição que já está guardada */

import assert from 'node:assert/strict'
import { decidirDaLeitura, nomeDaEntrada, validarComprovativo, validadorLigado, DECISOES } from '../_lib/validador.js'
import { corpoDoPasse, enviarPasse, emailPlausivel, normalizarEmail, correioLigado } from '../_lib/correio.js'

let passou = 0
const ok = n => { console.log('  ✓', n); passou++ }

console.log('\nDecidir a partir do que se leu')
{
  const d = decidirDaLeitura({
    e_entrada: true, legivel: true, decisao: 'valido', tipo: 'bilhete',
    referencia: 'ABC-123', motivo: 'Bilhete do 7WONDERS.',
  })
  assert.equal(d.decisao, DECISOES.VALIDO)
  assert.equal(d.referencia, 'ABC-123');               ok('bilhete legível do evento é válido')
}

/* Há convites e há bilhetes, de vários tipos, e valem todos. Recusar
   um convite por não dizer "bilhete" seria barrar quem a casa
   convidou — o erro mais caro que este código pode cometer. */
{
  const d = decidirDaLeitura({
    e_entrada: true, legivel: true, decisao: 'valido',
    tipo: 'convite', categoria: 'Staff', referencia: 'CV-9',
    motivo: 'Convite do 7WONDERS.',
  })
  assert.equal(d.decisao, DECISOES.VALIDO)
  assert.equal(d.tipo, 'convite');                     ok('um convite é tão válido como um bilhete')
  assert.equal(d.entrada, 'convite Staff');            ok('e é tratado pelo nome — "convite", não "bilhete"')
}
{
  const d = decidirDaLeitura({
    e_entrada: true, legivel: true, decisao: 'valido', tipo: 'bilhete', categoria: 'VIP',
    motivo: '', referencia: '',
  })
  assert.equal(d.entrada, 'bilhete VIP')
  assert.equal(d.referencia, null);                    ok('o tipo de bilhete aparece na nota da equipa')
}
{
  assert.equal(nomeDaEntrada({ tipo: 'indefinido' }), 'entrada')
  assert.equal(nomeDaEntrada({}), 'entrada')
  assert.equal(nomeDaEntrada(null), 'entrada');        ok('sem tipo, chama-se-lhe só "entrada"')
}
{
  const d = decidirDaLeitura({ e_entrada: false, legivel: true, decisao: 'valido', motivo: 'É uma selfie.' })
  assert.equal(d.decisao, DECISOES.RECUSADO)
  assert.match(d.motivo, /selfie/);                    ok('não sendo entrada, recusa mesmo que diga válido')
}
{
  const d = decidirDaLeitura({ e_entrada: true, legivel: false, decisao: 'valido', motivo: 'Está desfocado.' })
  assert.equal(d.decisao, DECISOES.RECUSADO);          ok('ilegível recusa-se, para se anexar outro')
}
{
  const d = decidirDaLeitura({ e_entrada: true, legivel: true, decisao: 'duvida', motivo: 'Não se lê o evento.' })
  assert.equal(d.decisao, DECISOES.DUVIDA);            ok('dúvida fica para a equipa')
}
{
  const d = decidirDaLeitura({ e_entrada: true, legivel: true, decisao: 'recusado', motivo: '' })
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
    e_entrada: true, legivel: true, decisao: 'valido',
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

console.log('\nLer o QR code')
{
  const { lerQr } = await import('../_lib/qr.js')
  const { readFileSync } = await import('node:fs')

  // O QR é a única identidade fiável: a carteira da 3cket não mostra
  // número de bilhete nenhum.
  const jpeg = new Uint8Array(readFileSync(new URL('./amostras/entrada-3cket.jpg', import.meta.url)))
  const qr = lerQr(jpeg, 'image/jpeg')
  assert.equal(typeof qr, 'string')
  assert.ok(qr.length >= 8);                           ok('lê o QR de um print verdadeiro da 3cket')
  assert.equal(lerQr(jpeg, 'image/jpeg'), qr);         ok('e dá sempre o mesmo — serve de identidade')

  assert.equal(lerQr(new Uint8Array([1, 2, 3]), 'image/jpeg'), null)
  ok('ficheiro estragado devolve nada, não estoira')
  assert.equal(lerQr(jpeg, 'application/pdf'), null);  ok('PDF não se tenta ler')
  assert.equal(lerQr(jpeg, 'image/heic'), null);       ok('HEIC também não')
  assert.equal(lerQr(null, 'image/jpeg'), null);       ok('sem ficheiro, nada')

  /* O outro formato: o passe guardado na Wallet do telemóvel. Fundo
     preto, QR pequeno ao centro. Nada a ver com a carteira da 3cket,
     e o leitor tem de dar conta dos dois. */
  const wallet = new Uint8Array(readFileSync(new URL('./amostras/passe-wallet.jpg', import.meta.url)))
  assert.equal(lerQr(wallet, 'image/jpeg'), 'ensaio-passe-wallet-0001')
  ok('lê o QR de um passe da Wallet, fundo preto e tudo')
  assert.notEqual(lerQr(wallet, 'image/jpeg'), qr)
  ok('e dois passes diferentes dão códigos diferentes')
}

console.log(`\n✅ ${passou} verificações passaram\n`)
