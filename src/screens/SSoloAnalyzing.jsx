import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { X, FED, GRAD_TXT } from '../design/tokens'
import XStatus from '../components/XStatus'
import Lens from '../components/Lens'

export default function SSoloAnalyzing() {
  const nav = useNavigate()
  const { data } = useApp()

  // Two sides = chat2 exists and invite wasn't skipped
  const bothSides = !!data.chat2 && !data.skippedInvite

  useEffect(() => {
    const t = setTimeout(() => nav('/paywall'), 6500)
    return () => clearTimeout(t)
  }, [nav])

  return (
    <div style={{
      position: 'relative', flex: 1, background: X.ink,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      height: '100%', overflow: 'hidden',
    }}>
      <XStatus />

      {/* glow de fundo */}
      <div style={{
        position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)',
        width: 480, height: 480, borderRadius: '50%',
        background: `radial-gradient(circle, ${X.acc1}22 0%, transparent 65%)`,
        filter: 'blur(70px)', pointerEvents: 'none',
      }}/>

      {/* Orb */}
      <Lens size={180} intensity={1.5} />

      {/* Texto */}
      <div style={{ marginTop: 40, textAlign: 'center', padding: '0 36px' }}>
        <h1 style={{
          margin: 0, fontFamily: FED, fontSize: 28, fontWeight: 400,
          letterSpacing: -0.8, lineHeight: 1.15, color: X.text,
        }}>
          {bothSides ? (
            <>A calcular o veredito{' '}
            <em style={{ fontFamily: FED, fontStyle: 'italic', background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              com as duas versões.
            </em></>
          ) : (
            <>Aguarde enquanto a Mara{' '}
            <em style={{ fontFamily: FED, fontStyle: 'italic', background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              conclui o veredito.
            </em></>
          )}
        </h1>
        <p style={{ margin: '14px 0 0', fontSize: 13.5, color: X.textSoft, lineHeight: 1.6 }}>
          {bothSides
            ? 'A cruzar as duas perspectivas com base em psicologia clínica e frameworks de Gottman.'
            : 'A cruzar o que você compartilhou com padrões clínicos de psicologia relacional.'}
        </p>
      </div>

      {/* Três pontos a pulsar */}
      <div style={{ marginTop: 36, display: 'flex', gap: 8 }}>
        {[0, 0.2, 0.4].map(delay => (
          <div key={delay} style={{
            width: 7, height: 7, borderRadius: '50%',
            background: X.acc1,
            animation: `dotPulse 1.4s ${delay}s ease-in-out infinite`,
          }}/>
        ))}
      </div>

      <style>{`
        @keyframes dotPulse {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.75); }
          40%            { opacity: 1;   transform: scale(1);    }
        }
      `}</style>
    </div>
  )
}
