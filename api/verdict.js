module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' })

  const { name1, name2, rel, duration, chat1, chat2 } = req.body

  const relLabel = rel || 'casal'
  const durLabel = duration < 15 ? 'menos de 6 meses'
    : duration < 30 ? 'entre 6 meses e 1 ano'
    : duration < 50 ? '1 a 3 anos'
    : duration < 70 ? '3 a 5 anos'
    : duration < 85 ? '5 a 10 anos'
    : 'mais de 10 anos'

  const hasBothSides = chat1 && chat2

  const system = `És a Mara — psicóloga clínica especializada em dinâmicas relacionais, trauma de vinculação e violência psicológica. Tens 20 anos de experiência clínica. O teu trabalho é produzir análises honestas, baseadas em evidência científica, que realmente ajudem as pessoas — mesmo quando a verdade é difícil de ouvir.

FRAMEWORKS QUE APLICARES NA ANÁLISE:
- Modelo Gottman: identifica os "4 cavaleiros" presentes (crítica, contempto, defensividade, stonewalling)
- Teoria da Vinculação: identifica o estilo de vinculação de cada pessoa (seguro, ansioso, evitante, desorganizado)
- Modelo Duluth / Roda do Poder e Controlo: avalia padrões de poder e controlo, abuso coercivo
- DARVO: identifica se alguma parte usa Deny/Attack/Reverse Victim and Offender
- Ciclo de Walker: identifica se há ciclo de violência (tensão → incidente → reconciliação → lua de mel)
- TCC: identifica crenças nucleares disfuncionais e distorções cognitivas presentes
- Teoria Triangular de Sternberg: avalia níveis de intimidade, paixão e compromisso

PRINCÍPIO ÉTICO FUNDAMENTAL:
A tua análise serve o BEM das pessoas, não a sua satisfação imediata. Se a relação apresenta padrões de abuso, controlo ou toxicidade crónica — dizes-o claramente, com compaixão mas sem ambiguidade. Não "equilibras" uma situação de abuso por ser politicamente correto. A honestidade que pode libertar alguém de anos de sofrimento é o maior serviço que podes prestar.

Responde SEMPRE em JSON válido, sem markdown, sem texto fora do JSON.`

  const userPrompt = `Analisa este conflito relacional e gera um veredicto completo.

CONTEXTO:
- Pessoas: ${name1 || 'Pessoa A'} e ${name2 || 'Pessoa B'}
- Tipo de relação: ${relLabel}
- Duração: ${durLabel}

VERSÃO DE ${(name1 || 'PESSOA A').toUpperCase()}:
${chat1 || '(sem dados)'}

${hasBothSides ? `VERSÃO DE ${(name2 || 'PESSOA B').toUpperCase()}:
${chat2}` : `NOTA: Só tens a versão de ${name1 || 'uma pessoa'}. Analisa com base nesta versão, sendo explícito/a sobre as limitações de ter apenas um lado.`}

Gera uma análise clínica completa no seguinte formato JSON:

{
  "verdict_title": "frase curta impactante de 4-6 palavras que resume o veredicto (ex: 'Padrão de controlo sistemático' ou 'Conflito de necessidades não comunicadas')",
  "blame_pct_1": número de 0 a 100 (responsabilidade de ${name1 || 'pessoa A'} neste conflito específico),
  "blame_pct_2": número de 0 a 100 (responsabilidade de ${name2 || 'pessoa B'} — deve somar 100 com o anterior),
  "who_is_more_responsible": "${name1}" ou "${name2}" ou "ambos igualmente",
  "main_reason": "1-2 frases em itálico-friendly sobre a razão principal do conflito — direto, honesto, sem rodeios",
  "relationship_health": "saudável" | "frágil" | "tóxico" | "abusivo",
  "red_flags": ["array de red flags identificados, vazio se não houver"],
  "gottman_horsemen": ["array dos cavaleiros de Gottman identificados"],
  "attachment_style_1": "estilo de vinculação de ${name1 || 'pessoa A'}: seguro | ansioso | evitante | desorganizado",
  "attachment_style_2": "estilo de vinculação de ${name2 || 'pessoa B'}: seguro | ansioso | evitante | desorganizado",
  "clinical_analysis": "análise clínica profunda em 3-4 parágrafos. Usa linguagem acessível mas rigorosa. Nomeia os padrões psicológicos presentes. Se houver abuso — nomeia-o. Inclui base científica (cita os frameworks relevantes). Este é o texto principal que a pessoa vai ler.",
  "is_relationship_salvageable": true | false,
  "resolution_steps": [
    {
      "tag": "palavra-chave da ação (ex: 'reconhecer', 'comunicar', 'decidir')",
      "title": "título da ação (4-6 palavras)",
      "body": "descrição concreta e prática do que fazer — específico, não genérico"
    }
  ],
  "urgent_message": "Se a relação for tóxica ou abusiva: mensagem direta e compassiva para a pessoa que sofre, explicando em termos científicos o que está a acontecer e porque é legítimo sair. Se não houver urgência: null"
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
        model: 'claude-sonnet-4-5-20251001',
        max_tokens: 2000,
        system,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    const data = await response.json()
    const raw = data.content?.[0]?.text || '{}'

    // Extract JSON even if model wraps it
    const match = raw.match(/\{[\s\S]*\}/)
    const parsed = JSON.parse(match ? match[0] : raw)

    res.status(200).json(parsed)
  } catch (err) {
    console.error('Verdict error:', err.message)
    res.status(500).json({ error: err.message })
  }
}
