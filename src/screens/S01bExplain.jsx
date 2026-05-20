import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { X, FUI, FED, FNUM, GRAD, GRAD_TXT } from '../design/tokens'
import Lens from '../components/Lens'
import XStatus from '../components/XStatus'
import XBack from '../components/XBack'

const ease = [0.22, 1, 0.36, 1]

/* ── Mock verdict preview card ───────────────────────────────────────────── */
function VerdictPreview() {
  return (
    <div style={{ position: 'relative', width: '100%' }}>

      {/* Card */}
      <div style={{
        borderRadius: 22,
        background: `linear-gradient(160deg, ${X.ink3} 0%, ${X.ink2} 100%)`,
        border: `1px solid ${X.acc1}40`,
        overflow: 'hidden',
        boxShadow: `0 20px 60px ${X.acc1}25, 0 4px 16px rgba(0,0,0,0.5)`,
      }}>

        {/* Header */}
        <div style={{
          padding: '14px 18px 12px',
          background: `linear-gradient(135deg, ${X.acc1}20 0%, ${X.acc2}10 100%)`,
          borderBottom: `1px solid ${X.acc1}20`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Lens size={24} intensity={0.7} />
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.8, textTransform: 'uppercase', color: X.acc1 }}>
              veredito mara
            </div>
            <div style={{ fontSize: 11.5, color: X.textMute, marginTop: 1 }}>análise relacional completa</div>
          </div>
          <div style={{
            marginLeft: 'auto', padding: '3px 10px', borderRadius: 999,
            background: `${X.good}18`, border: `1px solid ${X.good}40`,
            fontSize: 9.5, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: X.good,
          }}>
            concluído
          </div>
        </div>

        {/* Score visual */}
        <div style={{ padding: '16px 18px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 11, color: X.textMute, letterSpacing: 0.3, marginBottom: 2 }}>responsabilidade</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{
                  fontFamily: FNUM, fontSize: 34, fontWeight: 700, letterSpacing: -1,
                  background: GRAD_TXT, WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>72%</span>
                <span style={{ fontSize: 12, color: X.textMute }}>Ana</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, color: X.textMute, letterSpacing: 0.3, marginBottom: 2 }}>&nbsp;</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ fontFamily: FNUM, fontSize: 34, fontWeight: 700, letterSpacing: -1, color: X.textMute }}>28%</span>
                <span style={{ fontSize: 12, color: X.textMute }}>Rui</span>
              </div>
            </div>
          </div>

          {/* Bar */}
          <div style={{ height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ height: '100%', width: '72%', borderRadius: 4, background: GRAD }} />
          </div>

          {/* Verdict line */}
          <div style={{
            padding: '11px 14px', borderRadius: 12,
            background: `${X.acc1}10`, border: `1px solid ${X.acc1}25`,
            marginBottom: 14,
          }}>
            <div style={{ fontSize: 13.5, color: X.text, lineHeight: 1.5, fontStyle: 'italic', fontFamily: FED }}>
              "Ana tem razão. O comportamento repetido de Rui demonstra um padrão de invalidação emocional—"
            </div>
          </div>
        </div>

        {/* Blurred content below */}
        <div style={{ position: 'relative', padding: '0 18px', overflow: 'hidden', height: 80 }}>
          {['Padrão Gottman identificado: crítica sistemática…', 'Recomendação: estabelecer limites claros sobre…', 'Nível de risco relacional: moderado com sinais de…'].map((line, i) => (
            <div key={i} style={{
              fontSize: 12.5, color: X.textSoft, lineHeight: 1.6,
              filter: 'blur(4px)', userSelect: 'none', marginBottom: 4,
            }}>
              {line}
            </div>
          ))}
          {/* Gradient fade */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(to bottom, transparent 0%, ${X.ink2} 75%)`,
          }}/>
        </div>

        {/* Lock row */}
        <div style={{
          padding: '12px 18px 16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          borderTop: `1px solid ${X.line}`,
        }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <rect x="2" y="6" width="9" height="6" rx="1.5" stroke={X.textMute} strokeWidth="1.3"/>
            <path d="M4 6V4.5a2.5 2.5 0 015 0V6" stroke={X.textMute} strokeWidth="1.3"/>
          </svg>
          <span style={{ fontSize: 12, color: X.textMute, fontFamily: FUI, letterSpacing: 0.2 }}>
            O teu veredito fica disponível após a análise
          </span>
        </div>
      </div>

      {/* Side glow */}
      <div style={{
        position: 'absolute', top: '20%', left: -30, width: 120, height: 120,
        borderRadius: '50%', background: `${X.acc1}30`,
        filter: 'blur(30px)', pointerEvents: 'none', zIndex: -1,
      }}/>
      <div style={{
        position: 'absolute', bottom: '10%', right: -20, width: 100, height: 100,
        borderRadius: '50%', background: `${X.acc2}25`,
        filter: 'blur(25px)', pointerEvents: 'none', zIndex: -1,
      }}/>
    </div>
  )
}

/* ── Main ────────────────────────────────────────────────────────────────── */
export default function S01bExplain() {
  const nav = useNavigate()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60)
    return () => clearTimeout(t)
  }, [])

  const fade = (delay) => ({
    initial: { opacity: 0, y: 14 },
    animate: visible ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.55, delay, ease },
  })

  return (
    <div style={{
      position: 'relative', flex: 1, background: X.ink,
      display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto',
    }}>
      <XStatus />

      {/* bg glow */}
      <div style={{
        position: 'fixed', top: -80, left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 500, borderRadius: '50%',
        background: `radial-gradient(circle, ${X.acc1}18 0%, transparent 65%)`,
        filter: 'blur(60px)', pointerEvents: 'none',
      }}/>

      <div style={{ position: 'relative', padding: '16px 24px 40px', display: 'flex', flexDirection: 'column', gap: 0 }}>

        <div style={{ marginTop: 10, marginBottom: 20 }}><XBack onClick={() => nav('/')} /></div>

        {/* Headline */}
        <motion.div {...fade(0.05)} style={{ marginBottom: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.8, textTransform: 'uppercase', color: X.acc1, marginBottom: 12 }}>
            o que vais receber
          </div>
          <h1 style={{ margin: 0, fontFamily: FED, fontSize: 36, fontWeight: 400, letterSpacing: -1.3, lineHeight: 1.08, color: X.text }}>
            Uma resposta honesta.<br/>
            <em style={{
              fontFamily: FED, fontStyle: 'italic',
              background: GRAD_TXT, WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>Quem tem razão — e porquê.</em>
          </h1>
        </motion.div>

        <motion.div {...fade(0.12)} style={{ marginBottom: 24 }}>
          <p style={{ margin: 0, fontSize: 14.5, color: X.textSoft, lineHeight: 1.6, maxWidth: 320 }}>
            A Mara ouve o que aconteceu, analisa os padrões com base em psicologia clínica e entrega-te um veredito detalhado.
          </p>
        </motion.div>

        {/* Verdict preview */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={visible ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.65, delay: 0.2, ease }}
          style={{ marginBottom: 22 }}
        >
          <VerdictPreview />
        </motion.div>

        {/* Trust pills */}
        <motion.div {...fade(0.45)} style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
          {[
            { icon: '⚖️', text: 'Imparcial' },
            { icon: '🔒', text: 'Confidencial' },
            { icon: '🧠', text: 'Psicologia clínica' },
            { icon: '⚡', text: 'Em minutos' },
          ].map(({ icon, text }) => (
            <div key={text} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 999,
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${X.line}`,
              fontSize: 12.5, color: X.textSoft, fontFamily: FUI,
            }}>
              <span style={{ fontSize: 13 }}>{icon}</span>
              {text}
            </div>
          ))}
        </motion.div>

        {/* Social proof */}
        <motion.div {...fade(0.52)} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', borderRadius: 14,
          background: `${X.acc1}08`, border: `1px solid ${X.acc1}20`,
          marginBottom: 24,
        }}>
          <div style={{ display: 'flex', gap: -4 }}>
            {['#9B7BFF', '#FF6BB1', '#34D399', '#FFB36B'].map((c, i) => (
              <div key={i} style={{
                width: 26, height: 26, borderRadius: 13,
                background: c, border: `2px solid ${X.ink}`,
                marginLeft: i > 0 ? -8 : 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#fff',
              }}>
                {['A','R','C','M'][i]}
              </div>
            ))}
          </div>
          <div>
            <span style={{ fontSize: 13, fontWeight: 600, color: X.text }}>+350 vereditos entregues</span>
            <span style={{ fontSize: 12, color: X.textMute }}> esta semana</span>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div {...fade(0.6)}>
          <div
            onClick={() => nav('/mode')}
            style={{
              height: 56, borderRadius: 999, background: GRAD, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: `0 12px 32px ${X.acc1}45`,
              fontSize: 16, fontWeight: 700, fontFamily: FUI, color: '#fff',
              letterSpacing: -0.2,
            }}
          >
            Quero o meu veredito
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8h10m0 0L9 4m4 4l-4 4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </motion.div>

      </div>
    </div>
  )
}
