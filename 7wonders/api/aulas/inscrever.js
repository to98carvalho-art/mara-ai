/* POST /api/aulas/inscrever
   { aulaId, nome, telefone, email, comprovativo, impressao }

   Sem a API da 3cket, a prova de entrada é o ficheiro que a pessoa
   anexa — o bilhete que comprou ou o convite que recebeu, valem os
   dois. A vaga é reservada primeiro e a entrada é lida logo a
   seguir — por esta ordem, senão os segundos da leitura seriam
   tempo em que outra pessoa podia levar o último lugar.

   Quem decide é o QR code: existe, é único por entrada, e não muda
   com o nome do lote. A entrada é da pessoa, não da aula — lê-se uma
   vez, e as aulas seguintes herdam a decisão.

   → 200 { ok, estado, token }      inscrito (valido ou por validar)
   → 409 já inscrito / sem vagas
   → 422 a entrada não passou — a vaga volta a ficar livre
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

const RECUSA_POR_OMISSAO = 'Não conseguimos confirmar esta entrada. Anexa outra.'

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

      /* Quem decide é o QR.

         Há convites VIP, convites normais, bilhetes normais e
         bilhetes VIP, e o nome muda conforme o lote. Decidir pelo
         nome era decidir por uma coisa que a organização muda quando
         quer — e barrar quem tem entrada por ela se chamar outra
         coisa. O QR não muda: existe, é único, e chega.

         Sem QR legível (um PDF, um HEIC, uma foto tremida) volta a
         valer a leitura do documento. */
      if (leitura.qr) {
        // Uma entrada é de uma pessoa. O mesmo QR noutro telemóvel é
        // a mesma entrada a servir duas vezes, e isso não passa.
        const jaUsado = await contasComOMesmoBilhete({ referencia: leitura.qr }, telefone)

        estado = jaUsado ? 'recusado' : 'valido'
        if (jaUsado) {
          motivo = `Este ${leitura.entrada} já está registado noutro número de telemóvel. `
            + 'Cada entrada dá direito a uma inscrição. Fala connosco se achas que é engano.'
        }
      } else {
        estado =
          leitura.decisao === DECISOES.VALIDO ? 'valido'
          : leitura.decisao === DECISOES.RECUSADO ? 'recusado'
          : 'por_validar'

        // Sem QR, o mesmo ficheiro em duas inscrições não é decidido
        // por nós: um PDF com os bilhetes de um grupo é normal, e
        // recusar por engano custa mais do que verificar à mão.
        if (estado === 'valido' && await contasComOMesmoBilhete({ impressao }, telefone)) {
          estado = 'por_validar'
          motivo = 'Este ficheiro já apareceu noutra inscrição.'
        }
      }

      // A nota vai para a página da equipa: o que a leitura viu, e se
      // foi o QR a decidir. Poupa-lhes abrir a foto.
      await validarConta(telefone, estado, {
        nota: [leitura.entrada, leitura.qr ? 'QR lido' : 'sem QR', motivo]
          .filter(Boolean).join(' — ').slice(0, 400),
        referencia: leitura.qr || leitura.referencia,
        automatico: true,
      })

      if (estado === 'recusado') {
        // A vaga já voltou a ficar livre: a contagem não conta
        // inscrições recusadas.
        return send(res, 422, { error: 'ENTRADA_RECUSADA', motivo: motivo || RECUSA_POR_OMISSAO })
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
