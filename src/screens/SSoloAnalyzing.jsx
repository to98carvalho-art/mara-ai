import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { X, FED, GRAD_TXT } from '../design/tokens'
import XStatus from '../components/XStatus'
import Lens from '../components/Lens'

const STEPS = [
  'A identificar padrões de comunicação…',
  'A cruzar com frameworks clínicos…',
  'A avaliar dinâmicas de poder e vinculação…',
  'A compor o veredicto…',
]

export default function SSoloAnalyzing() {
  const nav = useNavigate()
  const { data } = useApp()
  const name1 = data.name1 || ''

  const [stepIdx,  setStepIdx]  = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Cycle through steps every ~900ms
    const stepTimer = setInterval(() => {
      setStepIdx(prev => (prev + 1) % STEPS.length)
    }, 900)

    // Smooth progress bar over ~4s total
    const start = Date.now()
    const duration = 4000
    const progTimer = setInterval(() => {
      const elapsed = Date.now() - start
      const p = Math.min(elapsed / duration, 1)
      // ease-out curve
      setProgress(Math.round((1 - Math.pow(1 - p, 2.5)) * 100))
      if (p >= 1) {
        clearInterval(progTimer)
        clearInterval(stepTimer)
        setTimeout(() => nav('/paywall'), 300)
      }
    }, 32)

    return () => { clearInterval(stepTimer); clearInterval(progTimer) }
  }, [nav])

  return (
    <div style={{
      position: 'relative', flex: 1, background: X.ink,
      display: 'flex', flexDirection: 'column', height: '100%',
      overflow: 'hidden',
    }}>
      <XStatus />

      {/* background glows */}
      <div style={{
        position: 'absolute', top: '10%', left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 500, borderRadius: '50%',
        background: `radial-gradient(circle, ${X.acc1}28 0%, transparent 65%)`,
        filter: 'blur(60px)', pointerEvents: 'none',
      }}/>
      <div style={{
        position: 'absolute', bottom: '5%', right: '-10%',
        width: 300, height: 300, borderRadius: '50%',
        background: `radial-gradient(circle, ${X.acc2}1a 0%, transparent 70%)`,
        filter: 'blur(50px)', pointerEvents: 'none',
      }}/>

      <div style={{
        position: 'relative', flex: 1,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '0 32px 48px',
        gap: 0,
      }}>

        {/* Orb */}
        <Lens size={160} intensity={1.4} />

        {/* Title */}
        <div style={{ marginTop: 36, textAlign: 'center' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.8, textTransform: 'uppercase', color: X.acc1, marginBottom: 12 }}>
            a trabalhar
          </div>
          <h1 style={{
            margin: 0, fontFamily: FED, fontSize: 32, fontWeight: 400,
            letterSpacing: -1.2, lineHeight: 1.05, color: X.text,
          }}>
            A Mara está a{' '}
            <em style={{
              fontFamily: FED, fontStyle: 'italic',
              background: GRAD_TXT, WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>analisar.</em>
          </h1>
          {name1 && (
            <p style={{ margin: '10px 0 0', fontSize: 14, color: X.textSoft, lineHeight: 1.5 }}>
              Com base no que partilhaste, {name1}.
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div style={{ marginTop: 40, width: '100%', maxWidth: 280 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 11, color: X.textMute, letterSpacing: 0.3 }}>{STEPS[stepIdx]}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: X.acc1, flexShrink: 0, marginLeft: 8 }}>{progress}%</div>
          </div>
          <div style={{ height: 3, borderRadius: 2, background: 'rgba(155,123,255,0.12)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 2,
              background: `linear-gradient(90deg, ${X.acc1}, ${X.acc2})`,
              width: `${progress}%`,
              transition: 'width 0.1s linear',
              boxShadow: `0 0 8px ${X.acc1}80`,
            }}/>
          </div>
        </div>

        {/* Disclaimer */}
        <div style={{
          marginTop: 32, display: 'flex', alignItems: 'center', gap: 6,
          fontSize: 12, color: X.textMute,
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1l5 2.5v3.5c0 2.5-2 4-5 4.5C3 10.5 1 9 1 6.5V3.5z" fill="none" stroke={X.acc1} strokeWidth="1.3"/>
          </svg>
          análise confidencial e baseada em psicologia clínica
        </div>
      </div>
    </div>
  )
}
