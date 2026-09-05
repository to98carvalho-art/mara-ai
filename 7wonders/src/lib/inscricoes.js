/* ════════════════════════════════════════════════════════════════
   INSCRIÇÕES E VAGAS — visto do lado do browser.

   Duas maneiras de guardar, com a mesma interface:

     servidor — base de dados partilhada. A contagem é a mesma para
                toda a gente e a última vaga só é de uma pessoa.
     local    — só este dispositivo. Serve para desenvolver e para o
                site não morrer se a base de dados falhar.

   O servidor é quem diz em que modo estamos, logo no primeiro
   carregamento. Os ecrãs não sabem nem precisam de saber.
   ════════════════════════════════════════════════════════════════ */

import { AULAS } from '../content/evento'
import { fichaDeSessao, guardarSessao } from './sessao'

const CHAVE = '7wonders.inscricoes.v1'

const guardado = (() => {
  try {
    localStorage.setItem('__7wi', '1')
    localStorage.removeItem('__7wi')
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

const lerLocal = () => {
  try { return JSON.parse(guardado.getItem(CHAVE)) || {} } catch { return {} }
}
const escreverLocal = estado => guardado.setItem(CHAVE, JSON.stringify(estado))

export const ERROS_INSCRICAO = {
  SEM_VAGAS:              'Esta aula já não tem vagas.',
  JA_INSCRITO:            'Já estás inscrito nesta aula.',
  NAO_INSCRITO:           'Não estás inscrito nesta aula.',
  SESSAO_INVALIDA:        'A tua sessão expirou. Preenche outra vez os teus dados.',
  TELEFONE_INVALIDO:      'Esse número não parece estar certo.',
  NOME_EM_FALTA:          'Falta o teu nome.',
  EMAIL_INVALIDO:         'Esse email não parece estar certo.',
  COMPROVATIVO_EM_FALTA:  'Falta anexar o bilhete.',
  BILHETE_RECUSADO:       'Não conseguimos confirmar este bilhete.',
  TOO_MANY_REQUESTS:      'Demasiadas tentativas. Espera um bocado.',
  INDISPONIVEL:           'Não conseguimos guardar a inscrição. Tenta daqui a pouco.',
}

export class ErroDeInscricao extends Error {
  /* O servidor manda um motivo escrito quando o bilhete não passa —
     "esta foto está desfocada" ajuda mais do que "não deu". */
  constructor(codigo, motivo) {
    super(codigo)
    this.codigo = codigo
    this.motivo = motivo || ''
    this.mensagem = motivo || ERROS_INSCRICAO[codigo] || ERROS_INSCRICAO.INDISPONIVEL
  }
}

async function chamar(caminho, corpo = {}) {
  const ficha = fichaDeSessao()
  const resposta = await fetch(caminho, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(ficha ? { Authorization: `Bearer ${ficha}` } : {}),
    },
    body: JSON.stringify(corpo),
  })
  let dados = null
  try { dados = await resposta.json() } catch { /* vazio */ }
  if (!resposta.ok) throw new ErroDeInscricao(dados?.error || 'INDISPONIVEL', dados?.motivo)
  return dados
}

/* ── estado ── */

let modo = 'local'
let vagasDoServidor = null      // { aulaId: { lugares, ocupados, livres } }
let minhasDoServidor = []

/* Lê o estado atual. Deve ser chamado no arranque e depois de cada
   inscrição ou anulação. */
export async function carregar() {
  try {
    const resposta = await chamar('/api/aulas')
    modo = resposta.modo
    vagasDoServidor = resposta.vagas || null
    minhasDoServidor = resposta.minhas || []
  } catch {
    modo = 'local'                // sem rede: o horário abre na mesma
  }
  return listar()
}

export function estaEmModoServidor() {
  return modo === 'servidor'
}

/* Junta a cada aula o que a interface precisa de saber. */
export function listar() {
  const locais = lerLocal()

  return AULAS.map(aula => {
    if (aula.soInformacao || (!aula.capacidade && !aula.semLimite)) {
      return { ...aula, inscrito: false, temInscricao: false, livres: null, esgotado: false }
    }

    // Aulas sem limite: há inscrição, mas nunca esgotam.
    if (aula.semLimite) {
      const inscrito = modo === 'servidor'
        ? minhasDoServidor.includes(aula.id)
        : Boolean(locais[aula.id])
      return { ...aula, inscrito, temInscricao: true, livres: null, esgotado: false }
    }

    if (modo === 'servidor' && vagasDoServidor?.[aula.id]) {
      const v = vagasDoServidor[aula.id]
      const inscrito = minhasDoServidor.includes(aula.id)
      return {
        ...aula,
        inscrito,
        temInscricao: true,
        livres: v.livres,
        total: v.lugares,
        esgotado: v.livres === 0 && !inscrito,
      }
    }

    // modo local
    const inscrito = Boolean(locais[aula.id])
    const base = aula.jaOcupado || { convite: 0, bilhete: 0 }
    const usados = {
      convite: base.convite + (locais[aula.id]?.bolso === 'convite' ? 1 : 0),
      bilhete: base.bilhete + (locais[aula.id]?.bolso === 'bilhete' ? 1 : 0),
    }
    const livres =
      Math.max(0, aula.capacidade.convite - usados.convite) +
      Math.max(0, aula.capacidade.bilhete - usados.bilhete)

    return {
      ...aula,
      inscrito,
      temInscricao: true,
      livres,
      total: aula.capacidade.convite + aula.capacidade.bilhete,
      esgotado: livres === 0 && !inscrito,
    }
  })
}

export function quantasInscricoes() {
  return listar().filter(a => a.inscrito).length
}

/* ── ações ── */

/* dados: { nome, telefone, email, comprovativo, impressao }
   Só são precisos na primeira inscrição — depois a ficha chega.

   Devolve { aulas, resultado }. O resultado diz o que aconteceu ao
   bilhete: confirmado na hora, ou à espera de alguém o ver. */
export async function inscrever(aulaId, dados = {}) {
  if (modo === 'servidor') {
    const resposta = await chamar('/api/aulas/inscrever', { aulaId, ...dados })
    if (resposta?.token) guardarSessao(resposta.token, resposta.user)
    return {
      aulas: await carregar(),
      resultado: {
        estado: resposta?.estado || 'por_validar',
        motivo: resposta?.motivo || '',
        passeEnviado: Boolean(resposta?.passeEnviado),
        email: resposta?.user?.email || dados.email || '',
      },
    }
  }

  const aula = AULAS.find(a => a.id === aulaId)
  if (!aula || (!aula.capacidade && !aula.semLimite)) throw new ErroDeInscricao('INDISPONIVEL')

  const locais = lerLocal()
  if (locais[aulaId]) throw new ErroDeInscricao('JA_INSCRITO')

  guardarLocalmenteQuemSou(dados)

  if (aula.semLimite) {
    locais[aulaId] = { bolso: 'bilhete', quando: new Date().toISOString() }
    escreverLocal(locais)
    return { aulas: listar(), resultado: RESULTADO_LOCAL }
  }

  const base = aula.jaOcupado || { convite: 0, bilhete: 0 }
  const bolso =
    aula.capacidade.convite - base.convite > 0 ? 'convite'
    : aula.capacidade.bilhete - base.bilhete > 0 ? 'bilhete'
    : null
  if (!bolso) throw new ErroDeInscricao('SEM_VAGAS')

  locais[aulaId] = { bolso, quando: new Date().toISOString() }
  escreverLocal(locais)
  return { aulas: listar(), resultado: RESULTADO_LOCAL }
}

/* Sem servidor não há bilhete para ler; damos por confirmado para o
   ecrã se comportar como em produção. */
const RESULTADO_LOCAL = { estado: 'valido', motivo: '', passeEnviado: false, email: '' }

export async function anular(aulaId) {
  if (modo === 'servidor') {
    await chamar('/api/aulas/anular', { aulaId })
    return carregar()
  }
  const locais = lerLocal()
  delete locais[aulaId]
  escreverLocal(locais)
  return listar()
}

/* Em modo local não há servidor que assine uma ficha. Guardamos na
   mesma quem se identificou, para o ecrã se comportar como em
   produção: só se pedem os dados na primeira inscrição. */
function guardarLocalmenteQuemSou(dados) {
  if (!dados?.telefone) return
  guardarSessao('local', {
    accountId: dados.telefone,
    phone: dados.telefone,
    nome: dados.nome || '',
    email: dados.email || '',
  })
}

export function limpar() {
  guardado.removeItem(CHAVE)
}
