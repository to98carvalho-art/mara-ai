import { useNavigate } from 'react-router-dom'
import { X, FED, FNUM, GRAD, GRAD_TXT } from '../design/tokens'
import XStatus from '../components/XStatus'
import XBtn from '../components/XBtn'
import Card from '../components/Card'

export default function S08Paywall() {
  const nav = useNavigate()

  return (
    <div style={{ position: 'relative', flex: 1, background: X.ink, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <XStatus />
      <div style={{ padding: '20px 28px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
          <div
            onClick={() => nav('/')}
            style={{
              padding: '6px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700,
              letterSpacing: 1.2, textTransform: 'uppercase',
              color: X.textSoft, background: 'rgba(255,255,255,0.04)', border: `1px solid ${X.line}`,
              cursor: 'pointer',
            }}>×</div>
        </div>

        <div style={{ marginTop: 16, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          {/* lock icon */}
          <div style={{
            width: 56, height: 56, borderRadius: 28,
            background: 'rgba(155,123,255,0.10)', border: `1px solid ${X.line}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="22" height="24" viewBox="0 0 22 24" fill="none">
              <path d="M5 10V7a6 6 0 1112 0v3" stroke={X.acc1} strokeWidth="1.6"/>
              <rect x="2" y="10" width="18" height="13" rx="2.5" stroke={X.acc1} strokeWidth="1.6"/>
            </svg>
          </div>
          <h1 style={{ margin: 0, fontFamily: FED, fontSize: 32, fontWeight: 700, letterSpacing: -0.2, lineHeight: 1.1, color: X.text }}>
            O resultado<br/>
            <em style={{
              fontFamily: FED, fontSize: 32, fontWeight: 700, fontStyle: 'italic',
              letterSpacing: -0.2, lineHeight: 1,
              background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>está pronto.</em>
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: X.textSoft, maxWidth: 270, lineHeight: 1.5 }}>
            Desbloqueia para ver quem teve razão e como resolver.
          </p>
        </div>

        {/* Blurred preview */}
        <Card raised style={{ marginTop: 22, padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: X.textSoft, fontFamily: FED, fontStyle: 'italic' }}>Ana</div>
              <div style={{ fontFamily: FNUM, fontSize: 36, fontWeight: 300, letterSpacing: -0.2, lineHeight: 1, color: X.acc1, filter: 'blur(10px)' }}>30%</div>
            </div>
            <div style={{ width: 1, height: 48, background: X.line }}/>
            <div style={{ flex: 1, textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: X.textSoft, fontFamily: FED, fontStyle: 'italic' }}>Rui</div>
              <div style={{ fontFamily: FNUM, fontSize: 36, fontWeight: 300, letterSpacing: -0.2, lineHeight: 1, color: X.acc2, filter: 'blur(10px)' }}>70%</div>
            </div>
          </div>
          <div style={{ marginTop: 14, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', display: 'flex', filter: 'blur(2px)' }}>
            <div style={{ width: '30%', background: X.acc1, opacity: 0.5 }}/>
            <div style={{ flex: 1, background: X.acc2, opacity: 0.5 }}/>
          </div>
        </Card>

        {/* Price */}
        <div style={{ marginTop: 22, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8 }}>
            <span style={{ fontFamily: FED, fontSize: 44, fontWeight: 700, letterSpacing: -0.5, lineHeight: 1, color: X.text }}>€4,99</span>
          </div>
          <div style={{ fontSize: 12, color: X.textMute, marginTop: 4 }}>Pagamento único · sem subscrições</div>
        </div>

        <div style={{ flex: 1 }} />

        <XBtn primary onClick={() => nav('/verdict')}>
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 6V4a3.5 3.5 0 117 0v2m-9 0h11v7H1z" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinejoin="round"/></svg>
          Desbloquear veredicto
        </XBtn>
        <div style={{ marginTop: 12, display: 'flex', justifyContent: 'center', gap: 10, fontSize: 11, color: X.textMute }}>
          <span>✓ pagamento seguro</span>
          <span>·</span>
          <span>✓ apple pay · g pay · cartão</span>
        </div>
      </div>
    </div>
  )
}
