module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { to, name1, name2, code } = req.body
  if (!to || !code) return res.status(400).json({ error: 'Número e código são obrigatórios.' })

  const accountSid = (process.env.TWILIO_ACCOUNT_SID || '').trim()
  const authToken  = (process.env.TWILIO_AUTH_TOKEN || '').trim()
  const fromNumber = (process.env.TWILIO_WHATSAPP_NUMBER || '').trim()

  if (!accountSid || !authToken || !fromNumber) {
    return res.status(500).json({ error: 'WhatsApp não configurado.' })
  }

  // Clean number → E.164 format
  const clean = to.replace(/\s/g, '').replace(/^00/, '+')
  const toNumber = clean.startsWith('+') ? `whatsapp:${clean}` : `whatsapp:+${clean}`

  const link = `${(process.env.APP_URL || 'https://y-swart-theta.vercel.app').trim()}/join?c=${code}`

  const msgBody = `Olá, ${name2}! 👋

Sou a *Mara* — um app de análise de conflitos relacionais.

Estou analisando um caso entre *${name1}* e *${name2}*. O(a) ${name1} já me contou a versão dele(a) e respondeu às minhas perguntas — mas para eu gerar um veredicto justo e completo, preciso ouvir o seu lado da história também.

Leva apenas alguns minutos e é 100% confidencial. Ninguém saberá o que você me contar.

👉 Acesse o link abaixo e insira o código *${code}* quando solicitado:
🔗 ${link}

Responda às minhas perguntas e o relatório completo ficará pronto para os dois em breve.

— *Mara.ai*`

  try {
    const creds = Buffer.from(`${accountSid}:${authToken}`).toString('base64')
    const r = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${creds}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ From: fromNumber, To: toNumber, Body: msgBody }).toString(),
      }
    )
    const data = await r.json()
    if (!r.ok) {
      console.error('Twilio error:', JSON.stringify(data))
      return res.status(400).json({ error: data.message || 'Erro ao enviar.', code: data.code })
    }
    res.status(200).json({ ok: true, sid: data.sid })
  } catch (err) {
    console.error('Twilio error:', err.message)
    res.status(500).json({ error: err.message })
  }
}
