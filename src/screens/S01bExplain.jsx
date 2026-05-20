import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { X, FUI, FED, GRAD, GRAD_TXT } from '../design/tokens'
import Lens from '../components/Lens'
import XStatus from '../components/XStatus'
import XBack from '../components/XBack'

const ease = [0.22, 1, 0.36, 1]

const STEPS = [
  {
    visual: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M5 7a3 3 0 013-3h20a3 3 0 013 3v14a3 3 0 01-3 3H11l-6 5V7z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M11 13h14M11 18h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
    label: 'Contas o conflito',
  },
  {
    visual: <Lens size={44} intensity={1.0} />,
    label: 'Mara analisa',
  },
  {
    visual: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="13" cy="12" r="5" stroke="currentColor" strokeWidth="1.8"/>
        <circle cx="26" cy="10" r="4" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M4 28c0-4.4 4-8 9-8s9 3.6 9 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M26 18c3.3.6 6 3.2 6 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="2 2"/>
      </svg>
    ),
    label: 'Convidas o parceiro',
    sub: 'opcional — torna o veredito mais preciso',
  },
  {
    visual: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M18 4l2.5 7H28l-6 4.5 2.3 7L18 18.5l-6.3 4L14 15 8 10.5h7.5L18 4z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"/>
        <path d="M10 30h16M13 26v4M23 26v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
    ),
    label: 'Recebes um veredito',
    accent: true,
  },
  {
    visual: (
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <path d="M8 6a2 2 0 012-2h12l8 8v18a2 2 0 01-2 2H10a2 2 0 01-2-2V6z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M20 4v8h8" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
        <path d="M12 18h12M12 22h9M12 26h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    label: 'e um relatório',
    sub: 'sobre a tua relação',
    accent: true,
  },
]

export default function S01bExplain() {
  const nav = useNavigate()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60)
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
        position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
        width: 420, height: 420, borderRadius: '50%',
        background: `radial-gradient(circle, ${X.acc1}20 0%, transparent 65%)`,
        filter: 'blur(60px)', pointerEvents: 'none',
      }}/>

      <div style={{ position: 'relative', padding: '16px 32px 40px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginTop: 10 }}><XBack onClick={() => nav('/')} /></div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, delay: 0.05, ease }}
          style={{ marginTop: 32 }}
        >
          <h1 style={{ margin: 0, fontFamily: FED, fontSize: 38, fontWeight: 400, letterSpacing: -1.4, lineHeight: 1.05, color: X.text }}>
            Como funciona<br/>
            <em style={{
              fontFamily: FED, fontStyle: 'italic',
              background: GRAD_TXT, WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>a análise.</em>
          </h1>
        </motion.div>

        {/* Steps flow */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          justifyContent: 'center', gap: 0, paddingTop: 12,
        }}>
          {STEPS.map((step, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>

              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={visible ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.18 + i * 0.13, ease }}
                style={{ display: 'flex', alignItems: 'center', gap: 20, paddingLeft: 4 }}
              >
                {/* Icon */}
                <div style={{
                  width: 64, height: 64, borderRadius: 20, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: step.accent
                    ? GRAD
                    : `rgba(155,123,255,0.10)`,
                  color: step.accent ? '#fff' : X.acc1,
                  boxShadow: step.accent ? `0 8px 24px ${X.acc1}35` : 'none',
                  border: step.accent ? 'none' : `1px solid ${X.acc1}25`,
                }}>
                  {step.visual}
                </div>

                {/* Label */}
                <div>
                  <div style={{
                    fontFamily: FED, fontSize: 26, fontWeight: 400,
                    letterSpacing: -0.8, lineHeight: 1.1,
                    ...(step.accent ? {
                      background: GRAD_TXT, WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    } : { color: X.text }),
                  }}>
                    {step.accent
                      ? <em style={{ fontFamily: FED, fontStyle: 'italic' }}>{step.label}</em>
                      : step.label}
                  </div>
                  {step.sub && (
                    <div style={{ fontSize: 12, color: X.textMute, marginTop: 3, fontFamily: FUI }}>
                      {step.sub}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Connector */}
              {i < STEPS.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={visible ? { opacity: 1 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.13, ease }}
                  style={{ paddingLeft: 35, margin: '6px 0' }}
                >
                  <div style={{ width: 1, height: 32, background: `linear-gradient(to bottom, ${X.acc1}50, ${X.acc1}15)` }}/>
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.6, ease }}
        >
          <div
            onClick={() => nav('/mode')}
            style={{
              height: 56, borderRadius: 999, background: GRAD, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: `0 10px 28px ${X.acc1}40`,
              fontSize: 16, fontWeight: 700, fontFamily: FUI, color: '#fff',
            }}
          >
            Começar
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10m0 0L9 4m4 4l-4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div style={{ marginTop: 12, textAlign: 'center', fontSize: 12, color: X.textMute }}>
            🔒 confidencial · em minutos
          </div>
        </motion.div>

      </div>
    </div>
  )
}
