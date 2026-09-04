/* ════════════════════════════════════════════════════════════════
   ENTRAR NO 7WONDERS

   Não há registo nem palavra-passe. A pessoa escreve o telemóvel,
   a 3cket manda um PIN por SMS, e o servidor confirma que aquele
   número tem mesmo bilhete para o evento.

   Este ficheiro fala só com o nosso servidor. A chave da 3cket
   nunca passa por aqui.
   ════════════════════════════════════════════════════════════════ */

const CHAVE = '7wonders.sessao.v1'

/* localStorage falha em navegação privada e dentro de alguns
   enquadramentos — nesses casos a sessão dura só a visita. */
const guardado = (() => {
  try {
    localStorage.setItem('__7w', '1')
    localStorage.removeItem('__7w')
    return localStorage
  } catch {
    const memoria = new Map()
    return {
      getItem: k => memoria.get(k) ?? null,
      setItem: (k, v) => memoria.set(k, v),
      removeItem: k => memoria.delete(k),
    }
  }
})()

export const ERROS = {
  PHONE_INVALID:          'Esse número não parece estar certo. Confirma e tenta outra vez.',
  PIN_ALREADY_SENT:       'Já te enviámos um código. Vê as mensagens — chega em segundos.',
  PIN_WRONG:              'Código errado. Confere as mensagens e tenta de novo.',
  PIN_NOT_REQUESTED:      'Esse código já expirou. Pede um novo.',
  ACCOUNT_NOT_REGISTERED: 'Não encontrámos bilhete associado a este número.',
  NO_TICKET:              'Este número não tem bilhete para o 7WONDERS.',
  TICKETING_UNAVAILABLE:  'Não conseguimos falar com a bilheteira. Tenta daqui a pouco.',
  TOO_MANY_REQUESTS:      'Demasiadas tentativas. Espera um bocado antes de tentar de novo.',
  SEM_REDE:               'Sem ligação. Verifica a internet e tenta outra vez.',
}

export class ErroDeEntrada extends Error {
  constructor(codigo, detalhes = {}) {
    super(codigo)
    this.codigo = codigo
    this.detalhes = detalhes
    this.mensagem = ERROS[codigo] || ERROS.TICKETING_UNAVAILABLE
  }
}

async function pedir(caminho, corpo) {
  let resposta
  try {
    resposta = await fetch(caminho, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
    })
  } catch {
    throw new ErroDeEntrada('SEM_REDE')
  }

  let dados = null
  try { dados = await resposta.json() } catch { /* resposta vazia */ }

  if (!resposta.ok) {
    throw new ErroDeEntrada(dados?.error || 'TICKETING_UNAVAILABLE', dados || {})
  }
  return dados
}

/* Passo 1 — a 3cket envia o PIN por SMS. */
export async function pedirCodigo(telefone) {
  return pedir('/api/auth/request-pin', { phone: telefone })
}

/* Passo 2 — valida o PIN e confirma o bilhete. Guarda a sessão. */
export async function validarCodigo(telefone, codigo) {
  const dados = await pedir('/api/auth/verify-pin', { phone: telefone, pin: codigo })
  guardado.setItem(CHAVE, JSON.stringify({ token: dados.token, utilizador: dados.user }))
  return dados.user
}

export function utilizadorAtual() {
  try {
    const cru = guardado.getItem(CHAVE)
    if (!cru) return null
    const { utilizador } = JSON.parse(cru)
    return utilizador || null
  } catch {
    return null
  }
}

export function fichaDeSessao() {
  try {
    const cru = guardado.getItem(CHAVE)
    return cru ? JSON.parse(cru).token : null
  } catch {
    return null
  }
}

export function sair() {
  guardado.removeItem(CHAVE)
}
