import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { X, FUI, FED, GRAD } from '../design/tokens'
import XStatus from '../components/XStatus'
import XBack from '../components/XBack'
import Lens from '../components/Lens'

export default function SCodeEntry() {
  const nav = useNavigate()
  const { update } = useApp()

  const [chars,   setChars]   = useState(['', '', '', ''])
  const [error,   setError]   = useState('')
  const [shake,   setShake]   = useState(false)
  const [loading, setLoading] = useState(false)
  const refs = [useRef(), useRef(), useRef(), useRef()]

  const filled = chars.every(c => c !== '')
  const codeStr = chars.join('')

  function handleChar(i, val) {
    const v = val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(-1)
    const next = [...chars]
    next[i] = v
    setChars(next)
    setError('')
    if (v && i < 3) refs[i + 1].current?.focus()
  }

  function handleKeyDown(i, e) {
    if (e.key === 'Backspace' && !chars[i] && i > 0) {
      refs[i - 1].current?.focus()
    }
    if (e.key === 'Enter' && filled && !loading) handleCodeJoin()
  }

  function handlePaste(e) {
    const pasted = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)
    if (pasted.length) {
      const next = ['', '', '', '']
      for (let i = 0; i < 4; i++) next[i] = pasted[i] || ''
      setChars(next)
      refs[Math.min(pasted.length - 1, 3)].current?.focus()
    }
    e.preventDefault()
  }

  async function handleCodeJoin() {
    const c = codeStr.toUpperCase()
    if (c.length !== 4) return
    setLoading(true)
    setError('')

    // 1. localStorage (mesmo dispositivo / testes)
    const stored = localStorage.getItem(`ct_${c}`)
    if (stored) {
      try {
        const sessionData = JSON.parse(stored)
        update({ ...sessionData, side: 2, code: c })
        nav('/chat2')
        return
      } catch { /* JSON inválido — tenta servidor */ }
    }

    // 2. Servidor (Upstash Redis — cross-device, App Store)
    try {
      const res = await fetch(`/api/session?c=${c}`)
      if (res.ok) {
        const sessionData = await res.json()
        update({ ...sessionData, side: 2, code: c })
        nav('/chat2')
        return
      }
    } catch (err) {
      console.warn('Session server error:', err.message)
    }

    // Não encontrado em lado nenhum
    setLoading(false)
    setError('Código inválido ou expirado.')
    setShake(true)
    setTimeout(() => setShake(false), 500)
  }

  return (
    <div style={{ position: 'relative', flex: 1, background: X.ink, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <style>{`
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
      `}</style>
      <XStatus />

      {/* glow */}
      <div style={{
        position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)',
        width: 360, height: 360, borderRadius: '50%',
        background: `radial-gradient(circle, ${X.acc1}28 0%, transparent 65%)`,
        filter: 'blur(50px)', pointerEvents: 'none',
      }}/>

      <div style={{ position: 'relative', padding: '16px 28px 40px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginTop: 10 }}>
          <XBack onClick={() => nav('/')} />
        </div>

        {/* Header */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 20, paddingBottom: 40 }}>
          <Lens size={110} intensity={1.1} />

          <div style={{ textAlign: 'center' }}>
            <h1 style={{
              margin: 0, fontFamily: FED, fontSize: 36, fontWeight: 400,
              letterSpacing: -1.2, lineHeight: 1.05, color: X.text,
            }}>
              Digite o seu<br/>código de acesso
            </h1>
            <p style={{ margin: '12px 0 0', fontSize: 14, color: X.textSoft, lineHeight: 1.5, maxWidth: 260 }}>
              O código de 4 caracteres está na mensagem que você recebeu via WhatsApp.
            </p>
          </div>

          {/* PIN boxes */}
          <div style={{
            display: 'flex', gap: 12, justifyContent: 'center',
            animation: shake ? 'shake 0.4s ease' : 'none',
          }}>
            {chars.map((c, i) => (
              <input
                key={i}
                ref={refs[i]}
                type="text"
                inputMode="text"
                maxLength={1}
                value={c}
                onChange={e => handleChar(i, e.target.value)}
                onKeyDown={e => handleKeyDown(i, e)}
                onPaste={i === 0 ? handlePaste : undefined}
                style={{
                  width: 62, height: 68, textAlign: 'center',
                  fontFamily: FED, fontSize: 28, fontWeight: 400, letterSpacing: 0,
                  color: c ? X.text : X.textMute, textTransform: 'uppercase',
                  background: c ? `${X.acc1}12` : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${error ? '#FF4B6E' : c ? X.acc1 : X.line}`,
                  borderRadius: 18, outline: 'none', caretColor: X.acc1,
                  transition: 'border-color .15s, background .15s, box-shadow .15s',
                  boxShadow: c ? `0 0 0 3px ${X.acc1}18` : 'none',
                }}
              />
            ))}
          </div>

          {error
            ? <div style={{ fontSize: 13, color: '#FF4B6E', textAlign: 'center', marginTop: -8 }}>{error}</div>
            : <div style={{ fontSize: 12, color: X.textMute, textAlign: 'center', marginTop: -8 }}>letras maiúsculas e números</div>
          }
        </div>

        {/* CTA */}
        <div
          onClick={filled && !loading ? handleCodeJoin : undefined}
          style={{
            height: 54, borderRadius: 999,
            background: filled && !loading ? GRAD : 'rgba(255,255,255,0.05)',
            border: filled && !loading ? 'none' : `1px solid ${X.line}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            cursor: filled && !loading ? 'pointer' : 'default',
            boxShadow: filled && !loading ? `0 8px 28px ${X.acc1}45` : 'none',
            transition: 'all .2s',
            fontSize: 15, fontWeight: 600, fontFamily: FUI,
            color: filled && !loading ? '#fff' : X.textMute, letterSpacing: -0.1,
          }}
        >
          {loading
            ? <><span style={{ width: 16, height: 16, borderRadius: 8, border: `2px solid rgba(255,255,255,0.3)`, borderTopColor: '#fff', display: 'inline-block', animation: 'spin .7s linear infinite' }} /> verificando…</>
            : <>Entrar na sessão{filled && <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 7h10m0 0L8 3m4 4l-4 4" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}</>
          }
        </div>

        <div style={{ marginTop: 14, textAlign: 'center', fontSize: 12, color: X.textMute }}>
          🔒 os seus dados são estritamente confidenciais
        </div>
      </div>
    </div>
  )
}
