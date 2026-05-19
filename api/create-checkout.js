module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) return res.status(500).json({ error: 'Stripe não configurado.' })

  const { sessionId } = req.body
  const appUrl = (process.env.APP_URL || 'https://y-swart-theta.vercel.app').trim()

  try {
    const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${secretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams([
        ['payment_method_types[]', 'card'],
        ['payment_method_types[]', 'pix'],
        ['payment_method_types[]', 'link'],
        ['line_items[0][price]',   process.env.STRIPE_PRICE_ID],
        ['line_items[0][quantity]','1'],
        ['mode',                   'payment'],
        ['success_url',            `${appUrl}/verdict?paid=1&sid=${sessionId || ''}`],
        ['cancel_url',             `${appUrl}/paywall?abandoned=1`],
        ['locale',                 'pt-BR'],
        ['payment_intent_data[metadata][session_id]', sessionId || ''],
      ]).toString(),
    })

    const data = await r.json()
    if (!r.ok) {
      console.error('Stripe error:', JSON.stringify(data))
      return res.status(400).json({ error: data.error?.message || 'Erro ao criar sessão.' })
    }

    res.status(200).json({ url: data.url })
  } catch (err) {
    console.error('Checkout error:', err.message)
    res.status(500).json({ error: err.message })
  }
}
