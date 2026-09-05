/* ════════════════════════════════════════════════════════════════
   FOTOS DOS BILHETES

   Ficam num balde privado do Supabase. O browser nunca recebe a
   chave de serviço: o servidor emite um endereço assinado, válido
   por poucos minutos, e o telemóvel envia a foto directamente para
   lá. A foto não passa pelo nosso servidor.

   Para ver uma foto, a organização recebe outro endereço assinado,
   também de curta duração. Sem ele, o balde não se abre a ninguém.
   ════════════════════════════════════════════════════════════════ */

import { baseDeDados } from './aulas.js'

export const BALDE = 'comprovativos'

const TIPOS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
}

export function extensaoDe(tipo) {
  return TIPOS[String(tipo || '').toLowerCase()] || null
}

/* Cria o balde se ainda não existir. Poupa um passo de configuração
   manual, e correr isto vezes sem conta não faz mal nenhum. */
async function garantirBalde(db) {
  const { data } = await db.storage.getBucket(BALDE)
  if (data) return
  await db.storage.createBucket(BALDE, {
    public: false,
    fileSizeLimit: 6 * 1024 * 1024,
    allowedMimeTypes: Object.keys(TIPOS),
  })
}

/* Endereço para o telemóvel enviar a foto. */
export async function enderecoParaEnviar(extensao, env) {
  const db = baseDeDados(env)
  if (!db) return null
  await garantirBalde(db)

  const agora = new Date()
  const pasta = `${agora.getUTCFullYear()}-${String(agora.getUTCMonth() + 1).padStart(2, '0')}`
  const caminho = `${pasta}/${crypto.randomUUID()}.${extensao}`

  const { data, error } = await db.storage.from(BALDE).createSignedUploadUrl(caminho)
  if (error) throw error
  return { caminho, endereco: data.signedUrl }
}

/* Endereço para a organização ver a foto. Dura uma hora. */
export async function enderecoParaVer(caminho, env, segundos = 3600) {
  const db = baseDeDados(env)
  if (!db || !caminho) return null
  const { data, error } = await db.storage.from(BALDE).createSignedUrl(caminho, segundos)
  if (error) return null
  return data.signedUrl
}
