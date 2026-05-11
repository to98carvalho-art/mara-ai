import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { X, FED, FNUM, GRAD, GRAD_TXT } from '../design/tokens'
import { art } from '../utils/gender'
import XStatus from '../components/XStatus'
import XBack from '../components/XBack'
import Card from '../components/Card'

/* ─── helpers ─────────────────────────────────────────── */
function ringPct(status, chatProgress = 0) {
  if (status === 'completed') return 1
  if (status === 'chatting')  return 0.35 + (chatProgress / 100) * 0.55
  if (status === 'opened')    return 0.35
  return 0.15 // waiting
}

function statusLabel(status, name2) {
  if (status === 'completed') return `${name2} respondeu`
  if (status === 'chatting')  return `${name2} está a responder`
  if (status === 'opened')    return `${name2} abriu o convite`
  return 'À espera de resposta'
}

/* ─── animated dot ────────────────────────────────────── */
function Pulse({ color }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 12, height: 12 }}>
      <span style={{ position: 'absolute', width: 12, height: 12, borderRadius: 6, background: color, opacity: 0.35, animation: 'pulse 1.6s ease-out infinite' }}/>
      <span style={{ width: 6, height: 6, borderRadius: 3, background: color, flexShrink: 0 }}/>
    </span>
  )
}

/* ─── step row ────────────────────────────────────────── */
function Step({ done, active, muted, label }) {
  const color = done ? X.good : active ? X.acc1 : X.line
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 20, height: 20, borderRadius: 10, flexShrink: 0,
        background: done ? X.good : 'transparent',
        border: done ? 'none' : `1.5px solid ${color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'all .4s ease',
      }}>
        {done && (
          <svg width="10" height="10" viewBox="0 0 10 10">
            <path d="M1.5 5L4 7.5 8.5 2.5" stroke={X.ink} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
        {active && <Pulse color={X.acc1} />}
      </div>
      <div style={{
        fontSize: 14,
        color: done ? X.text : active ? X.text : X.textMute,
        fontWeight: active ? 600 : 400,
        transition: 'color .4s ease',
      }}>{label}</div>
    </div>
  )
}

/* ─── main ────────────────────────────────────────────── */
export default function S05Analyzing() {
  const nav = useNavigate()
  const { data, update } = useApp()
  const name2 = data.name2 || 'a outra pessoa'
  const code  = data.code

  const [sessionStatus,  setSessionStatus]  = useState(data.sessionStatus || 'waiting')
  const [chatProgress,   setChatProgress]   = useState(data.chatProgress  || 0)
  const [displayPct,     setDisplayPct]     = useState(ringPct(data.sessionStatus || 'waiting', data.chatProgress || 0))
  const [navigated,      setNavigated]      = useState(false)

  const pollRef  = useRef(null)
  const animRef  = useRef(null)

  // ── ring animation ──────────────────────────────────
  useEffect(() => {
    const target = ringPct(sessionStatus, chatProgress)
    if (animRef.current) clearInterval(animRef.current)
    animRef.current = setInterval(() => {
      setDisplayPct(prev => {
        const diff = target - prev
        if (Math.abs(diff) < 0.002) { clearInterval(animRef.current); return target }
        return prev + diff * 0.08
      })
    }, 16)
    return () => clearInterval(animRef.current)
  }, [sessionStatus, chatProgress])

  // ── poll session ────────────────────────────────────
  useEffect(() => {
    // No code → user skipped invite → go straight to /verdict after brief delay
    if (!code) {
      setSessionStatus('completed')
      const t = setTimeout(() => { if (!navigated) { setNavigated(true); nav('/verdict') } }, 2200)
      return () => clearTimeout(t)
    }

    function readLocal() {
      try {
        const raw = localStorage.getItem(`ct_${code}`)
        if (!raw) return null
        return JSON.parse(raw)
      } catch { return null }
    }

    async function poll() {
      // 1. Check localStorage first (same-device, instant)
      const local = readLocal()
      const localStatus = local?.status
      const localProgress = local?.chatProgress || 0

      // 2. Check server (cross-device)
      let serverStatus = null
      let serverProgress = 0
      try {
        const res = await fetch(`/api/session?c=${code}`)
        if (res.ok) {
          const s = await res.json()
          serverStatus   = s.status
          serverProgress = s.chatProgress || 0
        }
      } catch (_) {}

      // Use whichever is further along the lifecycle
      const order = ['waiting', 'opened', 'chatting', 'completed']
      const localIdx  = order.indexOf(localStatus)
      const serverIdx = order.indexOf(serverStatus)
      const bestStatus   = localIdx >= serverIdx ? (localStatus || 'waiting') : (serverStatus || 'waiting')
      const bestProgress = Math.max(localProgress, serverProgress)

      setSessionStatus(bestStatus)
      setChatProgress(bestProgress)

      // Keep AppContext in sync
      if (bestStatus !== data.sessionStatus || bestProgress !== data.chatProgress) {
        update({ sessionStatus: bestStatus, chatProgress: bestProgress })
      }

      if (bestStatus === 'completed' && !navigated) {
        setNavigated(true)
        clearInterval(pollRef.current)
        // Brief pause to show 100% before navigating
        setTimeout(() => nav('/solo'), 2000)
      }
    }

    poll() // immediate first check
    pollRef.current = setInterval(poll, 5000)
    return () => clearInterval(pollRef.current)
  }, [code])

  /* ─── derived UI values ──────────────────────────────── */
  const pctDisplay  = Math.round(displayPct * 100)
  const isWaiting   = sessionStatus === 'waiting'
  const isOpened    = sessionStatus === 'opened'
  const isChatting  = sessionStatus === 'chatting'
  const isCompleted = sessionStatus === 'completed'

  const r = 88, c_len = 2 * Math.PI * r

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%   { transform: scale(1);   opacity: .35 }
          70%  { transform: scale(2.4); opacity: 0   }
          100% { transform: scale(2.4); opacity: 0   }
        }
        @keyframes spin {
          from { transform: rotate(0deg)   }
          to   { transform: rotate(360deg) }
        }
        @keyframes innerBreath {
          0%,100% { r: 34; opacity: .55; }
          50%      { r: 42; opacity: .85; }
        }
        @keyframes numPop {
          0%   { transform: scale(1);    }
          30%  { transform: scale(1.14); }
          60%  { transform: scale(0.97); }
          100% { transform: scale(1);    }
        }
        @keyframes orbDot {
          0%   { opacity: .25 }
          40%  { opacity: 1   }
          100% { opacity: .25 }
        }
      `}</style>
      <div style={{ position: 'relative', flex: 1, background: X.ink, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <XStatus />
        <div style={{ padding: '20px 28px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>

          {/* Header */}
          <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <XBack onClick={() => nav('/invite')} />
            <div style={{
              padding: '6px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700,
              letterSpacing: 1.2, textTransform: 'uppercase',
              color: isCompleted ? X.good : X.acc1,
              background: isCompleted ? `${X.good}18` : 'rgba(155,123,255,0.10)',
              border: `1px solid ${isCompleted ? X.good + '55' : X.line}`,
              transition: 'all .4s ease',
            }}>
              {isCompleted ? 'concluído' : 'em curso'}
            </div>
          </div>

          {/* Title */}
          <div style={{ marginTop: 18, textAlign: 'center' }}>
            <h1 style={{ margin: 0, fontFamily: FED, fontSize: 32, fontWeight: 400, letterSpacing: -0.8, lineHeight: 1.1, color: X.text }}>
              {isCompleted ? (
                <>A calcular{' '}
                <em style={{ fontFamily: FED, fontStyle: 'italic', fontSize: 32, fontWeight: 400, letterSpacing: -1, background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>o veredicto.</em>
                </>
              ) : (
                <>A pesar{' '}
                <em style={{ fontFamily: FED, fontStyle: 'italic', fontSize: 32, fontWeight: 400, letterSpacing: -1, background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>os dois lados.</em>
                </>
              )}
            </h1>
            <p style={{ margin: '8px auto 0', fontSize: 13.5, color: X.textSoft, maxWidth: 260, lineHeight: 1.5, transition: 'opacity .4s' }}>
              {isCompleted
                ? 'Os dois lados estão cruzados. A criar análise…'
                : isWaiting
                  ? `Aguarde que ${art(name2)} ${name2} entre na conversa.`
                  : 'Quanto mais contexto, mais justo o veredicto.'}
            </p>
          </div>

          {/* Progress ring */}
          {(() => {
            // orbit speed: 8s idle → 1.5s at full chatting
            const orbitDur = isCompleted ? 1.2
              : isChatting  ? Math.max(1.5, 4 - (chatProgress / 100) * 2.5)
              : isOpened    ? 4
              : 8
            const breathDur = isChatting ? '1.1s' : isOpened ? '2s' : '3.2s'
            const coreColor = isCompleted ? X.good : X.acc1
            const dotOpacity = isWaiting ? 0.3 : 1

            return (
              <div style={{ display: 'flex', justifyContent: 'center', margin: '28px 0 24px' }}>
                <div style={{ position: 'relative', width: 220, height: 220 }}>

                  {/* Ambient glow */}
                  <div style={{
                    position: 'absolute', inset: -10,
                    background: `radial-gradient(circle, ${coreColor}44 0%, transparent 60%)`,
                    filter: 'blur(20px)', transition: 'background 1s ease',
                  }}/>

                  {/* ── Arc ring (rotated -90°) ─── */}
                  <svg width="220" height="220" viewBox="0 0 220 220"
                    style={{ transform: 'rotate(-90deg)', position: 'absolute', inset: 0 }}>
                    <defs>
                      <linearGradient id="rg" x1="0" x2="1" y1="0" y2="1">
                        <stop offset="0%" stopColor={coreColor}/>
                        <stop offset="100%" stopColor={isCompleted ? '#4ade80' : X.acc2}/>
                      </linearGradient>
                    </defs>
                    {Array.from({ length: 60 }).map((_, i) => {
                      const a = (i * 6) * Math.PI / 180
                      const x1 = 110 + Math.cos(a) * 100, y1 = 110 + Math.sin(a) * 100
                      const x2 = 110 + Math.cos(a) * 104, y2 = 110 + Math.sin(a) * 104
                      return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                        stroke={X.text} strokeOpacity={i % 5 === 0 ? 0.4 : 0.15} strokeWidth="1"/>
                    })}
                    <circle cx="110" cy="110" r={r} fill="none" stroke="rgba(155,123,255,0.12)" strokeWidth="6"/>
                    <circle cx="110" cy="110" r={r} fill="none" stroke="url(#rg)" strokeWidth="6"
                      strokeDasharray={c_len} strokeDashoffset={c_len * (1 - displayPct)}
                      strokeLinecap="round"/>
                  </svg>

                  {/* ── Orbital layer (upright, not rotated) ─── */}
                  <svg width="220" height="220" viewBox="0 0 220 220"
                    style={{ position: 'absolute', inset: 0 }}>
                    <defs>
                      <radialGradient id="cg" cx="50%" cy="35%" r="60%">
                        <stop offset="0%"   stopColor="#fff"      stopOpacity="0.18"/>
                        <stop offset="50%"  stopColor={coreColor} stopOpacity="0.22"/>
                        <stop offset="100%" stopColor={coreColor} stopOpacity="0.06"/>
                      </radialGradient>
                    </defs>

                    {/* Inner breathing orb */}
                    <circle cx="110" cy="110" fill={`url(#cg)`}
                      style={{
                        animation: `innerBreath ${breathDur} ease-in-out infinite`,
                        transition: 'fill .8s ease',
                        r: 38,
                      }}/>

                    {/* Orbit dot 1 — outer, clockwise */}
                    <g style={{
                      transformOrigin: '110px 110px',
                      animation: `spin ${orbitDur}s linear infinite`,
                    }}>
                      <circle cx="110" cy="62" r="4" fill={coreColor} opacity={dotOpacity * 0.9}/>
                      <circle cx="110" cy="62" r="7" fill={coreColor} opacity={dotOpacity * 0.18}
                        style={{ filter: 'blur(2px)' }}/>
                    </g>

                    {/* Orbit dot 2 — mid-radius, counter-clockwise */}
                    <g style={{
                      transformOrigin: '110px 110px',
                      animation: `spin ${orbitDur * 1.45}s linear infinite reverse`,
                    }}>
                      <circle cx="155" cy="110" r="2.8" fill={X.acc2} opacity={dotOpacity * 0.75}/>
                      <circle cx="155" cy="110" r="5" fill={X.acc2} opacity={dotOpacity * 0.15}
                        style={{ filter: 'blur(1.5px)' }}/>
                    </g>

                    {/* Orbit dot 3 — inner, clockwise fast */}
                    <g style={{
                      transformOrigin: '110px 110px',
                      animation: `spin ${orbitDur * 0.65}s linear infinite`,
                    }}>
                      <circle cx="110" cy="76" r="2" fill={coreColor} opacity={dotOpacity * 0.55}/>
                    </g>
                  </svg>

                  {/* ── Centre text ─── */}
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                    pointerEvents: 'none',
                  }}>
                    <div
                      key={pctDisplay}
                      style={{
                        fontFamily: FNUM, fontSize: 64, fontWeight: 300,
                        letterSpacing: -2, lineHeight: 1, color: X.text,
                        animation: isChatting || isCompleted ? 'numPop .35s ease' : 'none',
                      }}
                    >
                      {pctDisplay}<span style={{ fontSize: 22, color: X.textSoft }}>%</span>
                    </div>
                    <div style={{ fontSize: 11, color: X.textMute, marginTop: 4, letterSpacing: 1.2, textTransform: 'uppercase' }}>
                      {isCompleted ? 'concluído' : 'analisado'}
                    </div>
                    {isChatting && (
                      <div style={{ fontSize: 11.5, color: coreColor, marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <Pulse color={coreColor} />
                        <span>a responder</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Status steps */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Step done label="Convite enviado" />
            <Step
              done={isOpened || isChatting || isCompleted}
              active={!isOpened && !isChatting && !isCompleted && false /* not active until opened */}
              muted={isWaiting}
              label={`${name2} abriu o convite`}
            />
            <Step
              done={isCompleted}
              active={isChatting}
              muted={isWaiting || isOpened}
              label={isChatting ? `${name2} está a responder — ${chatProgress}%` : `${name2} está a responder`}
            />
            <Step
              active={isCompleted}
              muted={!isCompleted}
              label="A calcular o veredicto"
            />
          </div>

          <div style={{ flex: 1 }} />

          {/* Bottom card */}
          {!isCompleted ? (
            <Card style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 2l6 3v4c0 4-3 5.5-6 6-3-.5-6-2-6-6V5z" stroke={X.acc1} strokeWidth="1.5"/>
              </svg>
              <div style={{ fontSize: 13, color: X.textSoft, lineHeight: 1.4 }}>
                Te avisamos assim que {art(name2)} {name2} responder. Pode fechar o ecrã.
              </div>
            </Card>
          ) : (
            <Card raised style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14, background: `${X.good}0f`, border: `1px solid ${X.good}44` }}>
              <div style={{ width: 36, height: 36, borderRadius: 18, background: `${X.good}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="16" height="16" viewBox="0 0 16 16">
                  <path d="M2 8l4 4 8-8" stroke={X.good} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: X.text }}>{name2} já respondeu.</div>
                <div style={{ fontSize: 12.5, color: X.textSoft, marginTop: 2 }}>A gerar o veredicto completo…</div>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <svg width="20" height="20" viewBox="0 0 20 20" style={{ animation: 'spin 1s linear infinite', opacity: 0.7 }}>
                  <circle cx="10" cy="10" r="7" fill="none" stroke={X.good} strokeWidth="2" strokeDasharray="30 14"/>
                </svg>
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  )
}
