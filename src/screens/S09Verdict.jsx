import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { X, FED, FNUM, GRAD, GRAD_TXT } from '../design/tokens'
import XStatus from '../components/XStatus'
import XBack from '../components/XBack'
import Card from '../components/Card'
import Lens from '../components/Lens'

function HealthBadge({ health }) {
  const map = {
    saudável: { color: X.good,  label: 'Relação saudável' },
    frágil:   { color: X.warm,  label: 'Relação frágil'   },
    tóxico:   { color: '#FF4B6E', label: 'Relação tóxica' },
    abusivo:  { color: '#FF2244', label: 'Padrão abusivo'  },
  }
  const { color, label } = map[health] || map['frágil']
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '5px 12px', borderRadius: 999,
      background: `${color}18`, border: `1px solid ${color}55`,
    }}>
      <div style={{ width: 6, height: 6, borderRadius: 3, background: color, boxShadow: `0 0 6px ${color}` }}/>
      <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color }}>{label}</span>
    </div>
  )
}

export default function S09Verdict() {
  const nav = useNavigate()
  const { data, update } = useApp()
  const [verdict, setVerdict]   = useState(data.verdict || null)
  const [loading, setLoading]   = useState(!data.verdict)
  const [error,   setError]     = useState(null)

  useEffect(() => {
    if (data.verdict) return
    setLoading(true)

    fetch('/api/verdict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name1:    data.name1,
        name2:    data.name2,
        rel:      data.rel,
        duration: data.duration,
        chat1:    data.chat1,
        chat2:    data.chat2 || null,
      }),
    })
      .then(r => r.json())
      .then(v => {
        setVerdict(v)
        update({ verdict: v })
        setLoading(false)
      })
      .catch(err => {
        setError('Erro ao gerar análise. Tenta novamente.')
        setLoading(false)
      })
  }, [])

  const name1 = data.name1 || ''
  const name2 = data.name2 || ''

  if (loading) return (
    <div style={{ flex: 1, background: X.ink, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 20 }}>
      <XStatus />
      <Lens size={80} intensity={1.2} />
      <div style={{ fontFamily: FED, fontStyle: 'italic', fontSize: 22, color: X.text, letterSpacing: -0.5 }}>A analisar…</div>
      <div style={{ fontSize: 13.5, color: X.textSoft, maxWidth: 220, textAlign: 'center', lineHeight: 1.5 }}>
        A Mara está a cruzar os dois lados com base científica
      </div>
    </div>
  )

  if (error) return (
    <div style={{ flex: 1, background: X.ink, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 16, padding: '0 28px' }}>
      <XStatus />
      <div style={{ color: '#FF4B6E', fontSize: 15, textAlign: 'center' }}>{error}</div>
      <div onClick={() => { setError(null); setLoading(true); update({ verdict: null }) }}
        style={{ color: X.acc1, fontSize: 14, cursor: 'pointer', textDecoration: 'underline' }}>Tentar novamente</div>
    </div>
  )

  const v = verdict
  const pct1 = v?.blame_pct_1 ?? 35
  const pct2 = v?.blame_pct_2 ?? 65
  const moreResponsible = v?.who_is_more_responsible === name1 ? name1 : name2

  return (
    <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: X.ink, overflowY: 'auto' }}>
      <XStatus />
      {/* background glows */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: `radial-gradient(ellipse at 50% 25%, ${X.acc1}44 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, ${X.acc2}28 0%, transparent 60%)`,
      }}/>

      <div style={{ position: 'relative', padding: '20px 28px 36px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <XBack onClick={() => nav('/paywall')} />
          <div style={{
            padding: '6px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700,
            letterSpacing: 1.6, textTransform: 'uppercase',
            color: X.text, background: 'rgba(155,123,255,0.18)', border: `1px solid ${X.acc1}`,
          }}>veredicto</div>
        </div>

        {/* Title */}
        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <div style={{ fontFamily: FED, fontSize: 13, color: X.textSoft, fontStyle: 'italic', letterSpacing: 0.4, marginBottom: 10 }}>
            a balança decidiu
          </div>
          <h1 style={{
            margin: 0, fontFamily: FED, fontSize: 46, fontWeight: 700,
            letterSpacing: -0.4, lineHeight: 0.95, color: X.text,
          }}>
            {v?.verdict_title
              ? <em style={{
                  display: 'inline-block',
                  fontFamily: FED, fontSize: 46, fontWeight: 700, fontStyle: 'italic',
                  letterSpacing: -0.3, lineHeight: 1, paddingRight: 4,
                  background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>{v.verdict_title}</em>
              : <>{moreResponsible} esteve<br/><em style={{ fontFamily: FED, fontStyle: 'italic', background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>mais errado/a.</em></>
            }
          </h1>
          <div style={{ marginTop: 14 }}>
            <HealthBadge health={v?.relationship_health || 'frágil'} />
          </div>
        </div>

        {/* Split bar */}
        <div style={{ marginTop: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.4, color: X.textSoft, textTransform: 'uppercase' }}>{name1.toLowerCase()}</div>
              <div style={{ fontFamily: FNUM, fontSize: 36, fontWeight: 300, letterSpacing: -0.2, color: X.acc1, lineHeight: 1 }}>
                {pct1}<span style={{ fontSize: 16, color: X.textSoft }}>%</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.4, color: X.textSoft, textTransform: 'uppercase' }}>{name2.toLowerCase()}</div>
              <div style={{ fontFamily: FNUM, fontSize: 36, fontWeight: 300, letterSpacing: -0.2, color: X.acc2, lineHeight: 1 }}>
                {pct2}<span style={{ fontSize: 16, color: X.textSoft }}>%</span>
              </div>
            </div>
          </div>
          <div style={{ height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: `${pct1}%`, background: X.acc1, transition: 'width 1s ease' }}/>
            <div style={{ flex: 1, background: X.acc2 }}/>
          </div>
        </div>

        {/* Main reason */}
        {v?.main_reason && (
          <Card raised style={{ marginTop: 20, padding: 18 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.4, color: X.acc2, textTransform: 'uppercase' }}>razão principal</div>
            <div style={{ fontFamily: FED, fontStyle: 'italic', fontSize: 16, lineHeight: 1.55, marginTop: 8, color: X.text }}>
              "{v.main_reason}"
            </div>
          </Card>
        )}

        {/* Red flags */}
        {v?.red_flags?.length > 0 && (
          <div style={{ marginTop: 16, padding: '14px 16px', borderRadius: 16, background: 'rgba(255,75,110,0.08)', border: '1px solid rgba(255,75,110,0.25)' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.4, color: '#FF4B6E', textTransform: 'uppercase', marginBottom: 10 }}>⚠ sinais de alerta</div>
            {v.red_flags.map((flag, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: i < v.red_flags.length - 1 ? 8 : 0 }}>
                <div style={{ width: 4, height: 4, borderRadius: 2, background: '#FF4B6E', marginTop: 7, flexShrink: 0 }}/>
                <div style={{ fontSize: 13.5, color: X.text, lineHeight: 1.4 }}>{flag}</div>
              </div>
            ))}
          </div>
        )}

        {/* Urgent message for abuse cases */}
        {v?.urgent_message && (
          <div style={{ marginTop: 16, padding: '18px 18px', borderRadius: 16, background: 'rgba(255,34,68,0.10)', border: '1px solid rgba(255,34,68,0.3)' }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.4, color: '#FF2244', textTransform: 'uppercase', marginBottom: 10 }}>mensagem importante</div>
            <div style={{ fontSize: 14, color: X.text, lineHeight: 1.6 }}>{v.urgent_message}</div>
          </div>
        )}

        {/* Gottman horsemen */}
        {v?.gottman_horsemen?.length > 0 && (
          <Card style={{ marginTop: 16, padding: 16 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.4, color: X.acc1, textTransform: 'uppercase', marginBottom: 10 }}>padrões gottman detetados</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {v.gottman_horsemen.map((h, i) => (
                <div key={i} style={{
                  padding: '4px 10px', borderRadius: 999, fontSize: 12, fontWeight: 600,
                  background: `${X.acc1}18`, border: `1px solid ${X.acc1}40`, color: X.acc1,
                }}>{h}</div>
              ))}
            </div>
          </Card>
        )}

        <div style={{ flex: 1, minHeight: 16 }} />

        <div
          onClick={() => nav('/resolution')}
          style={{ textAlign: 'center', fontSize: 12, color: X.textSoft, letterSpacing: 1.2, textTransform: 'uppercase', cursor: 'pointer', paddingTop: 8 }}
        >ver plano de resolução</div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 6 }}>
          <svg width="20" height="12" viewBox="0 0 20 12"><path d="M2 2l8 8 8-8" stroke={X.textSoft} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </div>
    </div>
  )
}
