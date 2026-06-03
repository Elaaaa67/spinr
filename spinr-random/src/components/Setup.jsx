import { useState } from 'react'

const s = {
  wrap:      { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem' },
  card:      { maxWidth:'420px', width:'100%', background:'var(--bg2)', border:'1px solid var(--border)', borderRadius:'var(--radius-lg)', padding:'2.5rem' },
  disc:      { width:'56px', height:'56px', borderRadius:'50%', background:'var(--bg4)', border:'3px solid var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'1.5rem' },
  discInner: { width:'14px', height:'14px', borderRadius:'50%', background:'var(--accent)' },
  title:     { fontFamily:"'DM Serif Display', serif", fontSize:'28px', fontWeight:400, marginBottom:'0.5rem', color:'var(--text)' },
  subtitle:  { fontSize:'14px', color:'var(--text2)', marginBottom:'2rem', lineHeight:1.6 },
  label:     { display:'block', fontSize:'12px', color:'var(--text2)', marginBottom:'6px', fontWeight:500, letterSpacing:'0.04em', textTransform:'uppercase' },
  input:     { width:'100%', padding:'10px 14px', fontSize:'14px', marginBottom:'1.25rem', background:'var(--bg3)', border:'1px solid var(--border)', borderRadius:'var(--radius)', color:'var(--text)' },
  hint:      { fontSize:'12px', color:'var(--text3)', marginTop:'-1rem', marginBottom:'1.25rem', lineHeight:1.5 },
  btn:       { width:'100%', padding:'12px', background:'var(--accent)', color:'#1a1500', fontSize:'14px', fontWeight:500, borderRadius:'var(--radius)', border:'none', letterSpacing:'0.02em' },
  link:      { color:'var(--accent)', textDecoration:'none', borderBottom:'1px solid var(--accent2)' },
  error:     { background:'rgba(224,108,108,0.1)', border:'1px solid rgba(224,108,108,0.3)', color:'var(--red)', padding:'10px 14px', borderRadius:'var(--radius)', fontSize:'13px', marginBottom:'1rem' },
}

export default function Setup({ onSave, error }) {
  const [u, setU] = useState('')
  const [t, setT] = useState('')

  return (
    <div style={s.wrap}>
      <div style={s.card} className="fade-up">
        <div style={s.disc}><div style={s.discInner} /></div>
        <h1 style={s.title}>Spinr</h1>
        <p style={s.subtitle}>Connecte ta collection Discogs — on choisit ton prochain vinyle au hasard selon ton humeur.</p>

        {error && <div style={s.error}>{error}</div>}

        <label style={s.label}>Nom d'utilisateur Discogs</label>
        <input style={s.input} value={u} onChange={e => setU(e.target.value)} placeholder="ton_pseudo" />

        <label style={s.label}>Token personnel</label>
        <input style={s.input} value={t} onChange={e => setT(e.target.value)} placeholder="xxxxxxxxxxxxxxxxxxxxxxxx" type="password" />
        <p style={s.hint}>
          Génère ton token sur{' '}
          <a href="https://www.discogs.com/settings/developers" target="_blank" rel="noreferrer" style={s.link}>
            discogs.com/settings/developers
          </a>{' '}→ "Generate new token"
        </p>

        <button style={s.btn} onClick={() => u.trim() && t.trim() && onSave(u.trim(), t.trim())}>
          Connecter ma collection
        </button>
      </div>
    </div>
  )
}
