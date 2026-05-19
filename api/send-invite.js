module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { to, name1, name2, code } = req.body
  if (!to || !code) return res.status(400).json({ error: 'Número e código são obrigatórios.' })

  const instanceId = (process.env.ZAPI_INSTANCE_ID || '').trim()
  const token      = (process.env.ZAPI_TOKEN || '').trim()

  if (!instanceId || !token) {
    return res.status(500).json({ error: 'WhatsApp não configurado.' })
  }

  // Clean number → only digits, preserve country code
  // If starts with +, remove it. If no country code, assume Brazil (+55)
  const raw = to.trim().replace(/\s/g, '')
  const clean = raw.startsWith('+') ? raw.slice(1).replace(/\D/g, '') : raw.replace(/\D/g, '')
  // If number is short (no country code), add Brazil +55
  const phone = clean.length <= 11 ? `55${clean}` : clean

  const link = `${(process.env.APP_URL || 'https://y-swart-theta.vercel.app').trim()}/join?c=${code}`

  const message = `Olá, ${name2}! 👋

Sou a *Mara* — um app de análise de conflitos relacionais.

Estou analisando um caso entre *${name1}* e *${name2}*. O(a) ${name1} já me contou a versão dele(a) — mas para eu gerar um veredicto justo e completo, preciso ouvir o seu lado da história também.

Leva apenas alguns minutos e é 100% confidencial. Ninguém saberá o que você me contar.

👉 Acesse o link abaixo e insira o código *${code}* quando solicitado:
🔗 ${link}

— *Mara.ai*`

  try {
    const clientToken = (process.env.ZAPI_CLIENT_TOKEN || '').trim()
    const headers = { 'Content-Type': 'application/json' }
    if (clientToken) headers['Client-Token'] = clientToken

    const r = await fetch(
      `https://api.z-api.io/instances/${instanceId}/token/${token}/send-text`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify({ phone, message }),
      }
    )
    const data = await r.json()
    console.log('Z-API response:', JSON.stringify(data))
    if (!r.ok || data.error) {
      return res.status(400).json({ error: data.message || data.error || 'Erro ao enviar.' })
    }
    res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Z-API error:', err.message)
    res.status(500).json({ error: err.message })
  }
}
