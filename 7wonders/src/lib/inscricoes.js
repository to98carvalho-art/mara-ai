/* ════════════════════════════════════════════════════════════════
   INSCRIÇÕES E VAGAS

   Cada aula tem dois bolsos de lugares:
     convite — reservados para convidados, já contados de início
     bilhete — abertos a quem tem bilhete

   Quem usa a app nunca vê esta divisão: só lê "APENAS N VAGAS
   LIVRES", que é a soma do que sobra dos dois.

   ⚠️ Hoje isto vive no dispositivo de cada pessoa. Para o dia do
   evento tem de passar para a base de dados partilhada, senão dois
   telemóveis podem ficar ambos com a última vaga. A interface aqui
   já é assíncrona precisamente para essa troca não mexer nos ecrãs.
   ════════════════════════════════════════════════════════════════ */

import { AULAS } from '../content/evento'

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

function ler() {
  try { return JSON.parse(guardado.getItem(CHAVE)) || {} } catch { return {} }
}

function escrever(estado) {
  guardado.setItem(CHAVE, JSON.stringify(estado))
  return estado
}

const porId = new Map(AULAS.map(a => [a.id, a]))

/* Lugares já ocupados numa aula, incluindo os que já vinham
   ocupados antes de a app abrir. */
function ocupadosEm(aula, minhas) {
  const base = aula.jaOcupado || { convite: 0, bilhete: 0 }
  const minha = minhas[aula.id]
  return {
    convite: base.convite + (minha?.bolso === 'convite' ? 1 : 0),
    bilhete: base.bilhete + (minha?.bolso === 'bilhete' ? 1 : 0),
  }
}

/* O que a interface precisa de saber sobre uma aula. */
export function estadoDaAula(aula, minhas = ler()) {
  const inscrito = Boolean(minhas[aula.id])

  if (aula.soInformacao || !aula.capacidade) {
    return { inscrito: false, temInscricao: false, livres: null, esgotado: false }
  }

  const ocupados = ocupadosEm(aula, minhas)
  const livres =
    Math.max(0, aula.capacidade.convite - ocupados.convite) +
    Math.max(0, aula.capacidade.bilhete - ocupados.bilhete)

  return {
    inscrito,
    temInscricao: true,
    livres,
    esgotado: livres === 0 && !inscrito,
    total: aula.capacidade.convite + aula.capacidade.bilhete,
  }
}

export function todasAsAulas() {
  const minhas = ler()
  return AULAS.map(aula => ({ ...aula, ...estadoDaAula(aula, minhas) }))
}

export function quantasInscricoes() {
  return Object.keys(ler()).length
}

export async function inscrever(aulaId) {
  const aula = porId.get(aulaId)
  if (!aula?.capacidade) return null

  const minhas = ler()
  if (minhas[aulaId]) return minhas[aulaId]

  const ocupados = ocupadosEm(aula, minhas)
  // Primeiro bolso com espaço. Os lugares de convite estão sempre
  // esgotados à partida nas aulas que os têm, por isso na prática
  // quem se inscreve pela app fica sempre no bolso "bilhete".
  const bolso =
    aula.capacidade.convite - ocupados.convite > 0 ? 'convite'
    : aula.capacidade.bilhete - ocupados.bilhete > 0 ? 'bilhete'
    : null

  if (!bolso) return null                       // esgotou entretanto

  minhas[aulaId] = { bolso, quando: new Date().toISOString() }
  escrever(minhas)
  return minhas[aulaId]
}

export async function anular(aulaId) {
  const minhas = ler()
  delete minhas[aulaId]
  escrever(minhas)
}

export function limpar() {
  guardado.removeItem(CHAVE)
}
