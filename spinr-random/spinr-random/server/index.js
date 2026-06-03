import express from 'express'
import cors from 'cors'
import axios from 'axios'

const app = express()
app.use(cors())
app.use(express.json())

const DISCOGS_BASE = 'https://api.discogs.com'

// GET — lecture (collection, recherche...)
app.get('/api/discogs/*', async (req, res) => {
  const path = req.path.replace('/api/discogs', '')
  const token = req.headers['x-discogs-token']
  if (!token) return res.status(401).json({ error: 'Token Discogs manquant' })

  try {
    const response = await axios.get(`${DISCOGS_BASE}${path}`, {
      params: req.query,
      headers: {
        'Authorization': `Discogs token=${token}`,
        'User-Agent': 'Spinr/1.0 +https://github.com/spinr',
      }
    })
    res.json(response.data)
  } catch (err) {
    const status = err.response?.status || 500
    const message = err.response?.data?.message || err.message
    res.status(status).json({ error: message })
  }
})

// POST — ajouter un vinyle à la collection
app.post('/api/discogs/*', async (req, res) => {
  const path = req.path.replace('/api/discogs', '')
  const token = req.headers['x-discogs-token']
  if (!token) return res.status(401).json({ error: 'Token Discogs manquant' })

  try {
    const response = await axios.post(`${DISCOGS_BASE}${path}`, req.body, {
      headers: {
        'Authorization': `Discogs token=${token}`,
        'User-Agent': 'Spinr/1.0 +https://github.com/spinr',
        'Content-Type': 'application/json',
      }
    })
    res.json(response.data)
  } catch (err) {
    const status = err.response?.status || 500
    const message = err.response?.data?.message || err.message
    res.status(status).json({ error: message })
  }
})

app.listen(3001, () => {
  console.log('Spinr proxy server → http://localhost:3001')
})
