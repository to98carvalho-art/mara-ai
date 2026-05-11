module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' })

  const { name1, name2, rel, duration, chat1, chat2 } = req.body

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
1. SEJA DECISIVO/A. Não dê respostas de "depende" quando a evidência é clara. As pessoas vieram aqui para tomar decisões, não para ficar mais confusas.
2. SEJA ESPECÍFICO/A. Use os nomes, cite o que foi dito, aponte padrões concretos — não generalize.
3. SEJA CORAJOSO/A. Se a relação deve terminar, diga-o. Se há abuso, nomeie-o. Se uma pessoa tem 80% de responsabilidade, diga-o sem suavizar.
4. AS CARTAS SÃO PRIVADAS. Cada carta é escrita para ser lida A SÓS pela pessoa. Nunca menciona o que a outra pessoa disse — é um espaço seguro para a verdade individual.
5. O OBJETIVO É O BEM DAS PESSOAS, não a manutenção da relação. Às vezes o melhor para as pessoas é separar. Diga isso quando for verdade.

Responda SEMPRE em Português do Brasil. Use "você" (nunca "tu"). Responda SEMPRE em JSON válido, sem markdown, sem texto fora do JSON.`

  const userPrompt = `Analise este conflito relacional e produza um relatório clínico completo que vai ajudar estas pessoas a tomar decisões reais sobre a sua relação.

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
  "verdict_title": "4-6 palavras que capturam a ESSÊNCIA clínica deste conflito — não genérico, específico a este caso. Ex: 'Stonewalling crónico com ansiedade de abandono' ou 'Crítica sistemática disfarçada de humor'",

  "blame_pct_1": número 0-100 (responsabilidade de ${n1} NESTE conflito específico),
  "blame_pct_2": número 0-100 (responsabilidade de ${n2} — soma 100 com o anterior),
  "who_is_more_responsible": "${n1}" ou "${n2}" ou "ambos igualmente",

  "main_reason": "A causa raiz REAL deste conflito em 2 frases — não o sintoma, a causa. Seja cirúrgico/a.",

  "relationship_health": "saudável" ou "frágil" ou "tóxico" ou "abusivo",

  "red_flags": ["lista de red flags específicos observados — cite comportamentos concretos, não abstrações. Vazio se não houver."],

  "gottman_horsemen": ["lista dos cavaleiros de Gottman presentes — apenas os que realmente aparecem nos dados"],

  "attachment_style_1": "estilo de ${n1}: seguro | ansioso | evitante | desorganizado",
  "attachment_style_2": "estilo de ${n2}: seguro | ansioso | evitante | desorganizado",

  "clinical_analysis": "Análise clínica em 4 parágrafos:\n1. O padrão central desta relação e como se manifesta (cite exemplos do que foi dito)\n2. O que está a acontecer ao nível do sistema de vinculação de cada pessoa\n3. Os ciclos repetitivos — o que desencadeia o quê, quem responde como\n4. Uma avaliação honesta do estado atual desta relação e o que significa para o futuro\nUse linguagem acessível mas rigorosa. Cite os frameworks quando relevante.",

  "is_relationship_salvageable": true ou false,

  "resolution_steps": [
    {
      "tag": "ação em 1 palavra",
      "title": "o que fazer (4-6 palavras)",
      "body": "instrução concreta e específica — diga EXATAMENTE o que fazer, não 'comuniquem melhor'. Máximo 2 frases."
    }
  ],

  "urgent_message": "Se tóxico/abusivo: mensagem direta para quem sofre — explique o que está a acontecer clinicamente, valide que sair é legítimo e corajoso, dê um primeiro passo concreto. Se não urgente: null",

  "needs_1": "A necessidade emocional CORE de ${n1} — não o que pede na superfície. Ligue ao estilo de vinculação. Explique como esta necessidade não satisfeita está a alimentar o conflito. 3 frases específicas a ${n1}, não genéricas.",

  "needs_2": "A necessidade emocional CORE de ${n2} — idem. 3 frases específicas a ${n2}.",

  "letter_1": "Carta privada da Mara para ${n1}. Começa com 'Querido/a ${n1},' (use a forma correta). Esta carta é APENAS para ${n1} — não menciona o que ${n2} disse, é um espaço só dele/dela. ESTRUTURA: (1) Valida 1 sentimento específico que ${n1} provavelmente sente mas não disse completamente; (2) Nomeia 1 padrão que ${n1} provavelmente não vê em si próprio/a e que está a contribuir para o problema; (3) Oferece uma perspetiva nova que pode mudar a sua abordagem; (4) Termina com uma recomendação clara e corajosa sobre o que ${n1} deve fazer agora. Tom: íntimo, honesto, como uma amiga de confiança com formação clínica. 6-7 frases.",

  "letter_2": "Carta privada da Mara para ${n2}. Começa com 'Querido/a ${n2},' (use a forma correta). APENAS para ${n2} — não menciona o que ${n1} disse. Mesma estrutura da letter_1 mas 100% personalizada para ${n2} e o que sabe sobre ele/ela. 6-7 frases.",

  "prognosis_pct": número 0-100 (probabilidade de melhoria real SE ambos aplicarem o plano — seja honesto/a, não otimista por gentileza),

  "prognosis_conditions": ["condição específica e concreta 1 — o que exatamente tem de mudar", "condição 2", "condição 3 (máximo 3)"]
}`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 4000,
        system,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    const data = await response.json()
    const raw = data.content?.[0]?.text || '{}'

    const match = raw.match(/\{[\s\S]*\}/)
    const parsed = JSON.parse(match ? match[0] : raw)

    res.status(200).json(parsed)
  } catch (err) {
    console.error('Verdict error:', err.message)
    res.status(500).json({ error: err.message })
  }
}
