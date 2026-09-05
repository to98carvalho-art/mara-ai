/* ════════════════════════════════════════════════════════════════
   LER O BILHETE

   Sem a API da 3cket, quem se inscreve anexa o bilhete. Em vez de
   alguém da equipa abrir foto a foto, o comprovativo é lido na
   hora e a inscrição fica decidida antes de a pessoa fechar o
   telemóvel.

   Três saídas possíveis:

     valido      é um bilhete do 7WONDERS
     recusado    não é bilhete nenhum, ou é de outro evento, ou
                 não se lê — e dizemos porquê, para se poder
                 anexar outro
     duvida      fica reservado e alguém da equipa vê em /#equipa

   A dúvida é de propósito. Uma máquina que decide sozinha erra
   contra quem pagou bilhete, e isso é pior do que dar trabalho.
   ════════════════════════════════════════════════════════════════ */

import { enderecoParaVer } from './armazenamento.js'

const EVENTO = {
  nome: '7WONDERS',
  data: '12 de Setembro de 2026',
  local: 'Club de Golf de Braga',
  bilheteira: '3cket',
}

/* Barato e chega bem para ler um bilhete. */
const MODELO = 'claude-haiku-4-5-20251001'
const LIMITE_MS = 20_000
const TAMANHO_MAXIMO = 5 * 1024 * 1024

/* A API da Claude lê estes. O HEIC do iPhone não, e a conversão no
   browser nem sempre acontece — esses vão para a equipa. */
const IMAGENS = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])

export const DECISOES = { VALIDO: 'valido', RECUSADO: 'recusado', DUVIDA: 'duvida' }

const duvida = motivo => ({ decisao: DECISOES.DUVIDA, motivo, referencia: null })

const FERRAMENTA = {
  name: 'registar_bilhete',
  description: 'Regista o que se vê no comprovativo anexado.',
  input_schema: {
    type: 'object',
    properties: {
      e_bilhete: {
        type: 'boolean',
        description: 'A imagem é um bilhete, uma reserva ou uma confirmação de compra de um evento?',
      },
      evento: {
        type: 'string',
        description: 'Nome do evento tal como aparece escrito. Vazio se não se ler.',
      },
      referencia: {
        type: 'string',
        description: 'Número do bilhete, da encomenda ou da reserva. Vazio se não houver.',
      },
      nome: {
        type: 'string',
        description: 'Nome da pessoa no bilhete. Vazio se não houver.',
      },
      legivel: {
        type: 'boolean',
        description: 'Consegue ler-se o que está escrito, sem estar desfocado ou cortado?',
      },
      decisao: {
        type: 'string',
        enum: ['valido', 'recusado', 'duvida'],
        description:
          'valido: é claramente um bilhete deste evento. ' +
          'recusado: não é um bilhete, ou é de outro evento, ou não se lê. ' +
          'duvida: parece um bilhete mas não dá para ter a certeza de que é deste evento.',
      },
      motivo: {
        type: 'string',
        description:
          'Uma frase curta em português de Portugal, dirigida a quem anexou, ' +
          'a dizer porquê. Ex.: "Esta foto está desfocada, tenta outra."',
      },
    },
    required: ['e_bilhete', 'legivel', 'decisao', 'motivo'],
  },
}

const INSTRUCOES = `És o controlo de bilhetes do ${EVENTO.nome}, ${EVENTO.data}, no ${EVENTO.local}.
Os bilhetes são vendidos pela ${EVENTO.bilheteira} e as pessoas anexam uma fotografia do ecrã ou o PDF que receberam.

Olha para o que foi anexado e regista o que vês. Ao decidir:

- Aceita se lá estiver escrito o nome do evento (7WONDERS, 7 WONDERS, THE 6TH WONDER)
  ou o local, e se parecer mesmo um bilhete: QR code, referência, data, bilheteira.
- Aceita mesmo que não haja QR code visível ou que a data não apareça — muitos prints
  cortam metade do bilhete.
- Recusa se não for um bilhete de todo (uma selfie, um cartaz, um ecrã em branco,
  um comprovativo de transferência), se for de outro evento, ou se estiver
  demasiado desfocado ou escuro para se ler seja o que for.
- Fica na dúvida quando for mesmo um bilhete de algum evento mas não se perceber
  de qual. Alguém da equipa confirma depois. Não inventes uma certeza que não tens.

O motivo é lido pela pessoa que anexou. Escreve-o em português de Portugal,
numa frase, sem a tratar mal.`

/* Vai buscar o ficheiro ao armazenamento. Vem em base64, que é como
   a API o quer. */
async function buscarFicheiro(caminho, env) {
  const endereco = await enderecoParaVer(caminho, env, 300)
  if (!endereco) return null

  const resposta = await fetch(endereco)
  if (!resposta.ok) return null

  const bytes = new Uint8Array(await resposta.arrayBuffer())
  if (!bytes.length || bytes.length > TAMANHO_MAXIMO) return null

  return {
    tipo: (resposta.headers.get('content-type') || '').split(';')[0].trim().toLowerCase(),
    dados: Buffer.from(bytes).toString('base64'),
  }
}

function blocoDoFicheiro({ tipo, dados }) {
  if (IMAGENS.has(tipo)) {
    return { type: 'image', source: { type: 'base64', media_type: tipo, data: dados } }
  }
  if (tipo === 'application/pdf') {
    return { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: dados } }
  }
  return null
}

/* Traduz a resposta do modelo numa decisão nossa. */
export function decidirDaLeitura(leitura) {
  if (!leitura) return duvida('Não conseguimos ler o comprovativo.')

  const motivo = String(leitura.motivo || '').trim().slice(0, 300)
  const referencia = String(leitura.referencia || '').trim().slice(0, 120) || null

  // Não é bilhete nenhum, ou não se lê: a pessoa consegue resolver
  // isso sozinha, e mais depressa do que nós.
  if (leitura.e_bilhete === false || leitura.legivel === false) {
    return {
      decisao: DECISOES.RECUSADO,
      motivo: motivo || 'Isto não parece um bilhete. Anexa o bilhete do 7WONDERS.',
      referencia,
    }
  }

  if (leitura.decisao === DECISOES.VALIDO) return { decisao: DECISOES.VALIDO, motivo, referencia }
  if (leitura.decisao === DECISOES.RECUSADO) {
    return {
      decisao: DECISOES.RECUSADO,
      motivo: motivo || 'Este bilhete não é deste evento.',
      referencia,
    }
  }
  return { decisao: DECISOES.DUVIDA, motivo, referencia }
}

export function validadorLigado(env = process.env) {
  return Boolean((env.ANTHROPIC_API_KEY || '').trim())
}

/* Lê o comprovativo. Nunca levanta exceção: se alguma coisa correr
   mal, a inscrição fica reservada e a equipa decide. Uma falha
   nossa não pode custar a vaga a quem tem bilhete. */
export async function validarComprovativo(caminho, env = process.env) {
  const chave = (env.ANTHROPIC_API_KEY || '').trim()
  if (!chave) return duvida('Validação automática desligada.')
  if (!caminho) return duvida('Sem comprovativo.')

  let ficheiro
  try {
    ficheiro = await buscarFicheiro(caminho, env)
  } catch {
    return duvida('Não conseguimos abrir o comprovativo.')
  }
  if (!ficheiro) return duvida('Não conseguimos abrir o comprovativo.')

  const bloco = blocoDoFicheiro(ficheiro)
  if (!bloco) return duvida(`Formato que não sabemos ler (${ficheiro.tipo || 'desconhecido'}).`)

  const corte = AbortSignal.timeout ? AbortSignal.timeout(LIMITE_MS) : undefined

  let resposta
  try {
    resposta = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: corte,
      headers: {
        'content-type': 'application/json',
        'x-api-key': chave,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: env.ANTHROPIC_MODEL || MODELO,
        max_tokens: 600,
        system: INSTRUCOES,
        tools: [FERRAMENTA],
        tool_choice: { type: 'tool', name: FERRAMENTA.name },
        messages: [{
          role: 'user',
          content: [bloco, { type: 'text', text: 'Este é o comprovativo anexado. Regista o que vês.' }],
        }],
      }),
    })
  } catch {
    return duvida('A leitura automática não respondeu.')
  }

  if (!resposta.ok) return duvida(`A leitura automática recusou o pedido (${resposta.status}).`)

  let dados
  try { dados = await resposta.json() } catch { return duvida('Resposta ilegível da leitura automática.') }

  const uso = (dados?.content || []).find(b => b.type === 'tool_use')
  return decidirDaLeitura(uso?.input)
}
