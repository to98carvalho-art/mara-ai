/* Põe as aulas na base de dados a partir de src/content/evento.js,
   que continua a ser a única fonte do programa do evento.

   Correr sempre que o programa mudar:
     node scripts/semear-aulas.mjs

   Precisa de SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente.
*/
import { createClient } from '@supabase/supabase-js'
import { AULAS } from '../src/content/evento.js'

const url = process.env.SUPABASE_URL
const chave = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !chave) {
  console.error('Faltam SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.')
  process.exit(1)
}

const db = createClient(url, chave, { auth: { persistSession: false } })

const linhas = AULAS.map(a => ({
  id: a.id,
  nome: a.nome,
  capacidade_convite: a.capacidade?.convite ?? 0,
  capacidade_bilhete: a.capacidade?.bilhete ?? 0,
  ocupado_convite:    a.jaOcupado?.convite ?? 0,
  atualizado_em:      new Date().toISOString(),
}))

const { error } = await db.from('aulas').upsert(linhas, { onConflict: 'id' })
if (error) {
  console.error('Falhou:', error.message)
  process.exit(1)
}

for (const l of linhas) {
  const total = l.capacidade_convite + l.capacidade_bilhete
  console.log(`  ✓ ${l.nome.padEnd(26)} ${total === 0 ? 'sem inscrição' : `${total} lugares (${l.ocupado_convite} já dados)`}`)
}
console.log(`\n${linhas.length} aulas na base de dados.`)
