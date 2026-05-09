import { useNavigate } from 'react-router-dom'
import { X, FED, GRAD, GRAD_TXT } from '../design/tokens'
import XStatus from '../components/XStatus'
import XBack from '../components/XBack'
import XBtn from '../components/XBtn'
import Card from '../components/Card'

export default function S07Complete() {
  const nav = useNavigate()

  return (
    <div style={{ position: 'relative', flex: 1, background: X.ink, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <XStatus />
      <div style={{ padding: '20px 28px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginTop: 18 }}><XBack onClick={() => nav('/replied')} /></div>

        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 1.6, color: X.acc1, textTransform: 'uppercase' }}>análise concluída</div>
          <h1 style={{
            margin: '10px 0 0', fontFamily: FED, fontSize: 44, fontWeight: 400,
            letterSpacing: -1.4, lineHeight: 1.0, color: X.text,
          }}>
            Interrogação<br/>
            <em style={{
              fontFamily: FED, fontSize: 44, fontWeight: 400, fontStyle: 'italic',
              letterSpacing: -1, lineHeight: 1,
              background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>completa.</em>
          </h1>
          <p style={{ margin: '12px 0 0', fontSize: 14.5, color: X.textSoft, lineHeight: 1.5 }}>
            Análise imparcial baseada em ambas as versões.
          </p>
        </div>

        {/* Stats grid */}
        <div style={{ marginTop: 26, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[{ v: '2', l: 'versões' }, { v: '28', l: 'perguntas' }, { v: '1', l: 'veredicto' }].map((s, i) => (
            <Card key={i} style={{ padding: '20px 12px', textAlign: 'center' }}>
              <div style={{
                fontFamily: FED, fontSize: 44, fontWeight: 400, letterSpacing: -1.5, lineHeight: 1,
                background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>{s.v}</div>
              <div style={{ fontSize: 11, color: X.textSoft, marginTop: 8, letterSpacing: 1.2, textTransform: 'uppercase' }}>{s.l}</div>
            </Card>
          ))}
        </div>

        {/* Summary card */}
        <Card raised style={{ marginTop: 14, padding: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, color: X.acc1, textTransform: 'uppercase' }}>resumo</div>
          <div style={{ fontSize: 14, fontFamily: FED, fontStyle: 'italic', lineHeight: 1.5, color: X.text, marginTop: 8 }}>
            "Cruzámos as duas versões em 28 perguntas. O padrão é claro — uma das partes tem responsabilidade desproporcional."
          </div>
        </Card>

        <div style={{ flex: 1 }} />

        <XBtn primary onClick={() => nav('/paywall')}>
          Ver veredicto
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 7h10m0 0L8 3m4 4l-4 4" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </XBtn>
        <div style={{
          marginTop: 10, height: 44, borderRadius: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontSize: 13, color: X.textSoft, cursor: 'pointer',
        }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v8m0 0L4 6.5m2.5 2.5L9 6.5M2 11h9" stroke={X.textSoft} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Guardar relatório (PDF)
        </div>
      </div>
    </div>
  )
}
