import { useEffect, useState } from 'react'
import { useDiscogs }          from './hooks/useDiscogs'
import { selectVinyl }         from './lib/selection'
import Setup      from './components/Setup'
import MoodPicker from './components/MoodPicker'
import Library    from './components/Library'
import ResultCard from './components/ResultCard'

// -- Historique local (20 derniers) --
const HK = 'spinr_history'
const getHistory = () => { try { return JSON.parse(localStorage.getItem(HK) || '[]') } catch { return [] } }
const addHistory = id => {
  const h = [id, ...getHistory().filter(x => x !== id)].slice(0, 20)
  localStorage.setItem(HK, JSON.stringify(h))
}

// -- Styles --
const s = {
  app:     { display:'flex', flexDirection:'column', height:'100vh', overflow:'hidden' },
  nav:     { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 18px', height:'50px', background:'var(--bg2)', borderBottom:'1px solid var(--border)', flexShrink:0 },
  logo:    { display:'flex', alignItems:'center', gap:'10px' },
  disc:    { width:'22px', height:'22px', borderRadius:'50%', border:'2px solid var(--accent)', display:'flex', alignItems:'center', justifyContent:'center' },
  discDot: { width:'5px', height:'5px', borderRadius:'50%', background:'var(--accent)' },
  logoTxt: { fontFamily:"'DM Serif Display', serif", fontSize:'19px', fontWeight:400, color:'var(--text)' },
  navR:    { display:'flex', alignItems:'center', gap:'8px' },
  navUser: { fontSize:'12px', color:'var(--text3)', fontFamily:"'DM Mono', monospace" },
  navBtn:  { padding:'5px 11px', fontSize:'12px', background:'transparent', border:'1px solid var(--border2)', borderRadius:'var(--radius)', color:'var(--text2)', cursor:'pointer' },
  navOut:  { padding:'5px 8px', fontSize:'11px', background:'transparent', border:'1px solid var(--border)', borderRadius:'var(--radius)', color:'var(--text3)', cursor:'pointer' },
  body:    { display:'flex', flex:1, overflow:'hidden' },
  main:    { flex:1, display:'flex', flexDirection:'column', overflow:'hidden' },
  resArea: { padding:'14px 18px', borderBottom:'1px solid var(--border)', background:'var(--bg)', flexShrink:0 },
  empty:   { padding:'14px 18px', borderBottom:'1px solid var(--border)', background:'var(--bg)', display:'flex', alignItems:'center', gap:'10px', flexShrink:0 },
  emptyDot:{ width:'28px', height:'28px', borderRadius:'50%', border:'1px dashed var(--border2)', flexShrink:0 },
  emptyTxt:{ fontSize:'13px', color:'var(--text3)', fontStyle:'italic' },
  errBar:  { background:'rgba(224,108,108,0.08)', borderBottom:'1px solid rgba(224,108,108,0.2)', padding:'7px 18px', fontSize:'12px', color:'var(--red)', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 },
  errX:    { background:'transparent', border:'none', color:'var(--red)', cursor:'pointer', fontSize:'14px' },
}

export default function App() {
  const { collection, loading, error, username, token, saveCredentials, fetchCollection, clearCache } = useDiscogs()
  const [result,     setResult]     = useState(null)
  const [localErr,   setLocalErr]   = useState(null)
  const [selecting,  setSelecting]  = useState(false)

  const isSetup = username && token

  useEffect(() => {
    if (isSetup && collection.length === 0 && !loading) fetchCollection()
  }, [isSetup])

  const handleSelect = (mood) => {
    if (collection.length === 0) { setLocalErr('Collection vide — attends la fin du chargement.'); return }
    setSelecting(true)
    setLocalErr(null)

    // Petit délai pour l'animation
    setTimeout(() => {
      try {
        const res = selectVinyl(collection, { ...mood, history: getHistory() })
        setResult(res)
        addHistory(res.vinyl.id)
      } catch (e) {
        setLocalErr(e.message)
      } finally {
        setSelecting(false)
      }
    }, 400)
  }

  const handleRefresh = () => { clearCache(); fetchCollection(true) }
  const handleLogout  = () => { localStorage.clear(); window.location.reload() }

  if (!isSetup) return <Setup onSave={saveCredentials} />

  return (
    <div style={s.app}>
      <nav style={s.nav}>
        <div style={s.logo}>
          <div style={s.disc}><div style={s.discDot} /></div>
          <span style={s.logoTxt}>Spinr</span>
        </div>
        <div style={s.navR}>
          <span style={s.navUser}>@{username}</span>
          <button style={s.navBtn} onClick={handleRefresh} disabled={loading}>
            {loading ? 'Sync…' : 'Sync Discogs'}
          </button>
          <button style={s.navOut} onClick={handleLogout}>Déconnexion</button>
        </div>
      </nav>

      {(error || localErr) && (
        <div style={s.errBar}>
          <span>{error || localErr}</span>
          <button style={s.errX} onClick={() => setLocalErr(null)}>✕</button>
        </div>
      )}

      <div style={s.body}>
        <MoodPicker
          onSelect={handleSelect}
          loading={selecting}
          collectionSize={collection.length}
        />

        <div style={s.main}>
          {result ? (
            <div style={s.resArea}>
              <ResultCard result={result} />
            </div>
          ) : (
            <div style={s.empty}>
              <div style={s.emptyDot} />
              <span style={s.emptyTxt}>
                {loading
                  ? 'Chargement de ta collection Discogs…'
                  : collection.length > 0
                    ? 'Configure ton humeur et tire au sort !'
                    : 'Collection vide ou non chargée'
                }
              </span>
            </div>
          )}

          <Library
            collection={collection}
            loading={loading}
            highlightId={result?.vinyl?.id}
          />
        </div>
      </div>
    </div>
  )
}
