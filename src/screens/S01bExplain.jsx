import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { X, FUI, FED, GRAD, GRAD_TXT } from '../design/tokens'
import Lens from '../components/Lens'
import XStatus from '../components/XStatus'

const ease = [0.22, 1, 0.36, 1]

const STEPS = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M4 6a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2H9l-5 4V6z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/>
        <path d="M9 10h10M9 13h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    label: 'Contas',
    sub: 'o conflito',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="9" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M14 10v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="14" cy="14" r="2" fill="currentColor" opacity="0.3"/>
      </svg>
    ),
    label: 'Mara analisa',
    sub: 'psicologia clínica',
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 4l1.5 4.5H20l-3.7 2.7 1.4 4.3L14 13l-3.7 2.5 1.4-4.3L8 8.5h4.5L14 4z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
        <path d="M8 22h12M11 19v3M17 19v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    label: 'Veredito',
    sub: 'quem tem razão',
  },
]

export default function S01bExplain() {
  const nav = useNavigate()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      position: 'relative', flex: 1, background: X.ink,
      display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',
    }}>
      <XStatus />

      {/* glows */}
      <div style={{
        position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
        width: 400, height: 400, borderRadius: '50%',
        background: `radial-gradient(circle, ${X.acc1}22 0%, transparent 65%)`,
        filter: 'blur(60px)', pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'absolute', bottom: 0, right: 0,
        width: 250, height: 250, borderRadius: '50%',
        background: `radial-gradient(circle, ${X.acc2}18 0%, transparent 65%)`,
        filter: 'blur(40px)', pointerEvents: 'none',
      }}/>

      <div style={{
        position: 'relative', flex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '24px 32px 40px',
        gap: 0,
      }}>

        {/* Pequeno label */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.05, ease }}
          style={{
            fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase',
            color: X.acc1, marginBottom: 28,
          }}
        >
          como funciona
        </motion.div>

        {/* Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0, width: '100%', maxWidth: 280 }}>
          {STEPS.map((step, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

              {/* Card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.88, y: 16 }}
                animate={visible ? { opacity: 1, scale: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: 0.15 + i * 0.14, ease }}
                style={{
                  width: '100%',
                  borderRadius: 20,
                  padding: '18px 22px',
                  display: 'flex', alignItems: 'center', gap: 16,
                  background: i === 2
                    ? `linear-gradient(135deg, ${X.acc1}20 0%, ${X.acc2}14 100%)`
                    : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${i === 2 ? X.acc1 + '45' : X.line}`,
                  boxShadow: i === 2 ? `0 8px 32px ${X.acc1}20` : 'none',
                }}
              >
                {/* Icon circle */}
                <div style={{
                  width: 52, height: 52, borderRadius: 16, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: i === 2 ? GRAD : `${X.acc1}14`,
                  color: i === 2 ? '#fff' : X.acc1,
                  boxShadow: i === 2 ? `0 6px 18px ${X.acc1}35` : 'none',
                }}>
                  {i === 1 ? <Lens size={28} intensity={0.9} /> : step.icon}
                </div>

                {/* Text */}
                <div>
                  <div style={{
                    fontFamily: FED, fontSize: 22, fontWeight: 400,
                    letterSpacing: -0.7, lineHeight: 1.1,
                    color: X.text,
                    ...(i === 2 ? {
                      background: GRAD_TXT,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    } : {}),
                  }}>
                    {i === 2
                      ? <em style={{ fontFamily: FED, fontStyle: 'italic' }}>{step.label}</em>
                      : step.label}
                  </div>
                  <div style={{ fontSize: 12.5, color: X.textMute, marginTop: 3 }}>
                    {step.sub}
                  </div>
                </div>

                {/* Step number */}
                <div style={{
                  marginLeft: 'auto', flexShrink: 0,
                  width: 24, height: 24, borderRadius: 12,
                  background: 'rgba(255,255,255,0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: X.textMute, fontFamily: FUI,
                }}>
                  {i + 1}
                </div>
              </motion.div>

              {/* Connector arrow */}
              {i < STEPS.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={visible ? { opacity: 1 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.14, ease }}
                  style={{ padding: '6px 0' }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2v12m0 0l-4-4m4 4l4-4" stroke={X.acc1} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" opacity="0.5"/>
                  </svg>
                </motion.div>
              )}
            </div>
          ))}
        </div>

        {/* Tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={visible ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.65, ease }}
          style={{
            marginTop: 28,
            fontSize: 13, color: X.textMute, textAlign: 'center',
            fontFamily: FUI, letterSpacing: 0.1,
          }}
        >
          🔒 confidencial · resultado em minutos
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={visible ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.75, ease }}
          style={{ width: '100%', maxWidth: 280, marginTop: 24 }}
        >
          <div
            onClick={() => nav('/mode')}
            style={{
              height: 54, borderRadius: 999, background: GRAD, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: `0 10px 28px ${X.acc1}40`,
              fontSize: 15, fontWeight: 700, fontFamily: FUI, color: '#fff',
              letterSpacing: -0.1,
            }}
          >
            Continuar
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <path d="M3 7.5h9m0 0L8 3.5m4 4l-4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
