/**
 * /api/verdict
 *
 * GET  /api/verdict?code=XXXX  → return cached verdict from Redis (fast)
 * POST /api/verdict             → generate verdict via Claude, optionally cache to Redis
 *
 * The recommended flow:
 *   1. POST immediately after chat finishes (fire & forget from client)
 *      → generates verdict and caches it in Redis under verdict_XXXX
 *   2. GET when user arrives at verdict screen (instant if already cached)
 *      → if not cached yet, falls back to generating on demand
 */

const REDIS_URL   = process.env.UPSTASH_REDIS_REST_URL
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN
const VERDICT_TTL = 86400 // 24 hours

async function redisGet(key) {
  if (!REDIS_URL || !REDIS_TOKEN) return null
  const res = await fetch(REDIS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(['GET', key]),
  })
  if (!res.ok) return null
  const { result } = await res.json()
  return result ? JSON.parse(result) : null
}

async function redisSet(key, value) {
  if (!REDIS_URL || !REDIS_TOKEN) return
  await fetch(REDIS_URL, {
    method: 'POST',
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(['SET', key, JSON.stringify(value), 'EX', VERDICT_TTL]),
  })
}

async function generateVerdict({ name1, name2, rel, duration, chat1, chat2 }) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('API key not configured')

  const n1 = name1 || 'Pessoa A'
  const n2 = name2 || 'Pessoa B'
  const relLabel = rel || 'casal'
  const durLabel = duration < 15 ? 'menos de 6 meses'
    : duration < 30 ? 'entre 6 meses e 1 ano'
    : duration < 50 ? '1 a 3 anos'
    : duration < 70 ? '3 a 5 anos'
    : duration < 85 ? '5 a 10 anos'
    : 'mais de 10 anos'

  const hasBothSides = !!(chat1 && chat2)

  const system = `Você é a Mara — psicóloga clínica com 20 anos de especialização em dinâmicas relacionais, trauma de vinculação e tomada de decisão em relacionamentos. Você é conhecida por ser direta, compassiva e incansavelmente honesta.

FRAMEWORKS QUE VOCÊ APLICA:
- Modelo Gottman (4 cavaleiros + antídotos; ratio 5:1 de interações positivas/negativas)
- Teoria da Vinculação de Bowlby/Ainsworth (seguro, ansioso, evitante, desorganizado)
- Modelo Duluth / Roda do Poder e Controle (abuso coercivo, controle financeiro, isolamento)
- DARVO (Deny, Attack, Reverse Victim and Offender)
- Ciclo de Walker (tensão → incidente → reconciliação → lua de mel)
- TCC (crenças nucleares disfuncionais, distorções cognitivas, esquemas de Young)
- Teoria Triangular de Sternberg (intimidade, paixão, compromisso)
- Modelo de Lerner (distância emocional funcional vs. disfuncional)

PRINCÍPIOS INEGOCIÁVEIS:
1. SEJA DECISIVO/A. Não dê respostas de "depende" quando a evidência é clara.
2. SEJA ESPECÍFICO/A. Use os nomes, cite o que foi dito, aponte padrões concretos.
3. SEJA CORAJOSO/A. Se a relação deve terminar, diga-o. Se há abuso, nomeie-o.
4. AS CARTAS SÃO PRIVADAS. Cada carta é escrita para ser lida A SÓS pela pessoa.
5. O OBJETIVO É O BEM DAS PESSOAS, não a manutenção da relação.

Responda SEMPRE em Português do Brasil. Use "você" (nunca "tu"). Responda SEMPRE em JSON válido, sem markdown, sem texto fora do JSON.`

  const userPrompt = `Analise este conflito relacional e produza um relatório clínico completo.

CONTEXTO:
- ${n1} e ${n2} — ${relLabel} — há ${durLabel}

VERSÃO DE ${n1.toUpperCase()}:
${chat1 || '(não fornecida)'}

${hasBothSides
  ? `VERSÃO DE ${n2.toUpperCase()}:\n${chat2}`
  : `NOTA CLÍNICA: Apenas a versão de ${n1} está disponível. Analise com honestidade os limites desta perspetiva unilateral, mas não abdique de identificar padrões reais quando presentes.`
}

Produza o seguinte JSON (todos os campos são obrigatórios):

{
  "verdict_title": "4-6 palavras que capturam a ESSÊNCIA clínica deste conflito",
  "blame_pct_1": número 0-100 (responsabilidade de ${n1}),
  "blame_pct_2": número 0-100 (responsabilidade de ${n2} — soma 100),
  "who_is_more_responsible": "${n1}" ou "${n2}" ou "ambos igualmente",
  "main_reason": "A causa raiz REAL deste conflito em 2 frases — seja cirúrgico/a.",
  "relationship_health": "saudável" ou "frágil" ou "tóxico" ou "abusivo",
  "red_flags": ["red flags específicos observados — cite comportamentos concretos"],
  "gottman_horsemen": ["cavaleiros de Gottman presentes — apenas os que realmente aparecem"],
  "attachment_style_1": "estilo de ${n1}: seguro | ansioso | evitante | desorganizado",
  "attachment_style_2": "estilo de ${n2}: seguro | ansioso | evitante | desorganizado",
  "clinical_analysis": "Análise clínica em 4 parágrafos: (1) padrão central, (2) sistema de vinculação, (3) ciclos repetitivos, (4) avaliação do estado atual. Use linguagem acessível mas rigorosa.",
  "is_relationship_salvageable": true ou false,
  "resolution_steps": [
    { "tag": "ação em 1 palavra", "title": "o que fazer (4-6 palavras)", "body": "instrução concreta — EXATAMENTE o que fazer. Máximo 2 frases." }
  ],
  "urgent_message": "Se tóxico/abusivo: mensagem direta para quem sofre. Se não urgente: null",
  "needs_1": "A necessidade emocional CORE de ${n1} — ligue ao estilo de vinculação. 3 frases específicas.",
  "needs_2": "A necessidade emocional CORE de ${n2} — idem. 3 frases específicas.",
  "letter_1": "Carta privada da Mara para ${n1}. Começa com 'Querido/a ${n1},'. APENAS para ${n1}. (1) Valida 1 sentimento específico; (2) Nomeia 1 padrão que ${n1} não vê em si; (3) Oferece perspetiva nova; (4) Recomendação clara e corajosa. 6-7 frases íntimas e honestas.",
  "letter_2": "Carta privada da Mara para ${n2}. Começa com 'Querido/a ${n2},'. APENAS para ${n2}. Mesma estrutura. 6-7 frases.",
  "prognosis_pct": número 0-100 (probabilidade de melhoria real SE ambos aplicarem o plano),
  "prognosis_conditions": ["condição concreta 1", "condição 2", "condição 3 (máximo 3)"]
}`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 3000,
      system,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.json().catch(() => ({}))
    throw new Error(err.error?.message || `Claude API ${response.status}`)
  }

  const data = await response.json()
  const raw  = data.content?.[0]?.text || '{}'
  const match = raw.match(/\{[\s\S]*\}/)
  return JSON.parse(match ? match[0] : raw)
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  /* ── GET: return cached verdict ─────────────────────────── */
  if (req.method === 'GET') {
    const code = (req.query.code || '').toUpperCase().trim()
    if (!code) return res.status(400).json({ error: 'Missing code' })

    const cached = await redisGet(`verdict_${code}`)
    if (cached) return res.status(200).json({ verdict: cached, cached: true })

    return res.status(404).json({ error: 'Not ready yet' })
  }

  /* ── POST: generate (and optionally cache) ──────────────── */
  if (req.method === 'POST') {
    const { name1, name2, rel, duration, chat1, chat2, code } = req.body

    try {
      const verdict = await generateVerdict({ name1, name2, rel, duration, chat1, chat2 })

      // Cache to Redis if a code was provided
      if (code) {
        await redisSet(`verdict_${code.toUpperCase()}`, verdict)
      }

      return res.status(200).json(verdict)
    } catch (err) {
      console.error('Verdict error:', err.message)
      return res.status(500).json({ error: err.message })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
