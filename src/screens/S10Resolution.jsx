import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { X, FED, GRAD, GRAD_TXT } from '../design/tokens'
import XStatus from '../components/XStatus'
import XBack from '../components/XBack'
import XBtn from '../components/XBtn'
import Card from '../components/Card'

const ACCENT_CYCLE = [X => X.acc2, X => X.acc1, X => X.warm, X => X.good]

export default function S10Resolution() {
  const nav = useNavigate()
  const { data } = useApp()
  const name2 = data.name2 || ''
  const verdict = data.verdict

  // Use AI-generated steps or fallback
  const steps = verdict?.resolution_steps?.length > 0
    ? verdict.resolution_steps
    : [
        { tag: 'reconhecer', title: 'Nomear o padrão', body: 'Identifica e nomeia o ciclo que se repete entre vocês — sem acusações, com factos.' },
        { tag: 'comunicar',  title: 'Falar com intenção', body: 'Escolhe um momento calmo. Começa com "eu sinto" em vez de "tu fazes".' },
        { tag: 'decidir',    title: 'Definir o próximo passo', body: 'Com base na análise, decidam juntos o que muda — ou se faz sentido continuar.' },
      ]

  const isSalvageable  = verdict?.is_relationship_salvageable ?? true
  const clinicalAnalysis = verdict?.clinical_analysis || null
  const attachStyle1 = verdict?.attachment_style_1 || null
  const attachStyle2 = verdict?.attachment_style_2 || null

  return (
    <div style={{ position: 'relative', flex: 1, background: X.ink, display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      <XStatus />
      <div style={{ padding: '20px 28px 36px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
          <XBack onClick={() => nav('/verdict')} />
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 6 }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{
                width: i === 1 ? 24 : 6, height: 4, borderRadius: 2,
                background: i <= 1 ? GRAD : 'rgba(255,255,255,0.10)',
              }}/>
            ))}
          </div>
          <div style={{
            width: 40, height: 40, borderRadius: 20, background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${X.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="3.5" cy="7" r="1.4" stroke={X.text} strokeWidth="1.2"/>
              <circle cx="10.5" cy="3.5" r="1.4" stroke={X.text} strokeWidth="1.2"/>
              <circle cx="10.5" cy="10.5" r="1.4" stroke={X.text} strokeWidth="1.2"/>
              <path d="M5 6.5l4-2M5 7.5l4 2" stroke={X.text} strokeWidth="1.2"/>
            </svg>
          </div>
        </div>

        {/* Title */}
        <div style={{ marginTop: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.6, color: X.acc1, textTransform: 'uppercase' }}>resolução</div>
          <h1 style={{ margin: '8px 0 0', fontFamily: FED, fontSize: 30, fontWeight: 400, letterSpacing: -0.9, lineHeight: 1.05, color: X.text }}>
            {isSalvageable ? (
              <>Não basta saber quem.<br/>
              <em style={{
                fontFamily: FED, fontSize: 30, fontWeight: 400, fontStyle: 'italic',
                letterSpacing: -1, lineHeight: 1,
                background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Importa o como.</em></>
            ) : (
              <>A coragem de{' '}
              <em style={{
                fontFamily: FED, fontSize: 30, fontWeight: 400, fontStyle: 'italic',
                letterSpacing: -1, lineHeight: 1,
                background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>te escolheres.</em></>
            )}
          </h1>
        </div>

        {/* Clinical analysis */}
        {clinicalAnalysis && (
          <Card style={{ marginTop: 18, padding: 18 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.4, color: X.acc1, textTransform: 'uppercase', marginBottom: 10 }}>análise clínica</div>
            <div style={{ fontSize: 13.5, color: X.textSoft, lineHeight: 1.65 }}>{clinicalAnalysis}</div>
          </Card>
        )}

        {/* Attachment styles */}
        {(attachStyle1 || attachStyle2) && (
          <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { name: data.name1 || '', style: attachStyle1 },
              { name: data.name2 || '', style: attachStyle2 },
            ].filter(s => s.style).map((s, i) => (
              <Card key={i} style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1, color: X.textMute, textTransform: 'uppercase' }}>{s.name.toLowerCase()}</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: X.acc1, marginTop: 4, textTransform: 'capitalize' }}>{s.style}</div>
                <div style={{ fontSize: 11.5, color: X.textSoft, marginTop: 2 }}>vinculação</div>
              </Card>
            ))}
          </div>
        )}

        {/* Resolution steps */}
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {steps.map((s, i) => {
            const accent = [X.acc2, X.acc1, X.warm, X.good][i % 4]
            return (
              <Card key={i} style={{ padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 12,
                  background: `${accent}1f`, color: accent,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: FED, fontSize: 16, fontWeight: 500, fontStyle: 'italic', flexShrink: 0,
                  border: `1px solid ${accent}40`,
                }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: accent }}>{s.tag}</div>
                  <div style={{ fontSize: 15.5, fontWeight: 600, marginTop: 3, letterSpacing: -0.2, color: X.text }}>{s.title}</div>
                  <div style={{ fontSize: 13, lineHeight: 1.5, color: X.textSoft, marginTop: 4 }}>{s.body}</div>
                </div>
              </Card>
            )
          })}
        </div>

        <div style={{ flex: 1, minHeight: 20 }} />

        <XBtn primary>
          <svg width="16" height="16" viewBox="0 0 16 16"><path d="M14 2L1 8l5 1.5L11 5l-3 6 1.5 3z" fill="#fff"/></svg>
          Enviar análise ao {name2}
        </XBtn>
        <div style={{
          marginTop: 10, padding: '10px 14px', borderRadius: 999,
          background: 'rgba(255,255,255,0.025)', border: `1px solid ${X.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontSize: 12, color: X.textSoft,
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 1l5 2.5v3.5c0 2.5-2 4-5 4.5C3 10.5 1 9 1 6.5V3.5z" fill="none" stroke={X.acc1} strokeWidth="1.3"/></svg>
          confidencial · só tu e o/a {name2}
        </div>
      </div>
    </div>
  )
}
