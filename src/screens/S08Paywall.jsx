import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { X, FED, FNUM, FUI, GRAD, GRAD_TXT } from '../design/tokens'
import XStatus from '../components/XStatus'
import XBtn from '../components/XBtn'
import Card from '../components/Card'

const LOCK = (
  <svg width="11" height="12" viewBox="0 0 11 12" fill="none">
    <path d="M2.5 5V3.5a3 3 0 016 0V5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.4"/>
    <rect x="1" y="5" width="9" height="6.5" rx="1.5" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2"/>
  </svg>
)

const REPORTS = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5l3.5-.5z" stroke={X.acc1} strokeWidth="1.3" strokeLinejoin="round"/>
      </svg>
    ),
    accent: X.acc1,
    label: 'Veredicto',
    title: 'Quem teve mais responsabilidade',
    preview: 'Análise detalhada da culpa com justificação baseada em evidências da conversa.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="5.5" stroke={X.acc2} strokeWidth="1.3"/>
        <path d="M8 5v3.5l2 1.5" stroke={X.acc2} strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
    accent: X.acc2,
    label: 'Análise Clínica',
    title: 'Diagnóstico psicológico da relação',
    preview: 'Avaliação clínica dos padrões relacionais, com base em TCC e terapia de casal.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 13s-5-3.5-5-7a5 5 0 0110 0c0 3.5-5 7-5 7z" stroke={X.warm} strokeWidth="1.3"/>
      </svg>
    ),
    accent: X.warm,
    label: 'Saúde da Relação',
    title: 'Saudável, frágil ou tóxico?',
    preview: 'Classificação clínica do estado atual da relação e dos seus padrões de interação.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="5" cy="6" r="2.2" stroke={X.good} strokeWidth="1.3"/>
        <circle cx="11" cy="6" r="2.2" stroke={X.good} strokeWidth="1.3"/>
        <path d="M1 13c0-2 1.8-3 4-3m6 3c0-2-1.8-3-4-3" stroke={X.good} strokeWidth="1.3" strokeLinecap="round"/>
        <path d="M7 9.5c.3-.3.7-.5 1-.5" stroke={X.good} strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
    accent: X.good,
    label: 'Estilos de Vinculação',
    title: 'Ansioso, evitante ou seguro?',
    preview: 'Perfil de vinculação de cada pessoa — como afeta o conflito e a comunicação.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 4h10M3 8h7M3 12h5" stroke="#FF4B6E" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
    accent: '#FF4B6E',
    label: 'Padrões de Gottman',
    title: 'Os 4 cavaleiros detetados',
    preview: 'Crítica, desprezo, defensividade e bloqueio — quais estão presentes e em quem.',
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M4 8h8M8 4l4 4-4 4" stroke={X.acc1} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    accent: X.acc1,
    label: 'Plano de Resolução',
    title: '3 passos concretos para resolver',
    preview: 'Recomendações práticas e personalizadas para mudar o que não está a funcionar.',
  },
]

export default function S08Paywall() {
  const nav = useNavigate()
  const { data } = useApp()
  const name1 = data.name1 || 'Tu'
  const name2 = data.name2 || 'a outra pessoa'

  return (
    <div style={{ position: 'relative', flex: 1, background: X.ink, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <XStatus />

      {/* glow */}
      <div style={{ position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)', width: 400, height: 300, borderRadius: '50%', background: `radial-gradient(circle, ${X.acc1}1a 0%, transparent 70%)`, filter: 'blur(50px)', pointerEvents: 'none' }}/>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px 0' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <div onClick={() => nav('/')} style={{ padding: '6px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: X.textSoft, background: 'rgba(255,255,255,0.04)', border: `1px solid ${X.line}`, cursor: 'pointer' }}>×</div>
        </div>

        {/* Title */}
        <div style={{ marginTop: 14, textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '4px 12px', borderRadius: 999, background: `${X.acc1}18`, border: `1px solid ${X.acc1}35`, marginBottom: 14 }}>
            <svg width="10" height="11" viewBox="0 0 10 11" fill="none">
              <path d="M2 4.5V3a3 3 0 016 0v1.5" stroke={X.acc1} strokeWidth="1.3"/>
              <rect x="0.5" y="4.5" width="9" height="6" rx="1.5" stroke={X.acc1} strokeWidth="1.3"/>
            </svg>
            <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: X.acc1 }}>relatório pronto</span>
          </div>
          <h1 style={{ margin: 0, fontFamily: FED, fontSize: 30, fontWeight: 400, letterSpacing: -0.9, lineHeight: 1.1, color: X.text }}>
            O teu relatório completo<br/>
            <em style={{ fontFamily: FED, fontStyle: 'italic', background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>está pronto.</em>
          </h1>
          <p style={{ margin: '10px 0 0', fontSize: 13.5, color: X.textSoft, lineHeight: 1.5 }}>
            Desbloqueia para aceder a todos os resultados.
          </p>
        </div>

        {/* Blurred verdict preview */}
        <Card raised style={{ marginTop: 20, padding: '16px 18px' }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.3, textTransform: 'uppercase', color: X.acc1, marginBottom: 12 }}>
            pré-visualização · desbloqueie para ver
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 11.5, color: X.textSoft, marginBottom: 2 }}>{name1.toLowerCase()}</div>
              <div style={{ fontFamily: FNUM, fontSize: 34, fontWeight: 300, letterSpacing: -0.5, lineHeight: 1, color: X.acc1, filter: 'blur(8px)', userSelect: 'none' }}>35%</div>
            </div>
            <div style={{ width: 1, height: 44, background: X.line }}/>
            <div style={{ flex: 1, textAlign: 'right' }}>
              <div style={{ fontSize: 11.5, color: X.textSoft, marginBottom: 2 }}>{name2.toLowerCase()}</div>
              <div style={{ fontFamily: FNUM, fontSize: 34, fontWeight: 300, letterSpacing: -0.5, lineHeight: 1, color: X.acc2, filter: 'blur(8px)', userSelect: 'none' }}>65%</div>
            </div>
          </div>
          <div style={{ marginTop: 12, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', display: 'flex', filter: 'blur(3px)' }}>
            <div style={{ width: '35%', background: X.acc1 }}/>
            <div style={{ flex: 1, background: X.acc2 }}/>
          </div>
        </Card>

        {/* Report sections */}
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {REPORTS.map((r, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px',
              borderRadius: 16, background: 'rgba(255,255,255,0.02)',
              border: `1px solid ${X.line}`,
              position: 'relative', overflow: 'hidden',
            }}>
              {/* accent left bar */}
              <div style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 2.5, borderRadius: 2, background: r.accent, opacity: 0.5 }}/>

              <div style={{ width: 34, height: 34, borderRadius: 10, background: `${r.accent}14`, border: `1px solid ${r.accent}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {r.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: r.accent, marginBottom: 2 }}>{r.label}</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: X.text, letterSpacing: -0.2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.title}</div>
                <div style={{ fontSize: 11.5, color: X.textMute, marginTop: 2, lineHeight: 1.4 }}>{r.preview}</div>
              </div>
              <div style={{ flexShrink: 0, opacity: 0.6 }}>{LOCK}</div>
            </div>
          ))}
        </div>

        <div style={{ height: 24 }} />
      </div>

      {/* Sticky bottom CTA */}
      <div style={{ padding: '14px 24px 28px', background: `linear-gradient(to bottom, transparent, ${X.ink} 30%)`, borderTop: `1px solid ${X.line}` }}>
        <div style={{ textAlign: 'center', marginBottom: 10 }}>
          <span style={{ fontFamily: FNUM, fontSize: 38, fontWeight: 300, letterSpacing: -0.5, color: X.text }}>€4,99</span>
          <span style={{ fontSize: 12, color: X.textMute, marginLeft: 8 }}>· pagamento único</span>
        </div>
        <XBtn primary onClick={() => nav('/verdict')}>
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 6V4a3.5 3.5 0 117 0v2m-9 0h11v7H1z" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinejoin="round"/></svg>
          Desbloquear relatório completo
        </XBtn>
        <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: 12, fontSize: 11, color: X.textMute }}>
          <span>✓ pagamento seguro</span>
          <span>·</span>
          <span>✓ apple pay · google pay</span>
        </div>
      </div>
    </div>
  )
}
