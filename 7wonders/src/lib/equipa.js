/* A área da organização. Vive fora das seis vistas do evento: chega-se
   lá por /#equipa, e é preciso a palavra-passe da equipa. */

const CHAVE = '7wonders.equipa.v1'

const guardado = (() => {
  try {
    localStorage.setItem('__7we', '1'); localStorage.removeItem('__7we')
    return localStorage
  } catch {
    const m = new Map()
    return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, v), removeItem: k => m.delete(k) }
  }
})()

export const fichaDaEquipa = () => guardado.getItem(CHAVE)
export const sairDaEquipa = () => guardado.removeItem(CHAVE)

export const ERROS_EQUIPA = {
  PALAVRA_ERRADA:    'Palavra-passe errada.',
  SEM_PALAVRA_PASSE: 'Ainda não foi definida uma palavra-passe para a equipa.',
  SESSAO_INVALIDA:   'A sessão expirou. Volta a entrar.',
  TOO_MANY_REQUESTS: 'Demasiadas tentativas. Espera um bocado.',
  INDISPONIVEL:      'Não conseguimos falar com o servidor. Tenta daqui a pouco.',
}

class ErroEquipa extends Error {
  constructor(codigo) {
    super(codigo)
    this.codigo = codigo
    this.mensagem = ERROS_EQUIPA[codigo] || ERROS_EQUIPA.INDISPONIVEL
  }
}

async function chamar(caminho, corpo = {}) {
  const ficha = fichaDaEquipa()
  let resposta
  try {
    resposta = await fetch(caminho, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(ficha ? { Authorization: `Bearer ${ficha}` } : {}) },
      body: JSON.stringify(corpo),
    })
  } catch {
    throw new ErroEquipa('INDISPONIVEL')
  }
  let dados = null
  try { dados = await resposta.json() } catch { /* vazio */ }
  if (!resposta.ok) throw new ErroEquipa(dados?.error || 'INDISPONIVEL')
  return dados
}

export async function entrarNaEquipa(palavra) {
  const { token } = await chamar('/api/organizacao/entrar', { palavra })
  guardado.setItem(CHAVE, token)
  return token
}

export const listarInscricoes = estado => chamar('/api/organizacao/inscricoes', { estado })
export const decidir = (id, estado, nota) => chamar('/api/organizacao/decidir', { id, estado, nota })
