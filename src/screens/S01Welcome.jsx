import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, FUI, FED, GRAD, GRAD_TXT } from '../design/tokens'
import Lens from '../components/Lens'
import XStatus from '../components/XStatus'

const ease = [0.22, 1, 0.36, 1]

const CSS = `
@keyframes wUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
.w1 { animation: wUp 0.65s cubic-bezier(0.22,1,0.36,1) 0.05s both; }
.w2 { animation: wUp 0.65s cubic-bezier(0.22,1,0.36,1) 0.15s both; }
.w3 { animation: wUp 0.65s cubic-bezier(0.22,1,0.36,1) 0.25s both; }
.w4 { animation: wUp 0.65s cubic-bezier(0.22,1,0.36,1) 0.35s both; }
.w5 { animation: wUp 0.65s cubic-bezier(0.22,1,0.36,1) 0.45s both; }
.w6 { animation: wUp 0.65s cubic-bezier(0.22,1,0.36,1) 0.55s both; }
.w7 { animation: wUp 0.65s cubic-bezier(0.22,1,0.36,1) 0.65s both; }
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
        fontSize: size * 0.42,
        fontWeight: 800, letterSpacing: size > 30 ? 2.4 : 1.4,
        color: X.textSoft, textTransform: 'uppercase',
      }}>ai</span>
    </div>
  )
}

const STEPS = [
  { n: '1', label: 'Conversas com a Mara', sub: 'Ela faz perguntas sobre o que aconteceu' },
  { n: '2', label: 'Análise clínica', sub: 'Identifica padrões, dinâmicas e comportamentos' },
  { n: '3', label: 'O teu veredito', sub: 'Quem tem razão, porquê, e o que fazer a seguir' },
]

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
        position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)',
        width: 480, height: 480, borderRadius: '50%',
        background: `radial-gradient(circle, ${X.acc1}28 0%, transparent 65%)`,
        filter: 'blur(50px)', pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'absolute', bottom: 40, right: -60,
        width: 280, height: 280, borderRadius: '50%',
        background: `radial-gradient(circle, ${X.acc2}18 0%, transparent 65%)`,
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
            transition={{ duration: 0.45, ease }}
            style={{
              position: 'relative', flex: 1, display: 'flex', flexDirection: 'column',
              padding: '0 24px 32px', overflowY: 'auto',
            }}
          >
            <style>{CSS}</style>

            {/* Logo */}
            <div className="w1" style={{ paddingTop: 20, paddingBottom: 4 }}>
              <Wordmark size={26} />
            </div>

            {/* Lens + headline */}
            <div className="w2" style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 24 }}>
              <Lens size={52} intensity={0.8} />
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.8, textTransform: 'uppercase', color: X.acc1, marginBottom: 6 }}>
                  psicóloga de IA
                </div>
                <h1 style={{ margin: 0, fontFamily: FED, fontSize: 42, fontWeight: 400, letterSpacing: -1.6, lineHeight: 1.0, color: X.text }}>
                  Quem tem{' '}
                  <em style={{
                    fontFamily: FED, fontStyle: 'italic', fontSize: 42,
                    background: GRAD_TXT, WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                  }}>razão?</em>
                </h1>
              </div>
            </div>

            {/* Descrição */}
            <div className="w3" style={{ marginTop: 18 }}>
              <p style={{ margin: 0, fontSize: 15.5, color: X.textSoft, lineHeight: 1.6, maxWidth: 340 }}>
                Estás em conflito e não sabes se tens razão? A Mara ouve o que aconteceu, analisa com base em psicologia clínica e dá-te uma resposta clara.
              </p>
            </div>

            {/* Como funciona */}
            <div className="w4" style={{ marginTop: 24 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', color: X.textMute, marginBottom: 12 }}>
                como funciona
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {STEPS.map((s, i) => (
                  <div key={s.n} style={{ display: 'flex', gap: 14, paddingBottom: i < STEPS.length - 1 ? 14 : 0, position: 'relative' }}>
                    {/* linha vertical */}
                    {i < STEPS.length - 1 && (
                      <div style={{ position: 'absolute', left: 14, top: 30, bottom: 0, width: 1, background: `${X.acc1}25` }}/>
                    )}
                    <div style={{
                      width: 28, height: 28, borderRadius: 14, flexShrink: 0, zIndex: 1,
                      background: `${X.acc1}18`, border: `1px solid ${X.acc1}40`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, color: X.acc1, fontFamily: FUI,
                    }}>
                      {s.n}
                    </div>
                    <div style={{ paddingTop: 4 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: X.text, letterSpacing: -0.2 }}>{s.label}</div>
                      <div style={{ fontSize: 12.5, color: X.textMute, marginTop: 2 }}>{s.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Destaque do veredito */}
            <div className="w5" style={{
              marginTop: 22, borderRadius: 18, padding: '16px 18px',
              background: `linear-gradient(135deg, ${X.acc1}14 0%, ${X.acc2}10 100%)`,
              border: `1px solid ${X.acc1}30`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22 }}>⚖️</span>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: X.text, letterSpacing: -0.2 }}>
                    Veredito honesto e imparcial
                  </div>
                  <div style={{ fontSize: 12.5, color: X.textSoft, marginTop: 3, lineHeight: 1.45 }}>
                    Sem julgamentos. Sem lados. A verdade baseada em evidência.
                  </div>
                </div>
              </div>
            </div>

            <div style={{ flex: 1, minHeight: 20 }} />

            {/* CTA principal */}
            <div className="w6">
              <div
                onClick={() => nav('/mode')}
                style={{
                  height: 56, borderRadius: 999, background: GRAD, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  boxShadow: `0 10px 32px ${X.acc1}45`,
                  fontSize: 16, fontWeight: 700, fontFamily: FUI, color: '#fff',
                  letterSpacing: -0.2,
                }}
              >
                Quero o meu veredito
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8h10m0 0L9 4m4 4l-4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Tenho um código */}
            <div className="w6" style={{ marginTop: 10 }}>
              <div
                onClick={() => nav('/code')}
                style={{
                  height: 48, borderRadius: 999,
                  border: `1px solid ${X.line}`, background: 'rgba(255,255,255,0.03)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: FUI,
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

            {/* Legal */}
            <div className="w7" style={{ marginTop: 16, textAlign: 'center', fontSize: 11.5, color: X.textMute, lineHeight: 1.55 }}>
              Ao continuar, aceitas a nossa{' '}
              <span onClick={() => nav('/privacy')} style={{ color: X.acc1, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2 }}>Política de Privacidade</span>
              {' '}e os{' '}
              <span onClick={() => nav('/terms')} style={{ color: X.acc1, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2 }}>Termos e Condições</span>.
            </div>

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
