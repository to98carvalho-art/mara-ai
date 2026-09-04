/* GET /api/estado
   Diz o que está configurado neste servidor — sem nunca revelar
   valores. Serve para perceber, de fora, porque é que algo não
   funciona, em vez de adivinhar.

   Só diz "existe" ou "não existe". Nem sequer o tamanho, para não
   dar pistas sobre as chaves.                                      */

import { baseDeDados } from './_lib/aulas.js'
import { send } from './_lib/http.js'

/* O Supabase tem dois formatos de chave a conviver:
     sb_secret_…      / sb_publishable_…   (o novo)
     eyJ….….…         (o antigo, um JWT)
   Só as secretas servem aqui. Dizer qual delas lá está poupa meia
   hora a quem estiver a configurar. */
function qualChave(valor) {
  const chave = (valor || '').trim()
  if (!chave) return 'nenhuma'
  if (chave.startsWith('sb_secret_')) return 'secreta (formato novo) ✓'
  if (chave.startsWith('sb_publishable_')) return '⚠️ é a PÚBLICA — precisas da secreta'
  if (chave.startsWith('eyJ') && chave.split('.').length === 3) return 'formato antigo (JWT) — pode servir'
  if (chave.startsWith('eyJ')) return '⚠️ formato antigo, mas incompleta'
  return '⚠️ não parece uma chave do Supabase'
}

export default async function handler(req, res) {
  const existe = nome => Boolean(process.env[nome])

  /* O endereço do projeto Supabase não é segredo — vai dentro de
     qualquer app que use Supabase. Mostrá-lo aqui poupa horas quando
     é ele que está mal escrito. As chaves, essas, nunca aparecem. */
  const url = (process.env.SUPABASE_URL || '').trim()
  const urlCru = process.env.SUPABASE_URL || ''
  const enderecoBaseDeDados = {
    valor: url,
    comEspacosOuQuebras: urlCru !== url,
    comecaPorHttps: url.startsWith('https://'),
    acabaEmSupabaseCo: url.trim().endsWith('.supabase.co'),
    comBarraNoFim: url.trim().endsWith('/'),
  }

  const configuracao = {
    SUPABASE_URL:              existe('SUPABASE_URL'),
    SUPABASE_SERVICE_ROLE_KEY: existe('SUPABASE_SERVICE_ROLE_KEY'),
    SESSION_SECRET:            existe('SESSION_SECRET'),
    chaveQueLaEsta: qualChave(process.env.SUPABASE_SERVICE_ROLE_KEY),
    THREECKET_SECRET_KEY:      existe('THREECKET_SECRET_KEY'),
  }

  // Ter as chaves não chega: é preciso que a base de dados responda
  // e que as tabelas lá estejam.
  let baseDeDadosResponde = null
  let aulasNaBaseDeDados = null
  let avaria = null

  const db = baseDeDados()
  if (db) {
    try {
      const { data, error } = await db.from('aulas').select('id')
      if (error) throw error
      baseDeDadosResponde = true
      aulasNaBaseDeDados = data?.length ?? 0
    } catch (erro) {
      baseDeDadosResponde = false
      avaria = String(erro?.message || erro).slice(0, 200)
    }
  }

  const pronto =
    configuracao.SUPABASE_URL &&
    configuracao.SUPABASE_SERVICE_ROLE_KEY &&
    configuracao.SESSION_SECRET &&
    baseDeDadosResponde === true &&
    aulasNaBaseDeDados > 0

  return send(res, 200, {
    pronto,
    configuracao,
    enderecoBaseDeDados,
    baseDeDadosResponde,
    aulasNaBaseDeDados,
    avaria,
    bilheteiraReal: configuracao.THREECKET_SECRET_KEY,
    versao: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) || 'local',
  })
}
