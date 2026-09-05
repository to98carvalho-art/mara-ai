/* POST /api/comprovativo/preparar   { tipo: "image/jpeg" }
   → 200 { caminho, endereco }   endereço assinado para enviar a foto

   O telemóvel envia a foto directamente para o armazenamento. Não
   passa por aqui: poupa tempo e não gasta a memória do servidor.    */

import { enderecoParaEnviar, extensaoDe } from '../_lib/armazenamento.js'
import { readJsonBody, send, onlyPost, rateLimit, clientIp } from '../_lib/http.js'

export default async function handler(req, res) {
  if (onlyPost(req, res)) return

  const guarda = rateLimit(`foto:${clientIp(req)}`, { max: 20, windowMs: 30 * 60_000 })
  if (!guarda.allowed) return send(res, 429, { error: 'TOO_MANY_REQUESTS' })

  const extensao = extensaoDe(readJsonBody(req).tipo)
  if (!extensao) return send(res, 400, { error: 'FORMATO_NAO_ACEITE' })

  try {
    const preparado = await enderecoParaEnviar(extensao)
    if (!preparado) return send(res, 503, { error: 'INDISPONIVEL' })
    return send(res, 200, preparado)
  } catch {
    return send(res, 503, { error: 'INDISPONIVEL' })
  }
}
