import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { X, FUI, FED, GRAD, GRAD_TXT } from '../design/tokens'
import XStatus from '../components/XStatus'
import XBack from '../components/XBack'

export default function S02Mode() {
  const nav = useNavigate()
  const { update } = useApp()

  function choose(mode) {
    update({ mode })
    nav('/chat')
  }

  return (
    <div style={{
      position: 'relative', flex: 1, background: X.ink,
      display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden',
    }}>
      <XStatus />

      {/* glows */}
      <div style={{ position: 'absolute', top: -60, left: '30%', width: 340, height: 340, borderRadius: '50%', background: `radial-gradient(circle, ${X.acc1}20 0%, transparent 70%)`, filter: 'blur(60px)', pointerEvents: 'none' }}/>
      <div style={{ position: 'absolute', bottom: 60, right: -40, width: 260, height: 260, borderRadius: '50%', background: `radial-gradient(circle, ${X.acc2}18 0%, transparent 70%)`, filter: 'blur(50px)', pointerEvents: 'none' }}/>

      <div style={{ position: 'relative', padding: '16px 24px 36px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginTop: 10 }}><XBack onClick={() => nav('/explain')} /></div>

        {/* Título */}
        <div style={{ marginTop: 32, marginBottom: 32 }}>
          <h1 style={{ margin: 0, fontFamily: FED, fontSize: 42, fontWeight: 400, letterSpacing: -1.6, lineHeight: 1.0, color: X.text }}>
            Como queres<br/>
            <em style={{
              fontFamily: FED, fontStyle: 'italic', fontSize: 42,
              background: GRAD_TXT, WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>começar?</em>
          </h1>
        </div>

        {/* Opção A — convidar */}
        <div
          onClick={() => choose('invite')}
          style={{
            position: 'relative', borderRadius: 22, padding: '22px 22px', cursor: 'pointer',
            background: `linear-gradient(145deg, ${X.acc1}18 0%, ${X.acc1}06 100%)`,
            border: `1px solid ${X.acc1}50`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', color: X.acc1 }}>
              mais preciso
            </div>
            <div style={{ padding: '3px 10px', borderRadius: 999, fontSize: 9.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: X.acc1, background: `${X.acc1}18`, border: `1px solid ${X.acc1}35` }}>
              recomendado
            </div>
          </div>
          <h2 style={{ margin: 0, fontFamily: FED, fontSize: 26, fontWeight: 400, letterSpacing: -0.8, lineHeight: 1.1, color: X.text }}>
            Ouvir{' '}
            <em style={{ fontFamily: FED, fontStyle: 'italic', background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              os dois lados
            </em>
          </h2>
          <p style={{ margin: '8px 0 0', fontSize: 13.5, color: X.textSoft, lineHeight: 1.5 }}>
            Convidas o outro lado. Veredito muito mais justo.
          </p>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: 34, height: 34, borderRadius: 17, background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${X.acc1}35` }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M3 6.5h7m0 0L7 3.5m3 3l-3 3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
        </div>

        {/* Separador */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '16px 0' }}>
          <div style={{ flex: 1, height: 1, background: X.line }}/>
          <span style={{ fontSize: 11, color: X.textMute, fontWeight: 600, letterSpacing: 1 }}>OU</span>
          <div style={{ flex: 1, height: 1, background: X.line }}/>
        </div>

        {/* Opção B — sozinho */}
        <div
          onClick={() => choose('solo')}
          style={{
            position: 'relative', borderRadius: 22, padding: '22px 22px', cursor: 'pointer',
            background: `linear-gradient(145deg, ${X.acc2}14 0%, ${X.acc2}06 100%)`,
            border: `1px solid ${X.acc2}45`,
          }}
        >
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', color: X.acc2, marginBottom: 10 }}>
            imediato
          </div>
          <h2 style={{ margin: 0, fontFamily: FED, fontSize: 26, fontWeight: 400, letterSpacing: -0.8, lineHeight: 1.1, color: X.text }}>
            Só a{' '}
            <em style={{ fontFamily: FED, fontStyle: 'italic', background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              minha versão
            </em>
          </h2>
          <p style={{ margin: '8px 0 0', fontSize: 13.5, color: X.textSoft, lineHeight: 1.5 }}>
            Resultado imediato com base no seu relato.
          </p>
          <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: 34, height: 34, borderRadius: 17, background: `linear-gradient(135deg, ${X.acc2}, ${X.accDeep})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${X.acc2}35` }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M3 6.5h7m0 0L7 3.5m3 3l-3 3" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 20, textAlign: 'center', fontSize: 12, color: X.textMute }}>
          🔒 confidencial
        </div>
      </div>
    </div>
  )
}
