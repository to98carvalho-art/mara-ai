import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FUI, FED, GRAD, GRAD_TXT } from '../design/tokens'
import Lens from '../components/Lens'
import Card from '../components/Card'
import XStatus from '../components/XStatus'

const ease = [0.22, 1, 0.36, 1]

const CSS = `
@keyframes wUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
.w1 { animation: wUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
.w2 { animation: wUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.15s both; }
.w3 { animation: wUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.25s both; }
.w4 { animation: wUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.35s both; }
.w5 { animation: wUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.45s both; }
.w6 { animation: wUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.55s both; }
.w7 { animation: wUp 0.7s cubic-bezier(0.22,1,0.36,1) 0.65s both; }
`

function Wordmark({ size = 26 }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: size > 30 ? 9 : 6 }}>
      <span style={{
        fontFamily: FED, fontSize: size, fontWeight: 500, fontStyle: 'italic',
        letterSpacing: size > 30 ? -1.8 : -0.6,
        background: GRAD_TXT,
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      }}>mara</span>
      <span style={{
        width: size > 30 ? 8 : 5, height: size > 30 ? 8 : 5,
        borderRadius: 4, display: 'inline-block', background: GRAD,
        marginBottom: size > 30 ? 7 : 2, flexShrink: 0,
      }}/>
      <span style={{
        fontFamily: FUI,
        fontSize: size > 30 ? size * 0.42 : size * 0.42,
        fontWeight: 800, letterSpacing: size > 30 ? 2.4 : 1.4,
        color: X.textSoft, textTransform: 'uppercase',
      }}>ai</span>
    </div>
  )
}

export default function S01Welcome() {
  const nav = useNavigate()
  const [phase, setPhase] = useState(() =>
    sessionStorage.getItem('introDone') ? 'welcome' : 'splash'
  )

  useEffect(() => {
    if (phase !== 'splash') return
    const t = setTimeout(() => {
      setPhase('welcome')
      sessionStorage.setItem('introDone', '1')
    }, 2600)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      position: 'relative', flex: 1, background: X.ink,
      display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',
    }}>
      <XStatus />

      {/* glow */}
      <div style={{
        position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 500, borderRadius: '50%',
        background: `radial-gradient(circle, ${X.acc1}33 0%, transparent 60%)`,
        filter: 'blur(40px)', pointerEvents: 'none',
      }}/>

      <AnimatePresence mode="wait">

        {/* ── SPLASH ─────────────────────────────────────── */}
        {phase === 'splash' && (
          <motion.div
            key="splash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease }}
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 24,
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 1.0, ease }}
            >
              <Wordmark size={42} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.82 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, duration: 1.1, ease }}
            >
              <Lens size={120} intensity={1.5} />
            </motion.div>
          </motion.div>
        )}

        {/* ── WELCOME ────────────────────────────────────── */}
        {phase === 'welcome' && (
          <motion.div
            key="welcome"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, ease }}
            style={{
              position: 'relative', padding: '32px 32px 40px',
              flex: 1, display: 'flex', flexDirection: 'column',
            }}
          >
            <style>{CSS}{`
              @media (min-width: 600px) {
                .welcome-inner {
                  flex-direction: row !important;
                  align-items: center;
                  gap: 80px !important;
                  max-width: 960px;
                  margin: 0 auto;
                  width: 100%;
                  padding: 0 40px;
                }
                .welcome-left { flex: 1; }
                .welcome-right { flex: 1; display: flex; flex-direction: column; gap: 16px; }
                .welcome-lens { display: flex; justify-content: center; }
              }
            `}</style>

            <div className="w1" style={{ marginTop: 18, maxWidth: 960, margin: '18px auto 0', width: '100%', padding: '0 40px' }}>
              <Wordmark size={26} />
            </div>

            <div className="welcome-inner w2" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 28 }}>

              <div className="welcome-left">
                <div className="welcome-lens">
                  <Lens size={160} intensity={1.3} />
                </div>
              </div>

              <div className="welcome-right" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div>
                  <div className="w3" style={{
                    fontSize: 12, fontWeight: 700, letterSpacing: 1.6,
                    color: X.acc1, textTransform: 'uppercase', marginBottom: 12,
                  }}>mediação imparcial</div>

                  <div className="w4">
                    <h1 style={{
                      margin: 0, fontFamily: FED, fontSize: 52, fontWeight: 400,
                      letterSpacing: -2, lineHeight: 1.05, color: X.text,
                    }}>
                      Quem tem<br/>
                      <em style={{
                        display: 'inline-block',
                        fontFamily: FED, fontSize: 52, fontWeight: 400, fontStyle: 'italic',
                        letterSpacing: -1, lineHeight: 1.1, paddingRight: 6,
                        background: GRAD_TXT,
                        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                      }}>razão?</em>
                    </h1>
                  </div>

                  <div className="w4">
                    <p style={{ margin: '16px 0 0', fontSize: 15, color: X.textSoft, lineHeight: 1.5, maxWidth: 340 }}>
                      Conta a sua versão. A Mara escuta os dois lados — e diz com clareza.
                    </p>
                  </div>
                </div>

                <div className="w5">
                  <Card style={{ padding: 6, borderRadius: 999, display: 'flex', alignItems: 'center', gap: 6 }} raised>
                    <div
                      onClick={() => nav('/explain')}
                      style={{ flex: 1, padding: '0 18px', fontSize: 15, color: X.textMute, cursor: 'text' }}
                    >
                      Me conta o que aconteceu…
                    </div>
                    <div
                      onClick={() => nav('/explain')}
                      style={{
                        width: 44, height: 44, borderRadius: 22, background: GRAD,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 6px 16px ${X.acc1}55`, cursor: 'pointer', flexShrink: 0,
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14">
                        <path d="M2 7h10m0 0L8 3m4 4l-4 4" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </Card>
                </div>

                <div className="w6">
                  <div
                    onClick={() => nav('/code')}
                    style={{
                      height: 48, borderRadius: 999,
                      border: `1px solid ${X.line}`, background: 'rgba(255,255,255,0.03)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      cursor: 'pointer',
                      fontSize: 14, fontWeight: 600, fontFamily: FUI,
                      color: X.textSoft, letterSpacing: -0.1,
                    }}
                  >
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <rect x="1" y="3" width="13" height="9" rx="2" stroke={X.textMute} strokeWidth="1.3"/>
                      <path d="M4 7.5h2M7.5 7.5h2M11 7.5h0" stroke={X.textMute} strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    Tenho um código
                  </div>
                </div>

                <div className="w7" style={{ textAlign: 'center', fontSize: 11.5, color: X.textMute, lineHeight: 1.55 }}>
                  Ao continuar, aceitas a nossa{' '}
                  <span onClick={() => nav('/privacy')} style={{ color: X.acc1, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2 }}>Política de Privacidade</span>
                  {' '}e os{' '}
                  <span onClick={() => nav('/terms')} style={{ color: X.acc1, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2 }}>Termos e Condições</span>.
                </div>
              </div>
            </div>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
