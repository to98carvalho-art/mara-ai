module.exports = async function handler(req, res) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'No API key', length: 0 });

  // List available models
  try {
    const response = await fetch('https://api.anthropic.com/v1/models', {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
    });

    const data = await response.json();
    res.status(response.status).json({ keyPrefix: apiKey.substring(0, 20), models: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
