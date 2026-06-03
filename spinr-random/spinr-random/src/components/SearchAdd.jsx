import { useState, useCallback, useRef } from 'react'

const s = {
  // Overlay
  overlay:   { position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:100, display:'flex', alignItems:'flex-end', justifyContent:'center', animation:'fadeIn .2s ease' },
  panel:     { width:'100%', maxWidth:'600px', background:'var(--bg2)', borderRadius:'var(--radius-lg) var(--radius-lg) 0 0', border:'1px solid var(--border2)', borderBottom:'none', maxHeight:'85vh', display:'flex', flexDirection:'column', animation:'slideUp .25s ease' },
  panelHead: { padding:'1.25rem 1.25rem 0', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 },
  panelTitle:{ fontFamily:"'DM Serif Display', serif", fontSize:'20px', fontWeight:400, color:'var(--text)' },
  closeBtn:  { width:'28px', height:'28px', borderRadius:'50%', background:'var(--bg4)', border:'1px solid var(--border)', color:'var(--text2)', fontSize:'14px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 },
  // Barre de recherche
  searchWrap:{ padding:'1rem 1.25rem', flexShrink:0 },
  searchRow: { display:'flex', gap:'8px' },
  searchIn:  { flex:1, padding:'10px 14px', fontSize:'14px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--radius)', color:'var(--text)', outline:'none', transition:'border-color .15s' },
  searchBtn: { padding:'10px 18px', background:'var(--accent)', border:'none', borderRadius:'var(--radius)', color:'#1a1500', fontSize:'13px', fontWeight:500, cursor:'pointer', flexShrink:0 },
  hint:      { fontSize:'11px', color:'var(--text3)', marginTop:'6px' },
  // Résultats
  results:   { flex:1, overflowY:'auto', padding:'0 1.25rem 1.25rem' },
  // Item
  item:      { display:'flex', alignItems:'center', gap:'12px', padding:'10px 12px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--radius)', marginBottom:'8px', transition:'border-color .15s' },
  itemCover: { width:'48px', height:'48px', borderRadius:'6px', flexShrink:0, overflow:'hidden', background:'var(--bg4)', display:'flex', alignItems:'center', justifyContent:'center' },
  itemImg:   { width:'100%', height:'100%', objectFit:'cover' },
  itemInfo:  { flex:1, minWidth:0 },
  itemTitle: { fontSize:'13px', fontWeight:500, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  itemArtist:{ fontSize:'12px', color:'var(--text2)', marginTop:'1px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  itemMeta:  { display:'flex', gap:'5px', marginTop:'4px', flexWrap:'wrap' },
  metaTag:   { fontSize:'10px', padding:'2px 6px', borderRadius:'4px', background:'var(--bg4)', border:'1px solid var(--border)', color:'var(--text3)' },
  addBtn:    { padding:'6px 14px', borderRadius:'8px', border:'1px solid var(--accent2)', background:'transparent', color:'var(--accent)', fontSize:'12px', fontWeight:500, cursor:'pointer', flexShrink:0, whiteSpace:'nowrap' },
  addBtnDone:{ padding:'6px 14px', borderRadius:'8px', border:'1px solid var(--green)', background:'rgba(108,191,142,0.1)', color:'var(--green)', fontSize:'12px', fontWeight:500, flexShrink:0, whiteSpace:'nowrap', cursor:'default' },
  addBtnLoad:{ padding:'6px 14px', borderRadius:'8px', border:'1px solid var(--border)', background:'transparent', color:'var(--text3)', fontSize:'12px', flexShrink:0, whiteSpace:'nowrap', cursor:'default' },
  // États
  stateBox:  { padding:'3rem', textAlign:'center', color:'var(--text3)', fontSize:'13px', lineHeight:1.7 },
  spinner:   { width:'22px', height:'22px', border:'2px solid var(--border2)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin .8s linear infinite', margin:'0 auto 12px' },
  // Toast
  toast:     { position:'fixed', bottom:'24px', left:'50%', transform:'translateX(-50%)', background:'#085041', color:'#fff', padding:'10px 20px', borderRadius:'var(--radius)', fontSize:'13px', fontWeight:500, zIndex:200, whiteSpace:'nowrap', pointerEvents:'none' },
}

// Couleurs par format
const FORMAT_COLORS = {
  'Vinyl': { bg:'rgba(232,184,109,0.15)', color:'var(--accent)' },
  'LP':    { bg:'rgba(232,184,109,0.15)', color:'var(--accent)' },
  'CD':    { bg:'rgba(29,158,117,0.15)',  color:'var(--green)'  },
}

function DiscPlaceholder({ title }) {
  const colors = ['#3C3489','#085041','#712B13','#633806','#0C447C']
  const fill = colors[(title?.charCodeAt(0) || 0) % colors.length]
  return (
    <svg viewBox="0 0 40 40" style={{ width:'100%', height:'100%' }}>
      <circle cx="20" cy="20" r="19" fill={fill} />
      <circle cx="20" cy="20" r="8" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="0.8" />
      <circle cx="20" cy="20" r="2.5" fill="rgba(255,255,255,0.4)" />
    </svg>
  )
}

export default function SearchAdd({ username, token, onClose, onAdded }) {
  const [query,    setQuery]    = useState('')
  const [results,  setResults]  = useState(null)   // null = pas encore cherché
  const [loading,  setLoading]  = useState(false)
  const [adding,   setAdding]   = useState({})     // { [releaseId]: 'loading'|'done'|'error' }
  const [toast,    setToast]    = useState(null)
  const inputRef = useRef()

  const showToast = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 2500)
  }

  const doSearch = useCallback(async () => {
    if (!query.trim()) return
    setLoading(true)
    setResults(null)

    try {
      const res = await fetch(
        `/api/discogs/database/search?q=${encodeURIComponent(query)}&type=release&format=Vinyl&per_page=20`,
        { headers: { 'x-discogs-token': token } }
      )
      if (!res.ok) throw new Error(`Erreur ${res.status}`)
      const data = await res.json()
      setResults(data.results || [])
    } catch (err) {
      setResults([])
      showToast('Erreur de recherche : ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [query, token])

  const doAdd = useCallback(async (release) => {
    setAdding(prev => ({ ...prev, [release.id]: 'loading' }))

    try {
      const res = await fetch(
        `/api/discogs/users/${username}/collection/folders/1/releases/${release.id}`,
        {
          method: 'POST',
          headers: {
            'x-discogs-token': token,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({})
        }
      )
      if (!res.ok) {
        const d = await res.json()
        throw new Error(d.error || `Erreur ${res.status}`)
      }

      setAdding(prev => ({ ...prev, [release.id]: 'done' }))
      showToast(`"${release.title}" ajouté à ta collection !`)

      // Prévient le parent pour resync la collection
      onAdded && onAdded()

    } catch (err) {
      setAdding(prev => ({ ...prev, [release.id]: 'error' }))
      showToast('Impossible d\'ajouter : ' + err.message)
    }
  }, [username, token, onAdded])

  const handleKey = (e) => {
    if (e.key === 'Enter') doSearch()
  }

  return (
    <>
      {/* Overlay cliquable pour fermer */}
      <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
        <div style={s.panel}>

          {/* En-tête */}
          <div style={s.panelHead}>
            <div style={s.panelTitle}>Ajouter un vinyle</div>
            <button style={s.closeBtn} onClick={onClose}>✕</button>
          </div>

          {/* Recherche */}
          <div style={s.searchWrap}>
            <div style={s.searchRow}>
              <input
                ref={inputRef}
                style={s.searchIn}
                placeholder="Artiste, titre, album…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKey}
                autoFocus
              />
              <button style={s.searchBtn} onClick={doSearch} disabled={loading}>
                {loading ? '…' : 'Chercher'}
              </button>
            </div>
            <div style={s.hint}>Recherche dans les 8 millions de vinyles du catalogue Discogs</div>
          </div>

          {/* Résultats */}
          <div style={s.results}>

            {/* Chargement */}
            {loading && (
              <div style={s.stateBox}>
                <div style={s.spinner} />
                Recherche en cours…
              </div>
            )}

            {/* Pas encore cherché */}
            {!loading && results === null && (
              <div style={s.stateBox}>
                🎵 Tape un artiste ou un titre pour commencer
              </div>
            )}

            {/* Aucun résultat */}
            {!loading && results !== null && results.length === 0 && (
              <div style={s.stateBox}>
                Aucun vinyle trouvé pour "{query}"<br />
                <span style={{ fontSize:'12px' }}>Essaie un autre terme ou vérifie l'orthographe</span>
              </div>
            )}

            {/* Liste des résultats */}
            {!loading && results && results.length > 0 && results.map(release => {
              const status = adding[release.id]
              const formats = release.format || []
              const year    = release.year || ''
              const label   = release.label?.[0] || ''
              const country = release.country || ''

              return (
                <div key={release.id} style={s.item}>
                  {/* Pochette */}
                  <div style={s.itemCover}>
                    {release.cover_image && release.cover_image !== 'https://st.discogs.com/noImage.png'
                      ? <img src={release.cover_image} alt={release.title} style={s.itemImg} onError={e => e.target.style.display='none'} />
                      : <DiscPlaceholder title={release.title} />
                    }
                  </div>

                  {/* Infos */}
                  <div style={s.itemInfo}>
                    <div style={s.itemTitle}>{release.title}</div>
                    <div style={s.itemArtist}>{release.country ? `${release.country} · ` : ''}{year || '—'}</div>
                    <div style={s.itemMeta}>
                      {formats.slice(0, 2).map(f => {
                        const fc = FORMAT_COLORS[f] || { bg:'var(--bg4)', color:'var(--text3)' }
                        return <span key={f} style={{ ...s.metaTag, background:fc.bg, color:fc.color, border:'none' }}>{f}</span>
                      })}
                      {label && <span style={s.metaTag}>{label}</span>}
                    </div>
                  </div>

                  {/* Bouton ajouter */}
                  {status === 'done'
                    ? <div style={s.addBtnDone}>✓ Ajouté</div>
                    : status === 'loading'
                      ? <div style={s.addBtnLoad}>…</div>
                      : <button style={s.addBtn} onClick={() => doAdd(release)}>+ Ajouter</button>
                  }
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {toast && <div style={s.toast}>{toast}</div>}

      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { transform:translateY(40px); opacity:0 } to { transform:translateY(0); opacity:1 } }
      `}</style>
    </>
  )
}
