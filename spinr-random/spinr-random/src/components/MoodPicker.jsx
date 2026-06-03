import { useState } from 'react'

const GENRES = ['Jazz', 'Soul', 'Rock', 'Pop', 'Électro', 'Folk', 'Classique', 'Hip-Hop', 'Funk', 'Blues', 'Reggae', 'Ambient', 'Metal', 'Punk']

const CONTEXTES = [
  { label: 'Seul·e',      vibe: 10 },
  { label: 'Fond sonore', vibe: 35 },
  { label: 'Dîner',       vibe: 60 },
  { label: 'Soirée',      vibe: 90 },
]

const ENERGY_LABELS = ['Contemplatif', 'Doux', 'Équilibré', 'Entraînant', 'Intense']

const s = {
  sidebar:    { width:'250px', flexShrink:0, background:'var(--bg2)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', overflow:'hidden' },
  inner:      { flex:1, overflowY:'auto', padding:'1.25rem 1rem', display:'flex', flexDirection:'column', gap:'1.25rem' },
  sLabel:     { fontSize:'10px', fontWeight:500, color:'var(--text3)', letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:'0.6rem' },
  sliderMeta: { display:'flex', justifyContent:'space-between', marginBottom:'6px' },
  sliderName: { fontSize:'13px', color:'var(--text2)' },
  sliderVal:  { fontSize:'12px', fontFamily:"'DM Mono', monospace", color:'var(--accent)', fontWeight:500 },
  ctxRow:     { display:'flex', gap:'5px' },
  ctxBtn:     { flex:1, padding:'7px 4px', fontSize:'11px', borderRadius:'var(--radius)', border:'1px solid var(--border2)', background:'transparent', color:'var(--text2)', cursor:'pointer', textAlign:'center' },
  ctxBtnSel:  { flex:1, padding:'7px 4px', fontSize:'11px', borderRadius:'var(--radius)', border:'1px solid var(--accent2)', background:'var(--accent-bg)', color:'var(--accent)', cursor:'pointer', fontWeight:500, textAlign:'center' },
  chips:      { display:'flex', flexWrap:'wrap', gap:'5px' },
  chip:       { fontSize:'11px', padding:'4px 9px', borderRadius:'20px', border:'1px solid var(--border2)', color:'var(--text2)', background:'transparent', cursor:'pointer' },
  chipSel:    { fontSize:'11px', padding:'4px 9px', borderRadius:'20px', border:'1px solid var(--accent2)', color:'var(--accent)', background:'var(--accent-bg)', cursor:'pointer', fontWeight:500 },
  textarea:   { width:'100%', padding:'9px 11px', fontSize:'13px', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--radius)', color:'var(--text)', resize:'none', lineHeight:1.6 },
  footer:     { padding:'1rem', borderTop:'1px solid var(--border)' },
  spinBtn:    { width:'100%', padding:'12px', background:'var(--accent)', color:'#1a1500', fontSize:'14px', fontWeight:500, borderRadius:'var(--radius)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' },
  spinBtnDis: { width:'100%', padding:'12px', background:'var(--accent2)', color:'#1a1500', fontSize:'14px', fontWeight:500, borderRadius:'var(--radius)', border:'none', opacity:0.6, display:'flex', alignItems:'center', justifyContent:'center', gap:'8px' },
  spinner:    { width:'14px', height:'14px', border:'2px solid rgba(26,21,0,0.3)', borderTopColor:'#1a1500', borderRadius:'50%', animation:'spin 0.8s linear infinite' },
  count:      { fontSize:'11px', color:'var(--text3)', textAlign:'center', marginTop:'7px' },
}

export default function MoodPicker({ onSelect, loading, collectionSize }) {
  const [energy,   setEnergy]   = useState(40)
  const [vibe,     setVibe]     = useState(35)
  const [genres,   setGenres]   = useState([])
  const [freeText, setFreeText] = useState('')

  const energyLabel = ENERGY_LABELS[Math.min(4, Math.floor(energy / 21))]

  const toggleGenre = g =>
    setGenres(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g])

  return (
    <div style={s.sidebar}>
      <div style={s.inner}>

        {/* Énergie */}
        <div>
          <div style={s.sLabel}>Énergie</div>
          <div style={s.sliderMeta}>
            <span style={s.sliderName}>Intensité</span>
            <span style={s.sliderVal}>{energyLabel}</span>
          </div>
          <input type="range" min={0} max={100} value={energy} onChange={e => setEnergy(Number(e.target.value))} />
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:'4px' }}>
            <span style={{ fontSize:'10px', color:'var(--text3)' }}>Calme</span>
            <span style={{ fontSize:'10px', color:'var(--text3)' }}>Intense</span>
          </div>
        </div>

        {/* Contexte */}
        <div>
          <div style={s.sLabel}>Contexte</div>
          <div style={s.ctxRow}>
            {CONTEXTES.map(c => (
              <button
                key={c.label}
                style={vibe === c.vibe ? s.ctxBtnSel : s.ctxBtn}
                onClick={() => setVibe(c.vibe)}
              >{c.label}</button>
            ))}
          </div>
        </div>

        {/* Genres */}
        <div>
          <div style={s.sLabel}>Genres ce soir</div>
          <div style={s.chips}>
            {GENRES.map(g => (
              <button
                key={g}
                style={genres.includes(g) ? s.chipSel : s.chip}
                onClick={() => toggleGenre(g)}
              >{g}</button>
            ))}
          </div>
        </div>

        {/* Contexte libre */}
        <div>
          <div style={s.sLabel}>Contexte libre</div>
          <textarea
            style={s.textarea}
            rows={3}
            placeholder="Soirée pluvieuse, dîner en tête-à-tête..."
            value={freeText}
            onChange={e => setFreeText(e.target.value)}
          />
        </div>

      </div>

      <div style={s.footer}>
        <button
          style={loading ? s.spinBtnDis : s.spinBtn}
          onClick={() => !loading && onSelect({ energy, vibe, genres, freeText })}
          disabled={loading}
        >
          {loading
            ? <><div style={s.spinner} /> Sélection…</>
            : '🎲 Tirer au sort'
          }
        </button>
        {collectionSize > 0 && (
          <div style={s.count}>{collectionSize} vinyles dans la collection</div>
        )}
      </div>
    </div>
  )
}
