/* POST /api/aulas/inscrever
   { aulaId, nome, telefone, email, comprovativo, impressao }

   Sem a API da 3cket, a prova de bilhete é o ficheiro que a pessoa
   anexa. A vaga é reservada primeiro e o bilhete é lido logo a
   seguir — por esta ordem, senão os segundos da leitura seriam
   tempo em que outra pessoa podia levar o último lugar.

   O bilhete é da pessoa, não da aula: lê-se uma vez, e as aulas
   seguintes herdam a decisão.

   → 200 { ok, estado, token }      inscrito (valido ou por validar)
   → 409 já inscrito / sem vagas
   → 422 o bilhete não passou — a vaga volta a ficar livre
   → 503 base de dados em baixo                                      */

import {
  inscrever, minhasInscricoes, bilheteDaConta, validarConta,
  contasComOMesmoBilhete, marcarAvisado, ErroDeAula, ERROS_AULA,
} from '../_lib/aulas.js'
import { validarComprovativo, DECISOES } from '../_lib/validador.js'
import { enviarPasse, emailPlausivel, normalizarEmail } from '../_lib/correio.js'
import { readSession, signSession } from '../_lib/session.js'
import { normalisePhone, isPlausiblePhone } from '../_lib/3cket.js'
import { readJsonBody, send, onlyPost, rateLimit, clientIp } from '../_lib/http.js'

/* Ler o bilhete leva alguns segundos. Sem isto a Vercel corta o
   pedido a meio e a pessoa fica sem resposta. */
export const config = { maxDuration: 30 }

const RECUSA_POR_OMISSAO = 'Não conseguimos confirmar este bilhete. Anexa outro.'

export default async function handler(req, res) {
  if (onlyPost(req, res)) return

  const corpo = readJsonBody(req)
  const { aulaId, comprovativo, impressao } = corpo
  if (!aulaId) return send(res, 400, { error: 'AULA_DESCONHECIDA' })

  // Quem já entrou neste dispositivo não volta a escrever tudo.
  const ficha = readSession((req.headers.authorization || '').replace(/^Bearer /, ''))

  const telefone = ficha?.phone || normalisePhone(corpo.telefone || '')
  if (!isPlausiblePhone(telefone)) return send(res, 400, { error: 'TELEFONE_INVALIDO' })

  const nome = String(corpo.nome || ficha?.nome || '').trim()
  if (!nome || nome.length > 80) return send(res, 400, { error: 'NOME_EM_FALTA' })

  const guarda = rateLimit(`inscrever:${clientIp(req)}`, { max: 30, windowMs: 30 * 60_000 })
  if (!guarda.allowed) return send(res, 429, { error: 'TOO_MANY_REQUESTS' })

  try {
    // O que já se sabe do bilhete desta pessoa. Quem tem ficha
    // assinada já entregou um comprovativo antes; só volta a entregar
    // se aquele tiver sido recusado.
    const bilhete = await bilheteDaConta(telefone)
    const jaValido = bilhete?.estado === 'valido'
    const precisaDeProva = bilhete ? bilhete.estado === 'recusado' : !ficha

    if (precisaDeProva && !comprovativo) return send(res, 400, { error: 'COMPROVATIVO_EM_FALTA' })

    const email = normalizarEmail(corpo.email || ficha?.email || bilhete?.email || '')
    if (precisaDeProva && !emailPlausivel(email)) return send(res, 400, { error: 'EMAIL_INVALIDO' })

    // Ficamos com o estado que a conta já tinha. Uma leitura nova
    // só acontece quando há um comprovativo novo para ler.
    const estadoHerdado = jaValido ? 'valido' : 'por_validar'
    await inscrever(aulaId, telefone, telefone, {
      nome, comprovativo, impressao, email, estado: estadoHerdado,
    })

    let estado = estadoHerdado
    let motivo = ''

    if (precisaDeProva) {
      const leitura = await validarComprovativo(comprovativo)
      motivo = leitura.motivo || ''

      // O mesmo bilhete em duas inscrições pode ser batota, ou pode
      // ser um grupo que comprou tudo junto. Não decidimos isso
      // sozinhos: passa à equipa.
      let repetido = 0
      if (leitura.decisao === DECISOES.VALIDO) {
        repetido = await contasComOMesmoBilhete(
          { referencia: leitura.referencia, impressao }, telefone,
        )
      }

      estado =
        repetido > 0 ? 'por_validar'
        : leitura.decisao === DECISOES.VALIDO ? 'valido'
        : leitura.decisao === DECISOES.RECUSADO ? 'recusado'
        : 'por_validar'

      if (repetido > 0) motivo = 'Este bilhete já apareceu noutra inscrição.'

      await validarConta(telefone, estado, {
        nota: motivo, referencia: leitura.referencia, automatico: true,
      })

      if (estado === 'recusado') {
        // A vaga já voltou a ficar livre: a contagem não conta
        // inscrições recusadas.
        return send(res, 422, { error: 'BILHETE_RECUSADO', motivo: motivo || RECUSA_POR_OMISSAO })
      }
    }

    const utilizador = { accountId: telefone, phone: telefone, nome, email }
    const resposta = {
      ok: true,
      estado,
      motivo,
      token: signSession(utilizador),
      user: utilizador,
    }

    if (estado === 'valido' && email) {
      const aulas = await minhasInscricoes(telefone)
      const envio = await enviarPasse({ nome, email, aulas })
      resposta.passeEnviado = envio.enviado
      if (envio.enviado) await marcarAvisado(telefone).catch(() => {})
    }

    return send(res, 200, resposta)
  } catch (erro) {
    if (erro instanceof ErroDeAula) {
      const estado =
        [ERROS_AULA.JA_INSCRITO, ERROS_AULA.SEM_VAGAS].includes(erro.codigo) ? 409
        : erro.codigo === ERROS_AULA.INDISPONIVEL ? 503
        : 400
      return send(res, estado, { error: erro.codigo })
    }
    return send(res, 503, { error: ERROS_AULA.INDISPONIVEL })
  }
}
