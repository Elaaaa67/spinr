import { useState, useMemo } from 'react'

const PALETTE = [
  ['#3C3489','#7F77DD'], ['#085041','#1D9E75'], ['#712B13','#D85A30'],
  ['#633806','#BA7517'], ['#0C447C','#378ADD'], ['#3B6D11','#639922'],
]

function DiscPlaceholder({ title }) {
  const idx = (title?.charCodeAt(0) || 0) % PALETTE.length
  const [fill, ring] = PALETTE[idx]
  return (
    <svg viewBox="0 0 40 40" style={{ width:'60%', height:'60%' }}>
      <circle cx="20" cy="20" r="19" fill={fill} />
      <circle cx="20" cy="20" r="12" fill="none" stroke={ring} strokeWidth="0.5" opacity="0.5" />
      <circle cx="20" cy="20" r="6"  fill="none" stroke={ring} strokeWidth="0.5" opacity="0.4" />
      <circle cx="20" cy="20" r="2"  fill={ring} opacity="0.7" />
    </svg>
  )
}

const s = {
  wrap:      { flex:1, display:'flex', flexDirection:'column', overflow:'hidden' },
  toolbar:   { padding:'10px 16px', borderBottom:'1px solid var(--border)', display:'flex', alignItems:'center', gap:'8px', background:'var(--bg2)', flexShrink:0 },
  search:    { flex:1, padding:'7px 11px', fontSize:'13px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--radius)', color:'var(--text)' },
  count:     { fontSize:'12px', color:'var(--text3)', whiteSpace:'nowrap', fontFamily:"'DM Mono', monospace" },
  sort:      { padding:'7px 9px', fontSize:'12px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--radius)', color:'var(--text2)', cursor:'pointer' },
  grid:      { flex:1, overflowY:'auto', padding:'14px 16px', display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(120px, 1fr))', gap:'10px', alignContent:'start' },
  card:      { background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius)', padding:'9px', cursor:'pointer', transition:'border-color 0.15s' },
  cardHL:    { background:'var(--bg3)', border:'1px solid var(--accent2)', borderRadius:'var(--radius)', padding:'9px', cursor:'pointer', transition:'border-color 0.15s' },
  cover:     { width:'100%', aspectRatio:'1', borderRadius:'6px', marginBottom:'7px', background:'var(--bg4)', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center' },
  img:       { width:'100%', height:'100%', objectFit:'cover' },
  cardTitle: { fontSize:'11px', fontWeight:500, color:'var(--text)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:'2px' },
  cardArt:   { fontSize:'10px', color:'var(--text3)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  tags:      { display:'flex', gap:'3px', marginTop:'4px', flexWrap:'wrap' },
  tag:       { fontSize:'10px', padding:'2px 5px', borderRadius:'3px', background:'var(--bg4)', color:'var(--text3)', border:'1px solid var(--border)' },
  tagHL:     { fontSize:'10px', padding:'2px 5px', borderRadius:'3px', background:'var(--accent-bg)', color:'var(--accent2)', border:'1px solid rgba(232,184,109,0.2)' },
  empty:     { gridColumn:'1 / -1', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'4rem', color:'var(--text3)', fontSize:'14px', gap:'8px', textAlign:'center' },
  spinWrap:  { gridColumn:'1 / -1', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'4rem', gap:'14px' },
  spinner:   { width:'28px', height:'28px', border:'2px solid var(--border2)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin 0.8s linear infinite' },
}

export default function Library({ collection, loading, highlightId }) {
  const [search, setSearch] = useState('')
  const [sort,   setSort]   = useState('added')

  const filtered = useMemo(() => {
    let items = collection
    if (search.trim()) {
      const q = search.toLowerCase()
      items = items.filter(v =>
        v.title.toLowerCase().includes(q) ||
        v.artists.toLowerCase().includes(q) ||
        v.genres.some(g => g.toLowerCase().includes(q)) ||
        v.styles.some(s => s.toLowerCase().includes(q))
      )
    }
    if (sort === 'title')  items = [...items].sort((a, b) => a.title.localeCompare(b.title))
    if (sort === 'year')   items = [...items].sort((a, b) => (b.year || 0) - (a.year || 0))
    if (sort === 'rating') items = [...items].sort((a, b) => (b.rating || 0) - (a.rating || 0))
    return items
  }, [collection, search, sort])

  return (
    <div style={s.wrap}>
      <div style={s.toolbar}>
        <input style={s.search} placeholder="Rechercher artiste, titre, genre…" value={search} onChange={e => setSearch(e.target.value)} />
        <select style={s.sort} value={sort} onChange={e => setSort(e.target.value)}>
          <option value="added">Récent</option>
          <option value="title">Titre A–Z</option>
          <option value="year">Année</option>
          <option value="rating">Note</option>
        </select>
        <span style={s.count}>{filtered.length}</span>
      </div>

      <div style={s.grid}>
        {loading && (
          <div style={s.spinWrap}>
            <div style={s.spinner} />
            <span style={{ fontSize:'13px', color:'var(--text3)' }}>Chargement de la collection…</span>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div style={s.empty}>
            <span>Aucun vinyle trouvé</span>
            {search && <span style={{ fontSize:'12px' }}>Essaie une autre recherche</span>}
          </div>
        )}

        {!loading && filtered.map(vinyl => (
          <VinylCard key={vinyl.id} vinyl={vinyl} highlighted={vinyl.id === highlightId} />
        ))}
      </div>
    </div>
  )
}

function VinylCard({ vinyl, highlighted }) {
  const [hover, setHover] = useState(false)
  const hl = highlighted || hover
  return (
    <div
      style={hl ? s.cardHL : s.card}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={s.cover}>
        {vinyl.thumb
          ? <img src={vinyl.thumb} alt={vinyl.title} style={s.img} loading="lazy" onError={e => e.target.style.display='none'} />
          : <DiscPlaceholder title={vinyl.title} />
        }
      </div>
      <div style={s.cardTitle}>{vinyl.title}</div>
      <div style={s.cardArt}>{vinyl.artists}</div>
      <div style={s.tags}>
        {vinyl.genres[0] && <span style={highlighted ? s.tagHL : s.tag}>{vinyl.genres[0]}</span>}
        {vinyl.year > 0  && <span style={s.tag}>{vinyl.year}</span>}
      </div>
    </div>
  )
}
