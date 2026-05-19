module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { code } = req.body
  if (!code) return res.status(400).json({ error: 'Código em falta.' })

  const input = code.trim().toUpperCase()

  // Free codes (100% off) — comma separated in env var
  // Ex: PROMO_CODES_FREE=MARA2024,BETA100,AMIGO50
  const freeCodes = (process.env.PROMO_CODES_FREE || '')
    .split(',').map(c => c.trim().toUpperCase()).filter(Boolean)

  if (freeCodes.includes(input)) {
    return res.status(200).json({ valid: true, type: 'free', discount: 100 })
  }

  // Discount codes (partial) — format: CODE:PERCENT,CODE2:PERCENT2
  // Ex: PROMO_CODES_DISCOUNT=HALF:50,QUARTER:25
  const discountCodes = (process.env.PROMO_CODES_DISCOUNT || '')
    .split(',').map(c => c.trim()).filter(Boolean)

  for (const entry of discountCodes) {
    const [c, pct] = entry.split(':')
    if (c?.trim().toUpperCase() === input) {
      return res.status(200).json({ valid: true, type: 'discount', discount: parseInt(pct) || 10 })
    }
  }

  return res.status(200).json({ valid: false, error: 'Código inválido ou expirado.' })
}
