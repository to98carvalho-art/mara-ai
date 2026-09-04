/* Candidatura ao after party.
   Só damos a candidatura por enviada depois de o servidor a guardar.
   Uma confirmação falsa perderia gente a sério. */

export const ERROS_AFTER = {
  CAMPO_EM_FALTA:    'Falta preencher este campo.',
  CAMPO_LONGO:       'Isto vai longo demais — encurta um bocado.',
  EMAIL_INVALIDO:    'Esse email não parece estar certo.',
  TELEFONE_INVALIDO: 'Esse número não parece estar certo.',
  RAZOES_CURTAS:     'Escreve as tuas três razões — vale a pena.',
  TOO_MANY_REQUESTS: 'Demasiadas tentativas. Espera um bocado.',
  INDISPONIVEL:      'Não conseguimos registar a tua candidatura. Tenta daqui a pouco.',
  SEM_REDE:          'Sem ligação. Verifica a internet e tenta outra vez.',
}

export class ErroAfter extends Error {
  constructor(codigo, campo = null) {
    super(codigo)
    this.codigo = codigo
    this.campo = campo
    this.mensagem = ERROS_AFTER[codigo] || ERROS_AFTER.INDISPONIVEL
  }
}

export async function candidatar(dados) {
  let resposta
  try {
    resposta = await fetch('/api/after', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dados),
    })
  } catch {
    throw new ErroAfter('SEM_REDE')
  }

  let corpo = null
  try { corpo = await resposta.json() } catch { /* vazio */ }

  if (!resposta.ok) throw new ErroAfter(corpo?.error || 'INDISPONIVEL', corpo?.campo || null)
  return true
}
