import { useNavigate } from 'react-router-dom'
import { X, FUI, FED, GRAD, GRAD_TXT } from '../design/tokens'
import Lens from '../components/Lens'
import Wordmark from '../components/Wordmark'
import Card from '../components/Card'
import XStatus from '../components/XStatus'

export default function S01Welcome() {
  const nav = useNavigate()

  return (
    <div style={{ position: 'relative', flex: 1, background: X.ink, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <XStatus />
      {/* atmospheric glow */}
      <div style={{
        position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 500, borderRadius: '50%',
        background: `radial-gradient(circle, ${X.acc1}33 0%, transparent 60%)`,
        filter: 'blur(40px)', pointerEvents: 'none',
      }}/>

      <div style={{ position: 'relative', padding: '32px 32px 40px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginTop: 18 }}>
          <Wordmark size={26} />
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 28 }}>
          <Lens size={120} intensity={1.3} />

          <div>
            <div style={{
              fontSize: 12, fontWeight: 700, letterSpacing: 1.6,
              color: X.acc1, textTransform: 'uppercase', marginBottom: 12,
            }}>mediação imparcial</div>
            <h1 style={{
              margin: 0, fontFamily: FED, fontSize: 52, fontWeight: 700,
              letterSpacing: -2, lineHeight: 1.05, color: X.text,
            }}>
              Quem tem<br/>
              <em style={{
                display: 'inline-block',
                fontFamily: FED, fontSize: 52, fontWeight: 700, fontStyle: 'italic',
                letterSpacing: -0.2, lineHeight: 1.1, paddingRight: 6,
                background: GRAD_TXT,
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>razão?</em>
            </h1>
            <p style={{ margin: '16px 0 0', fontSize: 15, color: X.textSoft, lineHeight: 1.5, maxWidth: 280 }}>
              Conta a tua versão. A Mara escuta os dois lados — e diz com clareza.
            </p>
          </div>
        </div>

        {/* CTA — start new case */}
        <Card style={{ padding: 6, borderRadius: 999, display: 'flex', alignItems: 'center', gap: 6 }} raised>
          <div
            onClick={() => nav('/setup')}
            style={{ flex: 1, padding: '0 18px', fontSize: 15, color: X.textMute, cursor: 'text' }}
          >
            Conta-me o que aconteceu…
          </div>
          <div
            onClick={() => nav('/setup')}
            style={{
              width: 44, height: 44, borderRadius: 22, background: GRAD,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 6px 16px ${X.acc1}55`, cursor: 'pointer', flexShrink: 0,
            }}>
            <svg width="14" height="14" viewBox="0 0 14 14">
              <path d="M2 7h10m0 0L8 3m4 4l-4 4" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </Card>

        {/* Secondary CTA — enter code */}
        <div
          onClick={() => nav('/code')}
          style={{
            marginTop: 12, height: 48, borderRadius: 999,
            border: `1px solid ${X.line}`, background: 'rgba(255,255,255,0.03)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            cursor: 'pointer', transition: 'border-color .15s',
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

        {/* Social proof */}
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex' }}>
            {[X.acc1, X.acc2, X.warm].map((c, i) => (
              <div key={i} style={{
                width: 22, height: 22, borderRadius: 11,
                background: `radial-gradient(circle at 35% 30%, ${c}, ${X.accDeep})`,
                marginLeft: i === 0 ? 0 : -7, border: `2px solid ${X.ink}`,
              }}/>
            ))}
          </div>
          <span style={{ fontSize: 13, color: X.textSoft, fontVariantNumeric: 'tabular-nums' }}>
            <strong style={{ color: X.text }}>12.352</strong> casos analisados
          </span>
        </div>
      </div>
    </div>
  )
}
