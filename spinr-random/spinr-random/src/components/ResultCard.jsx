const PALETTE = [
  ['#3C3489','#AFA9EC'], ['#085041','#9FE1CB'], ['#712B13','#F5C4B3'],
  ['#633806','#FAC775'], ['#0C447C','#B5D4F4'], ['#3B6D11','#A8D97F'],
]

function DiscSVG({ title }) {
  const idx = (title?.charCodeAt(0) || 0) % PALETTE.length
  const [fill, ring] = PALETTE[idx]
  return (
    <svg viewBox="0 0 60 60" style={{ width:'100%', height:'100%' }}>
      <circle cx="30" cy="30" r="29" fill={fill} />
      <circle cx="30" cy="30" r="20" fill="none" stroke={ring} strokeWidth="0.5" opacity="0.5" />
      <circle cx="30" cy="30" r="11" fill="none" stroke={ring} strokeWidth="0.5" opacity="0.4" />
      <circle cx="30" cy="30" r="4"  fill={ring} opacity="0.8" />
    </svg>
  )
}

const s = {
  wrap:    { background:'var(--bg2)', border:'2px solid var(--accent2)', borderRadius:'var(--radius-lg)', padding:'1.25rem', display:'flex', gap:'1.25rem', alignItems:'flex-start', animation:'fadeUp 0.5s ease forwards' },
  cover:   { width:'90px', height:'90px', borderRadius:'8px', flexShrink:0, overflow:'hidden', background:'var(--bg4)' },
  img:     { width:'100%', height:'100%', objectFit:'cover' },
  info:    { flex:1, minWidth:0 },
  badge:   { fontSize:'10px', background:'var(--accent-bg)', color:'var(--accent)', border:'1px solid var(--accent2)', padding:'3px 8px', borderRadius:'4px', display:'inline-block', marginBottom:'9px', fontWeight:500, letterSpacing:'0.04em', textTransform:'uppercase' },
  title:   { fontFamily:"'DM Serif Display', serif", fontSize:'20px', fontWeight:400, color:'var(--text)', lineHeight:1.2, marginBottom:'3px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' },
  artist:  { fontSize:'13px', color:'var(--text2)', marginBottom:'2px' },
  meta:    { fontSize:'12px', color:'var(--text3)', marginBottom:'10px', display:'flex', gap:'6px', flexWrap:'wrap' },
  metaTag: { background:'var(--bg4)', padding:'2px 6px', borderRadius:'4px', border:'1px solid var(--border)' },
  divider: { height:'1px', background:'var(--border)', margin:'8px 0' },
  reason:  { fontSize:'13px', color:'var(--text2)', lineHeight:1.7, fontStyle:'italic', fontFamily:"'DM Serif Display', serif" },
}

export default function ResultCard({ result }) {
  if (!result) return null
  const { vinyl, reason } = result

  return (
    <div style={s.wrap}>
      <div style={s.cover}>
        {vinyl.thumb
          ? <img src={vinyl.thumb} alt={vinyl.title} style={s.img} onError={e => e.target.style.display='none'} />
          : <DiscSVG title={vinyl.title} />
        }
      </div>
      <div style={s.info}>
        <div style={s.badge}>Sélection du soir</div>
        <div style={s.title}>{vinyl.title}</div>
        <div style={s.artist}>{vinyl.artists}</div>
        <div style={s.meta}>
          {vinyl.year > 0 && <span style={s.metaTag}>{vinyl.year}</span>}
          {vinyl.genres.slice(0, 2).map(g => <span key={g} style={s.metaTag}>{g}</span>)}
          {vinyl.labels && <span style={s.metaTag}>{vinyl.labels.split(',')[0]}</span>}
        </div>
        <div style={s.divider} />
        <div style={s.reason}>"{reason}"</div>
      </div>
    </div>
  )
}
