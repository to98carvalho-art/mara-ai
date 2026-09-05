/* ════════════════════════════════════════════════════════════════
   QUEM ESTÁ A USAR A APP

   Não há registo nem palavra-passe. A pessoa identifica-se na
   primeira inscrição — nome, telemóvel e comprovativo do bilhete —
   e o servidor devolve uma ficha assinada.

   A ficha serve para o mesmo telemóvel cancelar e ver as suas aulas
   sem voltar a escrever tudo. Vive só neste dispositivo.
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

export function guardarSessao(token, utilizador) {
  guardado.setItem(CHAVE, JSON.stringify({ token, utilizador }))
}

export function utilizadorAtual() {
  try {
    const cru = guardado.getItem(CHAVE)
    if (!cru) return null
    return JSON.parse(cru).utilizador || null
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
