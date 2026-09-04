/* Põe as aulas na base de dados a partir de src/content/evento.js,
   que continua a ser a única fonte do programa do evento.

   Correr sempre que o programa mudar:
     node scripts/semear-aulas.mjs

   Precisa de SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no ambiente.
*/
import { createClient } from '@supabase/supabase-js'
import { AULAS } from '../src/content/evento.js'

/* Duas maneiras de usar:

     node scripts/semear-aulas.mjs          escreve na base de dados
                                            (precisa das chaves no ambiente)

     node scripts/semear-aulas.mjs --sql    escreve o SQL no ecrã, para
                                            colar no SQL Editor do Supabase
                                            sem andar com chaves à mão
*/
const soSql = process.argv.includes('--sql')

const url = process.env.SUPABASE_URL
const chave = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!soSql && (!url || !chave)) {
  console.error('Faltam SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.')
  console.error('Ou usa --sql para obter o SQL a colar no Supabase.')
  process.exit(1)
}

const linhas = AULAS.map(a => ({
  id: a.id,
  nome: a.nome,
  capacidade_convite: a.capacidade?.convite ?? 0,
  capacidade_bilhete: a.capacidade?.bilhete ?? 0,
  ocupado_convite:    a.jaOcupado?.convite ?? 0,
  sem_limite:         Boolean(a.semLimite),
  atualizado_em:      new Date().toISOString(),
}))

const texto = valor => `'${String(valor).replace(/'/g, "''")}'`

if (soSql) {
  console.log('-- As aulas do 7WONDERS, geradas a partir de src/content/evento.js.')
  console.log('-- Correr no SQL Editor do Supabase. Pode correr-se vezes sem conta:')
  console.log('-- atualiza o que mudou e não apaga inscrições já feitas.\n')
  console.log('insert into public.aulas (id, nome, capacidade_convite, capacidade_bilhete, ocupado_convite, sem_limite) values')
  console.log(linhas.map(l =>
    `  (${texto(l.id)}, ${texto(l.nome)}, ${l.capacidade_convite}, ${l.capacidade_bilhete}, ${l.ocupado_convite}, ${l.sem_limite})`
  ).join(',\n'))
  console.log(`on conflict (id) do update set
  nome               = excluded.nome,
  capacidade_convite = excluded.capacidade_convite,
  capacidade_bilhete = excluded.capacidade_bilhete,
  ocupado_convite    = excluded.ocupado_convite,
  sem_limite         = excluded.sem_limite,
  atualizado_em      = now();`)
  process.exit(0)
}

const db = createClient(url, chave, { auth: { persistSession: false } })
const { error } = await db.from('aulas').upsert(linhas, { onConflict: 'id' })
if (error) {
  console.error('Falhou:', error.message)
  process.exit(1)
}

for (const l of linhas) {
  const total = l.capacidade_convite + l.capacidade_bilhete
  const estado = l.sem_limite ? 'sem limite de lugares'
    : total === 0 ? 'sem inscrição'
    : `${total} lugares (${l.ocupado_convite} já dados)`
  console.log(`  ✓ ${l.nome.padEnd(26)} ${estado}`)
}
console.log(`\n${linhas.length} aulas na base de dados.`)
