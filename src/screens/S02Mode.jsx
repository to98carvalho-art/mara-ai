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
        <div style={{ marginTop: 10 }}><XBack onClick={() => nav('/')} /></div>

        {/* Título */}
        <div style={{ marginTop: 28, marginBottom: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.8, textTransform: 'uppercase', color: X.acc1, marginBottom: 12 }}>
            como queres começar?
          </div>
          <h1 style={{ margin: 0, fontFamily: FED, fontSize: 36, fontWeight: 400, letterSpacing: -1.2, lineHeight: 1.05, color: X.text }}>
            Escolhe a forma de<br/>
            <em style={{ fontFamily: FED, fontStyle: 'italic', fontSize: 36, background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>chegar ao veredito.</em>
          </h1>
          <p style={{ margin: '12px 0 0', fontSize: 14, color: X.textSoft, lineHeight: 1.55, maxWidth: 300 }}>
            Podes ouvir os dois lados para um resultado mais preciso, ou avançar já com a tua versão.
          </p>
        </div>

        {/* Opção A — convidar */}
        <div
          onClick={() => choose('invite')}
          style={{
            position: 'relative', borderRadius: 22, padding: '20px 20px', cursor: 'pointer', marginBottom: 12,
            background: `linear-gradient(145deg, ${X.acc1}18 0%, ${X.acc1}06 100%)`,
            border: `1px solid ${X.acc1}50`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: X.acc1 }}>
              veredito completo
            </div>
            <div style={{ padding: '3px 9px', borderRadius: 999, fontSize: 9.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: X.acc1, background: `${X.acc1}18`, border: `1px solid ${X.acc1}35` }}>
              recomendado
            </div>
          </div>
          <h2 style={{ margin: 0, fontFamily: FED, fontSize: 22, fontWeight: 400, letterSpacing: -0.6, lineHeight: 1.1, color: X.text }}>
            Ouvir{' '}
            <em style={{ fontFamily: FED, fontStyle: 'italic', background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>os dois lados</em>
          </h2>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: X.textSoft, lineHeight: 1.55 }}>
            Convidamos o outro lado a dar a versão dele. O veredito fica muito mais preciso e justo.
          </p>
          <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: 32, height: 32, borderRadius: 16, background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${X.acc1}35` }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M3 6.5h7m0 0L7 3.5m3 3l-3 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
        </div>

        {/* Separador */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
          <div style={{ flex: 1, height: 1, background: X.line }}/>
          <span style={{ fontSize: 11, color: X.textMute, fontWeight: 600, letterSpacing: 1 }}>OU</span>
          <div style={{ flex: 1, height: 1, background: X.line }}/>
        </div>

        {/* Opção B — sozinho */}
        <div
          onClick={() => choose('solo')}
          style={{
            position: 'relative', borderRadius: 22, padding: '20px 20px', cursor: 'pointer',
            background: `linear-gradient(145deg, ${X.acc2}14 0%, ${X.acc2}06 100%)`,
            border: `1px solid ${X.acc2}45`,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: X.acc2, marginBottom: 8 }}>
            só a minha versão
          </div>
          <h2 style={{ margin: 0, fontFamily: FED, fontSize: 22, fontWeight: 400, letterSpacing: -0.6, lineHeight: 1.1, color: X.text }}>
            Ver o veredito{' '}
            <em style={{ fontFamily: FED, fontStyle: 'italic', background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>agora</em>
          </h2>
          <p style={{ margin: '8px 0 0', fontSize: 13, color: X.textSoft, lineHeight: 1.55 }}>
            A Mara analisa o conflito com base no que partilhares e dá-te o resultado já.
          </p>
          <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{ width: 32, height: 32, borderRadius: 16, background: `linear-gradient(135deg, ${X.acc2}, ${X.accDeep})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${X.acc2}35` }}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M3 6.5h7m0 0L7 3.5m3 3l-3 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 18, textAlign: 'center', fontSize: 12, color: X.textMute }}>
          🔒 a tua conversa é completamente confidencial
        </div>
      </div>
    </div>
  )
}
