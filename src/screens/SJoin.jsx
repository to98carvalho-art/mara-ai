import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { X, FUI, FED, GRAD, GRAD_TXT } from '../design/tokens'
import XStatus from '../components/XStatus'
import Lens from '../components/Lens'
import Wordmark from '../components/Wordmark'

export default function SJoin() {
  const nav = useNavigate()
  const { update } = useApp()
  const [params] = useSearchParams()

  const [chars, setChars] = useState(['', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const refs = [useRef(), useRef(), useRef(), useRef()]

  // Auto-fill code from URL ?c=XXXX
  useEffect(() => {
    const c = params.get('c')?.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (c?.length === 4) {
      setChars(c.split(''))
    }
  }, [])

  // Auto-submit when all 4 chars filled via URL
  useEffect(() => {
    if (chars.every(c => c) && params.get('c')) {
      handleSubmit(chars.join(''))
    }
  }, [chars])

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
    if (e.key === 'Enter') handleSubmit()
  }

  function handlePaste(e) {
    const pasted = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4)
    if (pasted.length) {
      const next = [...chars]
      for (let i = 0; i < 4; i++) next[i] = pasted[i] || ''
      setChars(next)
      refs[Math.min(pasted.length - 1, 3)].current?.focus()
    }
    e.preventDefault()
  }

  function handleSubmit(code = chars.join('')) {
    if (code.length !== 4) return setError('Introduz o código de 4 caracteres.')
    setLoading(true)

    const stored = localStorage.getItem(`ct_${code}`)
    if (!stored) {
      setLoading(false)
      return setError('Código inválido ou expirado. Verifica e tenta novamente.')
    }

    try {
      const sessionData = JSON.parse(stored)
      update({ ...sessionData, side: 2, code })
      nav('/chat2')
    } catch {
      setLoading(false)
      setError('Erro ao carregar sessão. Tenta novamente.')
    }
  }

  const filled = chars.every(c => c)

  return (
    <div style={{ position: 'relative', flex: 1, background: X.ink, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <XStatus />

      {/* glow */}
      <div style={{
        position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)',
        width: 400, height: 400, borderRadius: '50%',
        background: `radial-gradient(circle, ${X.acc2}30 0%, transparent 60%)`,
        filter: 'blur(50px)', pointerEvents: 'none',
      }}/>

      <div style={{ position: 'relative', padding: '32px 32px 36px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginTop: 18 }}>
          <Wordmark size={22} />
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 32 }}>
          <Lens size={100} intensity={1.1} />

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.8, color: X.acc2, textTransform: 'uppercase', marginBottom: 12 }}>
              convite recebido
            </div>
            <h1 style={{
              margin: 0, fontFamily: FED, fontSize: 40, fontWeight: 700,
              letterSpacing: -0.3, lineHeight: 1.05, color: X.text,
            }}>
              A tua versão<br/>
              <em style={{
                display: 'inline-block',
                fontFamily: FED, fontSize: 40, fontWeight: 700, fontStyle: 'italic',
                letterSpacing: -0.2, lineHeight: 1.1, paddingRight: 4,
                background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>também conta.</em>
            </h1>
            <p style={{ margin: '14px 0 0', fontSize: 14, color: X.textSoft, lineHeight: 1.5, maxWidth: 260 }}>
              Introduz o código de 4 caracteres que recebeste para entrares na sessão.
            </p>
          </div>

          {/* Code input — 4 boxes */}
          <div style={{ display: 'flex', gap: 10 }}>
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
                  width: 58, height: 68, textAlign: 'center',
                  fontFamily: FED, fontSize: 28, fontWeight: 700, letterSpacing: 0,
                  color: X.text, textTransform: 'uppercase',
                  background: c ? 'rgba(155,123,255,0.08)' : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${c ? X.acc1 : X.line}`,
                  borderRadius: 16, outline: 'none',
                  transition: 'border-color .15s, background .15s',
                  boxShadow: c ? `0 0 0 3px ${X.acc1}20` : 'none',
                }}
              />
            ))}
          </div>

          {error && (
            <div style={{
              fontSize: 13, color: '#FF4B6E', textAlign: 'center',
              background: 'rgba(255,75,110,0.08)', border: '1px solid rgba(255,75,110,0.25)',
              borderRadius: 12, padding: '10px 16px', maxWidth: 280,
            }}>{error}</div>
          )}
        </div>

        <button
          onClick={() => handleSubmit()}
          disabled={!filled || loading}
          style={{
            width: '100%', height: 56, borderRadius: 999,
            background: filled ? GRAD : 'rgba(255,255,255,0.06)',
            color: filled ? '#fff' : X.textMute,
            border: 'none', cursor: filled ? 'pointer' : 'default',
            fontFamily: FUI, fontWeight: 600, fontSize: 16, letterSpacing: -0.1,
            boxShadow: filled ? `0 16px 40px ${X.acc1}40` : 'none',
            transition: 'all .2s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          }}
        >
          {loading ? 'A carregar…' : 'Entrar na sessão'}
          {!loading && filled && (
            <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 7h10m0 0L8 3m4 4l-4 4" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          )}
        </button>

        <div style={{ marginTop: 12, textAlign: 'center', fontSize: 12, color: X.textMute }}>
          🔒 A tua resposta é estritamente confidencial
        </div>
      </div>
    </div>
  )
}
