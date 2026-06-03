import { useState, useCallback } from 'react'

const CACHE_KEY = 'spinr_collection'
const CACHE_TTL = 1000 * 60 * 60 // 1 heure

function getCached() {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const { data, timestamp } = JSON.parse(raw)
    if (Date.now() - timestamp > CACHE_TTL) return null
    return data
  } catch { return null }
}

function setCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: Date.now() }))
  } catch {}
}

export function useDiscogs() {
  const [collection, setCollection] = useState([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const [username, setUsername]     = useState(localStorage.getItem('spinr_username') || '')
  const [token, setToken]           = useState(localStorage.getItem('spinr_token') || '')

  const saveCredentials = useCallback((u, t) => {
    setUsername(u); setToken(t)
    localStorage.setItem('spinr_username', u)
    localStorage.setItem('spinr_token', t)
  }, [])

  const fetchCollection = useCallback(async (forceRefresh = false) => {
    if (!username || !token) { setError('Identifiants manquants'); return }

    if (!forceRefresh) {
      const cached = getCached()
      if (cached) { setCollection(cached); return }
    }

    setLoading(true)
    setError(null)

    try {
      let page = 1, allReleases = [], hasMore = true

      while (hasMore) {
        const res = await fetch(
          `/api/discogs/users/${username}/collection/folders/0/releases?page=${page}&per_page=100&sort=added&sort_order=desc`,
          { headers: { 'x-discogs-token': token } }
        )
        if (!res.ok) {
          const d = await res.json()
          throw new Error(d.error || `Erreur ${res.status}`)
        }
        const data = await res.json()

        const normalized = (data.releases || []).map(r => {
          const info = r.basic_information
          return {
            id:        r.id,
            rating:    r.rating,
            dateAdded: r.date_added,
            title:     info.title,
            year:      info.year,
            artists:   info.artists?.map(a => a.name).join(', ') || 'Inconnu',
            labels:    info.labels?.map(l => l.name).join(', ') || '',
            genres:    info.genres  || [],
            styles:    info.styles  || [],
            formats:   info.formats?.map(f => f.name).join(', ') || '',
            thumb:     info.thumb || '',
          }
        })

        allReleases = [...allReleases, ...normalized]
        const pagination = data.pagination || {}
        hasMore = page < (pagination.pages || 1)
        page++
        if (page > 10) hasMore = false
      }

      setCache(allReleases)
      setCollection(allReleases)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [username, token])

  const clearCache = useCallback(() => localStorage.removeItem(CACHE_KEY), [])

  return { collection, loading, error, username, token, saveCredentials, fetchCollection, clearCache }
}
