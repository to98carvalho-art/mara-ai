import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { X, FED, FNUM, FUI, GRAD, GRAD_TXT } from '../design/tokens'
import { art, getGender } from '../utils/gender'
import XStatus from '../components/XStatus'
import XBack from '../components/XBack'
import Card from '../components/Card'
import Lens from '../components/Lens'
import { track, pixel } from '../utils/analytics'

const LOADING_STEPS = [
  { text: 'A cruzar os dois lados do conflito…',      sub: 'comparando versões e pontos de tensão'     },
  { text: 'A identificar padrões de vinculação…',     sub: 'modelo Bowlby · estilos ansioso e evitante' },
  { text: 'A aplicar o modelo Gottman…',              sub: 'os 4 cavaleiros + ratio positivo/negativo'  },
  { text: 'A calcular responsabilidades…',            sub: 'análise imparcial com base em evidência'    },
  { text: 'A redigir a análise clínica…',             sub: 'diagnóstico psicológico detalhado'          },
  { text: 'A escrever as cartas pessoais…',           sub: 'uma mensagem privada para cada pessoa'      },
  { text: 'A preparar o plano de resolução…',         sub: 'passos concretos e prognóstico real'        },
  { text: 'A finalizar o relatório…',                 sub: 'quase pronto'                               },
]

function LoadingScreen({ name1, name2 }) {
  const [step, setStep] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false)
      setTimeout(() => {
        setStep(s => (s + 1) % LOADING_STEPS.length)
        setFade(true)
      }, 300)
    }, 3200)
    return () => clearInterval(interval)
  }, [])

  const current = LOADING_STEPS[step]

  return (
    <div style={{ flex: 1, background: X.ink, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '0 32px' }}>
      <XStatus />
      {/* Glow */}
      <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%, -50%)', width: 300, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${X.acc1}28 0%, transparent 70%)`, filter: 'blur(40px)', pointerEvents: 'none' }}/>

      <div style={{ position: 'relative', marginBottom: 32 }}>
        <Lens size={88} intensity={1.4} />
      </div>

      {/* Names */}
      {name1 && name2 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
          {[name1, name2].map((n, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: i === 0 ? 0 : 10 }}>
              {i === 1 && <div style={{ fontSize: 10, fontWeight: 700, color: X.textMute, letterSpacing: 2 }}>×</div>}
              <div style={{ padding: '5px 14px', borderRadius: 999, background: i === 0 ? `${X.acc1}18` : `${X.acc2}18`, border: `1px solid ${i === 0 ? X.acc1 : X.acc2}40`, fontSize: 13, fontWeight: 600, color: i === 0 ? X.acc1 : X.acc2 }}>{n}</div>
            </div>
          ))}
        </div>
      )}

      {/* Step text */}
      <div style={{ textAlign: 'center', transition: 'opacity 0.3s', opacity: fade ? 1 : 0 }}>
        <div style={{ fontFamily: FED, fontStyle: 'italic', fontSize: 22, color: X.text, letterSpacing: -0.5, lineHeight: 1.2 }}>
          {current.text}
        </div>
        <div style={{ marginTop: 8, fontSize: 12.5, color: X.textMute, lineHeight: 1.5 }}>
          {current.sub}
        </div>
      </div>

      {/* Progress dots */}
      <div style={{ marginTop: 32, display: 'flex', gap: 6 }}>
        {LOADING_STEPS.map((_, i) => (
          <div key={i} style={{
            width: i === step ? 18 : 5, height: 5, borderRadius: 3,
            background: i === step ? GRAD : 'rgba(255,255,255,0.12)',
            transition: 'all 0.4s ease',
          }}/>
        ))}
      </div>

      <div style={{ marginTop: 20, fontSize: 11.5, color: X.textMute }}>
        Demora cerca de 20–40 segundos
      </div>
    </div>
  )
}

const HEALTH_MAP = {
  saudável: { color: '#34D399', label: 'Relação saudável'  },
  frágil:   { color: '#FFB36B', label: 'Relação frágil'    },
  tóxico:   { color: '#FF4B6E', label: 'Relação tóxica'    },
  abusivo:  { color: '#FF2244', label: 'Padrão abusivo'    },
}

function HealthBadge({ health }) {
  const { color, label } = HEALTH_MAP[health] || HEALTH_MAP['frágil']
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 7,
      padding: '6px 14px', borderRadius: 999,
      background: `${color}15`, border: `1px solid ${color}45`,
    }}>
      <div style={{ width: 7, height: 7, borderRadius: 4, background: color, boxShadow: `0 0 8px ${color}` }}/>
      <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 1.1, textTransform: 'uppercase', color }}>{label}</span>
    </div>
  )
}

/* ── Conic-ring blame component ── */
function PersonRing({ name, pct, color, isDominant, animated }) {
  const [displayPct, setDisplayPct] = useState(0)

  useEffect(() => {
    if (!animated) { setDisplayPct(pct); return }
    let start = null
    const duration = 1100
    function tick(ts) {
      if (!start) start = ts
      const p = Math.min((ts - start) / duration, 1)
      // ease out expo
      const ease = p === 1 ? 1 : 1 - Math.pow(2, -10 * p)
      setDisplayPct(Math.round(ease * pct))
      if (p < 1) requestAnimationFrame(tick)
    }
    const id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [pct, animated])

  const size   = isDominant ? 116 : 96
  const ring   = isDominant ? 8   : 6
  const inner  = size - ring * 2 - 6
  const deg    = displayPct * 3.6

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      {/* Outer glow */}
      <div style={{ position: 'relative' }}>
        {isDominant && (
          <div style={{
            position: 'absolute', inset: -14, borderRadius: '50%',
            background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
            filter: 'blur(10px)',
          }}/>
        )}
        {/* Ring */}
        <div style={{
          position: 'relative', width: size, height: size, borderRadius: '50%',
          background: `conic-gradient(${color} ${deg}deg, rgba(255,255,255,0.06) ${deg}deg)`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: isDominant ? `0 0 24px ${color}40` : 'none',
        }}>
          {/* Inner dark disc */}
          <div style={{
            width: inner, height: inner, borderRadius: '50%',
            background: X.ink2,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 0,
          }}>
            <div style={{
              fontFamily: FED, fontStyle: 'italic', fontSize: isDominant ? 24 : 20,
              fontWeight: 500, lineHeight: 1,
              background: color, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              {name?.[0]?.toUpperCase() || '?'}
            </div>
            <div style={{
              fontFamily: FNUM, fontSize: isDominant ? 15 : 13,
              fontWeight: 600, color, letterSpacing: -0.5, lineHeight: 1, marginTop: 3,
            }}>
              {displayPct}%
            </div>
          </div>
        </div>
      </div>

      {/* Name */}
      <div style={{
        fontSize: 11.5, fontWeight: 700, letterSpacing: 1.2,
        color: isDominant ? X.text : X.textSoft,
        textTransform: 'uppercase',
      }}>
        {name || '—'}
      </div>

      {/* Badge */}
      {isDominant && (
        <div style={{
          padding: '3px 10px', borderRadius: 999,
          background: `${color}1a`, border: `1px solid ${color}50`,
          fontSize: 9.5, fontWeight: 700, letterSpacing: 1.1,
          color, textTransform: 'uppercase',
        }}>
          mais responsável
        </div>
      )}
    </div>
  )
}

const SECTIONS = [
  { icon: '🧠', label: 'Análise Clínica',    color: '#9B7BFF' },
  { icon: '🔗', label: 'Vinculação',          color: '#FF6BB1' },
  { icon: '♟',  label: 'Padrões Gottman',    color: '#FFB36B' },
  { icon: '🗺', label: 'Plano de Resolução', color: '#34D399' },
]

export default function S09Verdict() {
  const nav = useNavigate()
  const { data, update } = useApp()
  const [verdict,  setVerdict]  = useState(data.verdict || null)
  const [loading,  setLoading]  = useState(!data.verdict)
  const [error,    setError]    = useState(null)
  const [copied,   setCopied]   = useState(false)
  const [animated, setAnimated] = useState(false)

  // purchase_completed — when returning from Stripe with ?paid=1
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('paid') === '1') {
      track('purchase_completed', { both_sides: !!data.chat2 })
      pixel('purchase_completed', { value: 9.99, currency: 'BRL', both_sides: !!data.chat2 })
      update({ paid: true })
    }
    track('verdict_viewed', { both_sides: !!data.chat2 })
  }, [])

  useEffect(() => {
    if (data.verdict) { setTimeout(() => setAnimated(true), 200); return }

    setLoading(true)

    async function loadVerdict() {
      // 1. Try to get pre-generated verdict from cache (fast path)
      if (data.code) {
        try {
          const cached = await fetch(`/api/verdict?code=${data.code}`)
          if (cached.ok) {
            const { verdict: v } = await cached.json()
            if (v) {
              setVerdict(v); update({ verdict: v }); setLoading(false)
              setTimeout(() => setAnimated(true), 300)
              return
            }
          }
        } catch (_) { /* fall through to generation */ }
      }

      // 2. Not cached yet — generate on demand (slower path)
      try {
        const res = await fetch('/api/verdict', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name1: data.name1, name2: data.name2,
            rel: data.rel, duration: data.duration,
            chat1: data.chat1, chat2: data.chat2 || null,
            code: data.code || '',
          }),
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const v = await res.json()
        if (!v || v.error) throw new Error(v?.error || 'Resposta inválida')
        setVerdict(v); update({ verdict: v }); setLoading(false)
        setTimeout(() => setAnimated(true), 300)
      } catch (err) {
        console.error('Verdict fetch failed:', err.message)
        setError('Erro ao gerar análise. Tenta novamente.')
        setLoading(false)
      }
    }

    loadVerdict()
  }, [])

  async function handleShare() {
    const v = verdict
    const text = [
      `🔍 Mara.ai — Veredicto`,
      ``,
      name1 && name2 ? `${art(moreResp)} ${moreResp} esteve mais ${getGender(moreResp) === 'f' ? 'errada' : 'errado'}.` : '',
      ``,
      `${name1}: ${v?.blame_pct_1 ?? '?'}%  ·  ${name2}: ${v?.blame_pct_2 ?? '?'}%`,
      `Saúde da relação: ${v?.relationship_health || ''}`,
      v?.main_reason ? `\n"${v.main_reason}"` : '',
      ``,
      `— mara.ai`,
    ].filter(Boolean).join('\n')
    if (navigator.share) {
      try { await navigator.share({ text, title: 'Mara.ai — Veredicto' }) } catch {}
    } else {
      await navigator.clipboard.writeText(text)
      setCopied(true); setTimeout(() => setCopied(false), 2500)
    }
  }

  const name1 = data.name1 || ''
  const name2 = data.name2 || ''

  /* ── Loading ── */
  if (loading) return <LoadingScreen name1={name1} name2={name2} />

  // defined below, hoisted here for readability

  /* ── Error ── */
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
  // who has more responsibility
  const moreResp = pct1 >= pct2 ? name1 : name2

  return (
    <div style={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: X.ink, overflowY: 'auto' }}>
      <XStatus />

      {/* Atmospheric glows */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `radial-gradient(ellipse at 25% 15%, ${X.acc1}28 0%, transparent 50%),
                     radial-gradient(ellipse at 80% 30%, ${X.acc2}1c 0%, transparent 45%),
                     radial-gradient(ellipse at 50% 95%, ${X.accDeep}33 0%, transparent 55%)`,
      }}/>

      <div style={{ position: 'relative', zIndex: 1, padding: '20px 24px 44px', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* ── Header ── */}
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <XBack onClick={() => nav('/paywall')} />
          <div style={{
            padding: '5px 13px', borderRadius: 999, fontSize: 10.5, fontWeight: 700,
            letterSpacing: 1.8, textTransform: 'uppercase',
            color: X.acc1, background: `${X.acc1}18`, border: `1px solid ${X.acc1}45`,
          }}>veredito</div>
          <div onClick={handleShare} style={{
            width: 38, height: 38, borderRadius: 19,
            background: copied ? `${X.good}22` : 'rgba(255,255,255,0.05)',
            border: `1px solid ${copied ? X.good : X.line}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all .2s',
          }}>
            {copied
              ? <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M2.5 6.5l3 3 5-6" stroke={X.good} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              : <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <circle cx="3" cy="6.5" r="1.3" stroke={X.textSoft} strokeWidth="1.1"/>
                  <circle cx="10" cy="2.5" r="1.3" stroke={X.textSoft} strokeWidth="1.1"/>
                  <circle cx="10" cy="10.5" r="1.3" stroke={X.textSoft} strokeWidth="1.1"/>
                  <path d="M4.3 5.9l4.4-2.1M4.3 7.1l4.4 2.1" stroke={X.textSoft} strokeWidth="1.1"/>
                </svg>
            }
          </div>
        </div>

        {/* ── Title ── */}
        <div style={{ marginTop: 28 }}>
          <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: 0.3, color: X.textMute, fontFamily: FED, fontStyle: 'italic', marginBottom: 10 }}>
            a balança decidiu
          </div>
          <h1 style={{
            margin: 0, fontFamily: FED, fontSize: 46, fontWeight: 400,
            letterSpacing: -1.8, lineHeight: 1.0, color: X.text,
          }}>
            {art(moreResp)}{' '}
            <em style={{
              fontFamily: FED, fontStyle: 'italic',
              background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>{moreResp || '…'}</em>
            <br/>
            esteve mais
            <br/>
            <em style={{
              fontFamily: FED, fontStyle: 'italic',
              background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              {getGender(moreResp) === 'f' ? 'errada.' : 'errado.'}
            </em>
          </h1>
          <div style={{ marginTop: 16 }}>
            <HealthBadge health={v?.relationship_health || 'frágil'} />
          </div>
        </div>

        {/* ── Blame rings ── */}
        <div style={{
          marginTop: 24, padding: '24px 16px 20px', borderRadius: 24,
          background: 'rgba(255,255,255,0.025)', border: `1px solid ${X.line}`,
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-around',
        }}>
          <PersonRing
            name={name1} pct={pct1} color={X.acc1}
            isDominant={pct1 >= pct2} animated={animated}
          />
          {/* VS */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 6, paddingTop: 40,
          }}>
            <div style={{ width: 1, height: 18, background: X.line }}/>
            <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 2.5, color: X.textMute, textTransform: 'uppercase' }}>vs</div>
            <div style={{ width: 1, height: 18, background: X.line }}/>
          </div>
          <PersonRing
            name={name2} pct={pct2} color={X.acc2}
            isDominant={pct2 > pct1} animated={animated}
          />
        </div>

        {/* ── Urgent ── */}
        {v?.urgent_message && (
          <div style={{ marginTop: 12, padding: '16px 18px', borderRadius: 16, background: 'rgba(255,34,68,0.09)', border: '1px solid rgba(255,34,68,0.28)' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.6, color: '#FF2244', textTransform: 'uppercase', marginBottom: 10 }}>
              mensagem importante
            </div>
            <div style={{ fontSize: 13.5, color: X.text, lineHeight: 1.65 }}>{v.urgent_message}</div>
          </div>
        )}

        {/* ── Report teaser ── */}
        <div style={{ marginTop: 20 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.8, color: X.textMute, textTransform: 'uppercase', marginBottom: 12 }}>
            relatório incluído
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {SECTIONS.map((s, i) => (
              <div key={i} style={{
                padding: '11px 14px', borderRadius: 14,
                background: 'rgba(255,255,255,0.03)', border: `1px solid ${s.color}28`,
                display: 'flex', alignItems: 'center', gap: 8,
              }}>
                <span style={{ fontSize: 15 }}>{s.icon}</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: s.color, letterSpacing: -0.1 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 20 }} />

        {/* ── CTA ── */}
        <div
          onClick={() => nav('/resolution')}
          style={{
            height: 56, borderRadius: 999, background: GRAD,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            cursor: 'pointer', boxShadow: `0 10px 32px ${X.acc1}45`,
            fontSize: 15.5, fontWeight: 600, fontFamily: FUI, color: '#fff',
          }}
        >
          Ver relatório completo
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <path d="M2.5 7.5h10m0 0L8.5 3.5m4 4l-4 4" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div style={{ marginTop: 8, textAlign: 'center', fontSize: 11.5, color: X.textMute }}>
          análise clínica · vinculação · gottman · resolução
        </div>

      </div>
    </div>
  )
}
