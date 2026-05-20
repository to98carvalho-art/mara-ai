import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { X, FUI, FED, GRAD, GRAD_TXT } from '../design/tokens'
import { art, dArt, getGender } from '../utils/gender'
import { track } from '../utils/analytics'
import XStatus from '../components/XStatus'
import XBack from '../components/XBack'


export default function S04Invite() {
  const nav = useNavigate()
  const { data, update } = useApp()

  const name1 = data.name1 || 'Alguém'
  const name2 = data.name2 || ''
  const code  = data.code  || '----'

  // If user already chose 'invite' on the mode screen, skip straight to WhatsApp form
  const [step,    setStep]    = useState(() => data.mode === 'invite' && data.code ? 'whatsapp' : 'choose')
  const [phone,   setPhone]   = useState('')
  const [error,   setError]   = useState('')
  const [sending, setSending] = useState(false)
  const [sent,    setSent]    = useState(false)

  async function sendInvite() {
    const clean = phone.replace(/\s/g, '').replace(/^00/, '+')
    if (!clean) return setError(`Digite o número de WhatsApp ${name2 ? `d${art(name2) === 'a' ? 'a' : 'o'} ${name2}` : 'da outra pessoa'}.`)
    if (clean.replace(/\D/g, '').length < 8) return setError('Número muito curto.')
    setError('')
    setSending(true)
    try {
      const res = await fetch('/api/send-invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: clean, name1, name2, code }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Erro ao enviar.')
      setSent(true)
      update({ inviteSent: true })
      track('partner_link_sent')
      setTimeout(() => nav('/analyzing'), 2200)
    } catch (err) {
      setError(err.message)
    } finally {
      setSending(false)
    }
  }

  /* ── ECRÃ DE ESCOLHA ─────────────────────────────── */
  if (step === 'choose') {
    return (
      <div style={{ position: 'relative', flex: 1, background: X.ink, display: 'flex', flexDirection: 'column', height: '100%' }}>
        <XStatus />
        {/* glows */}
        <div style={{ position: 'absolute', top: -60, left: '30%', width: 340, height: 340, borderRadius: '50%', background: `radial-gradient(circle, ${X.acc1}20 0%, transparent 70%)`, filter: 'blur(60px)', pointerEvents: 'none' }}/>
        <div style={{ position: 'absolute', bottom: 60, right: -40, width: 260, height: 260, borderRadius: '50%', background: `radial-gradient(circle, ${X.acc2}18 0%, transparent 70%)`, filter: 'blur(50px)', pointerEvents: 'none' }}/>

        <div style={{ position: 'relative', padding: '16px 24px 36px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{ marginTop: 10 }}><XBack onClick={() => nav('/chat')} /></div>

          {/* Título */}
          <div style={{ marginTop: 28, marginBottom: 28 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.8, textTransform: 'uppercase', color: X.acc1, marginBottom: 12 }}>
              como você quer continuar?
            </div>
            <h1 style={{ margin: 0, fontFamily: FED, fontSize: 38, fontWeight: 400, letterSpacing: -1.4, lineHeight: 1.0, color: X.text }}>
              Ouvir os dois lados<br/>
              <em style={{ fontFamily: FED, fontStyle: 'italic', fontSize: 38, background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>ou só o seu?</em>
            </h1>
          </div>

          {/* Opção A — convidar */}
          <div
            onClick={() => setStep('whatsapp')}
            style={{ position: 'relative', borderRadius: 22, padding: '20px 20px', cursor: 'pointer',
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
            <h2 style={{ margin: 0, fontFamily: FED, fontSize: 24, fontWeight: 400, letterSpacing: -0.6, lineHeight: 1.1, color: X.text }}>
              Convidar {art(name2)}{' '}
              <em style={{ fontFamily: FED, fontStyle: 'italic', background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{name2}</em>
            </h2>
            <p style={{ margin: '8px 0 0', fontSize: 13, color: X.textSoft, lineHeight: 1.55 }}>
              Ouvimos os dois lados. O veredito fica muito mais preciso e justo.
            </p>
            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: 32, height: 32, borderRadius: 16, background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${X.acc1}35` }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M3 6.5h7m0 0L7 3.5m3 3l-3 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
          </div>

          {/* Separador */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '14px 0' }}>
            <div style={{ flex: 1, height: 1, background: X.line }}/>
            <span style={{ fontSize: 11, color: X.textMute, fontWeight: 600, letterSpacing: 1 }}>OU</span>
            <div style={{ flex: 1, height: 1, background: X.line }}/>
          </div>

          {/* Opção B — só a sua versão */}
          <div
            onClick={() => { update({ skippedInvite: true }); nav('/solo') }}
            style={{ position: 'relative', borderRadius: 22, padding: '20px 20px', cursor: 'pointer',
              background: `linear-gradient(145deg, ${X.acc2}14 0%, ${X.acc2}06 100%)`,
              border: `1px solid ${X.acc2}45`,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: X.acc2, marginBottom: 8 }}>
              só a sua versão
            </div>
            <h2 style={{ margin: 0, fontFamily: FED, fontSize: 24, fontWeight: 400, letterSpacing: -0.6, lineHeight: 1.1, color: X.text }}>
              Ver o veredito{' '}
              <em style={{ fontFamily: FED, fontStyle: 'italic', background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>agora</em>
            </h2>
            <p style={{ margin: '8px 0 0', fontSize: 13, color: X.textSoft, lineHeight: 1.55 }}>
              A Mara analisa o conflito com base no que compartilhou e te dá o resultado já.
            </p>
            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: 32, height: 32, borderRadius: 16, background: `linear-gradient(135deg, ${X.acc2}, ${X.accDeep})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${X.acc2}35` }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M3 6.5h7m0 0L7 3.5m3 3l-3 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18, textAlign: 'center', fontSize: 12, color: X.textMute }}>
            🔒 tudo o que compartilhou é confidencial
          </div>
        </div>
      </div>
    )
  }

  /* ── ECRÃ WHATSAPP ───────────────────────────────── */
  return (
    <div style={{ position: 'relative', flex: 1, background: X.ink, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <XStatus />
      <div style={{
        position: 'absolute', top: 40, right: -80, width: 300, height: 300, borderRadius: '50%',
        background: `radial-gradient(circle, ${X.acc2}30 0%, transparent 60%)`,
        filter: 'blur(40px)', pointerEvents: 'none',
      }}/>

      <div style={{ position: 'relative', padding: '16px 28px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginTop: 10 }}><XBack onClick={() => setStep('choose')} /></div>

        {/* Título */}
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', color: X.acc2 }}>
            convidar o outro lado
          </div>
          <h1 style={{ margin: '10px 0 0', fontFamily: FED, fontSize: 34, fontWeight: 400, letterSpacing: -1.2, lineHeight: 1.05, color: X.text }}>
            A Mara vai contactar<br/>
            <em style={{
              display: 'inline-block', fontFamily: FED, fontSize: 34, fontWeight: 400,
              fontStyle: 'italic', letterSpacing: -1, lineHeight: 1.1, paddingRight: 4,
              background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
}}>{art(name2)} {name2}</em>
            <span style={{ fontFamily: FED, fontSize: 34, fontWeight: 400, color: X.text }}> por</span><br/>
            <span style={{ fontFamily: FED, fontSize: 34, fontWeight: 400, color: X.text }}>WhatsApp.</span>
          </h1>
          <p style={{ margin: '12px 0 0', fontSize: 14, color: X.textSoft, lineHeight: 1.5, maxWidth: 300 }}>
            A mensagem vai ser enviada pela Mara — {getGender(name2) === 'f' ? 'ela' : 'ele'} recebe, clica no link e dá a sua versão.
          </p>
        </div>

        {/* Chip destinatário */}
        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.025)', border: `1px solid ${X.line}` }}>
          <div style={{
            width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: GRAD,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: FED, fontStyle: 'italic',
          }}>
            {name2[0]?.toUpperCase() || '?'}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: X.text, letterSpacing: -0.2 }}>{name2}</div>
            <div style={{ fontSize: 11.5, color: X.textMute, marginTop: 1 }}>vai receber um convite da Mara</div>
          </div>
          <div style={{ marginLeft: 'auto', padding: '3px 9px', borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: 0.6, color: X.acc2, background: `${X.acc2}18`, border: `1px solid ${X.acc2}40` }}>
            código {code}
          </div>
        </div>

        {/* Campo telefone */}
        <div style={{ marginTop: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: X.textMute, marginBottom: 6 }}>
            Número de WhatsApp {dArt(name2)} {name2}
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18 }}>📱</div>
            <input
              type="tel" inputMode="tel" placeholder="+55 11 91234-5678"
              value={phone}
              onChange={e => { setPhone(e.target.value.replace(/[^\d+\s\-]/g, '')); setError('') }}
              disabled={sending || sent}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${error ? '#FF4B6E' : X.line}`, borderRadius: 13,
                padding: '13px 14px 13px 44px', color: X.text, fontFamily: FUI, fontSize: 16,
                outline: 'none', boxSizing: 'border-box', letterSpacing: 0.5,
              }}
            />
          </div>
          {error && <div style={{ marginTop: 6, fontSize: 12.5, color: '#FF4B6E' }}>{error}</div>}
        </div>

        {/* O que o Rui vai receber */}
        <div style={{ marginTop: 14, padding: '12px 14px', borderRadius: 14, background: `${X.acc1}08`, border: `1px solid ${X.acc1}20` }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: X.acc1, marginBottom: 6 }}>
            {art(name2)} {name2} vai receber
          </div>
          <div style={{ fontSize: 12.5, color: X.textSoft, lineHeight: 1.6 }}>
            Uma mensagem da Mara explicando o processo, com um link direto para dar a versão dele — sem precisar instalar nada.
          </div>
        </div>

        <div style={{ flex: 1, minHeight: 20 }} />

        {/* Botão enviar */}
        {sent ? (
          <div style={{
            height: 54, borderRadius: 999, background: `${X.good}22`, border: `1px solid ${X.good}50`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            fontSize: 15, fontWeight: 600, fontFamily: FUI, color: X.good,
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke={X.good} strokeWidth="1.4"/>
              <path d="M5 8l2 2 4-4" stroke={X.good} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Convite enviado com sucesso!
          </div>
        ) : (
          <div
            onClick={!sending ? sendInvite : undefined}
            style={{
              height: 54, borderRadius: 999,
              background: sending ? 'rgba(255,255,255,0.06)' : GRAD,
              cursor: sending ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              boxShadow: sending ? 'none' : `0 8px 28px ${X.acc1}45`,
              fontSize: 15, fontWeight: 600, fontFamily: FUI, color: '#fff',
              transition: 'all .2s',
            }}
          >
            {sending ? (
              <>
                <span style={{ width: 16, height: 16, borderRadius: 8, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', display: 'inline-block', animation: 'spin .7s linear infinite' }}/>
                Enviando…
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 32 32" fill="#fff">
                  <path d="M16 3C8.82 3 3 8.82 3 16c0 2.3.6 4.5 1.7 6.4L3 29l6.8-1.7A13 13 0 0016 29c7.18 0 13-5.82 13-13S23.18 3 16 3zm0 2c6.07 0 11 4.93 11 11s-4.93 11-11 11a11 11 0 01-5.5-1.5l-.4-.23-4.03 1 1.02-3.94-.26-.42A11 11 0 015 16c0-6.07 4.93-11 11-11zm-3.5 6c-.28 0-.73.1-1.1.5-.38.4-1.4 1.37-1.4 3.34 0 1.97 1.43 3.87 1.63 4.14.2.26 2.76 4.33 6.8 5.9 3.38 1.3 4.07 1.04 4.8.98.74-.07 2.37-.97 2.7-1.9.34-.94.34-1.74.24-1.9-.1-.17-.37-.27-.78-.47-.4-.2-2.38-1.17-2.75-1.3-.37-.14-.63-.2-.9.2-.26.4-1.02 1.3-1.25 1.56-.23.27-.46.3-.86.1-.4-.2-1.7-.63-3.23-2-1.2-1.07-2-2.38-2.24-2.78-.23-.4-.02-.62.17-.82.18-.18.4-.47.6-.7.2-.23.27-.4.4-.67.13-.26.07-.5-.03-.7-.1-.2-.88-2.17-1.23-2.97-.3-.72-.62-.65-.87-.65z"/>
                </svg>
                Enviar convite agora
              </>
            )}
          </div>
        )}

        <div style={{ marginTop: 10, textAlign: 'center', fontSize: 12, color: X.textMute, display: 'flex', justifyContent: 'center', gap: 16 }}>
          <span>🔒 confidencial</span><span>⏱ expira em 48h</span>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  )
}
