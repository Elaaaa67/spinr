// api/discogs.js
import axios from 'axios'

export default async function handler(req, res) {
  const token = req.headers['x-discogs-token']
  if (!token) return res.status(401).json({ error: 'Token manquant' })

  const path = req.url.replace('/api/discogs', '')
  const base = 'https://api.discogs.com'

  try {
    if (req.method === 'GET') {
      const response = await axios.get(`${base}${path}`, {
        params: req.query,
        headers: {
          'Authorization': `Discogs token=${token}`,
          'User-Agent': 'Spinr/1.0',
        }
      })
      res.json(response.data)
    }

    if (req.method === 'POST') {
      const response = await axios.post(`${base}${path}`, req.body, {
        headers: {
          'Authorization': `Discogs token=${token}`,
          'User-Agent': 'Spinr/1.0',
          'Content-Type': 'application/json',
        }
      })
      res.json(response.data)
    }
  } catch (err) {
    res.status(err.response?.status || 500).json({ error: err.message })
  }
}