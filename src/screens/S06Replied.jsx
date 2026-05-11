import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { X, FED, FNUM, GRAD, GRAD_TXT } from '../design/tokens'
import XStatus from '../components/XStatus'
import XBack from '../components/XBack'
import Lens from '../components/Lens'
import Disc from '../components/Disc'
import Card from '../components/Card'

export default function S06Replied() {
  const nav = useNavigate()
  const { data } = useApp()
  const name2 = data.name2 || ''

  return (
    <div style={{ position: 'relative', flex: 1, background: X.ink, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <XStatus />
      {/* glow */}
      <div style={{
        position: 'absolute', top: 100, left: '50%', transform: 'translateX(-50%)',
        width: 480, height: 480, borderRadius: '50%',
        background: `radial-gradient(circle, ${X.acc2}33 0%, transparent 60%)`,
        filter: 'blur(40px)', pointerEvents: 'none',
      }}/>
      <div style={{ position: 'relative', padding: '20px 28px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginTop: 18 }}><XBack onClick={() => nav('/analyzing')} /></div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
          <Lens size={140} intensity={1.2} />

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.6, color: X.acc2, textTransform: 'uppercase' }}>respondeu</div>
            <h1 style={{
              margin: '10px 0 0', fontFamily: FED, fontSize: 44, fontWeight: 400,
              letterSpacing: -1.4, lineHeight: 1.0, color: X.text,
            }}>
              {name2} compartilhou<br/>
              <em style={{
                fontFamily: FED, fontSize: 44, fontWeight: 400, fontStyle: 'italic',
                letterSpacing: -1, lineHeight: 1,
                background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>a versão dele.</em>
            </h1>
            <p style={{ margin: '14px 0 0', fontSize: 14.5, color: X.textSoft, lineHeight: 1.5, maxWidth: 280 }}>
              A Mara já tem toda a informação. Vamos cruzar os dois lados.
            </p>
          </div>

          {/* both discs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Disc initial={data.name1?.[0]?.toLowerCase() || '?'} hue={X.acc2} size={56} />
            <div style={{ width: 22, height: 1, background: X.line }}/>
            <Lens size={26} intensity={0.4} />
            <div style={{ width: 22, height: 1, background: X.line }}/>
            <Disc initial={name2?.[0]?.toLowerCase() || '?'} hue={X.acc1} size={56} />
          </div>
        </div>

        <Card raised style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, fontFamily: FED, fontStyle: 'italic', color: X.text }}>A recalcular o veredicto…</div>
            <svg width="100%" height="20" viewBox="0 0 240 20" style={{ marginTop: 6 }}>
              {Array.from({ length: 36 }).map((_, i) => {
                const h = 3 + Math.abs(Math.sin(i * 0.6) * 12)
                return <rect key={i} x={i * 6.5} y={10 - h / 2} width="1.8" height={h} rx="1"
                  fill={i < 32 ? X.acc1 : 'rgba(155,123,255,0.20)'}/>
              })}
            </svg>
          </div>
          <div style={{
            fontFamily: FNUM, fontSize: 26, fontWeight: 400,
            background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>99%</div>
        </Card>

        <div style={{ marginTop: 14 }}>
          <button
            onClick={() => nav('/complete')}
            style={{
              width: '100%', height: 56, borderRadius: 999,
              background: GRAD, color: '#fff', border: 'none',
              fontFamily: '"Inter", sans-serif', fontWeight: 600, fontSize: 16, letterSpacing: -0.1,
              boxShadow: `0 16px 40px ${X.acc1}40`, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            Ver relatório
            <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 7h10m0 0L8 3m4 4l-4 4" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
