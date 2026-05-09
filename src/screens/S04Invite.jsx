import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { X, FUI, FED, GRAD, GRAD_TXT } from '../design/tokens'
import XStatus from '../components/XStatus'
import XBack from '../components/XBack'
import Card from '../components/Card'

function buildMessage(name1, name2, code) {
  return `Olá ${name2} 👋

Sou a Mara — uma inteligência artificial especializada em dinâmicas relacionais e resolução de conflitos, com base em psicologia clínica.

Soube que houve um conflito recente entre ti e o/a ${name1}. Para que o veredicto seja justo, preciso também da tua perspetiva.

Descarrega a app Mara.ai:
🍎 App Store → [em breve]
🤖 Google Play → [em breve]

Abre a app e introduz o teu código de acesso:

*${code}*

Leva apenas alguns minutos. 🔒 Tudo o que partilhares é estritamente confidencial — ninguém terá acesso às tuas respostas, apenas ao veredicto final.

_— Mara.ai_`
}

export default function S04Invite() {
  const nav = useNavigate()
  const { data, update } = useApp()

  const name1 = data.name1 || 'Alguém'
  const name2 = data.name2 || ''
  const code  = data.code  || '----'

  const [step,   setStep]   = useState('choose')
  const [phone,  setPhone]  = useState('')
  const [error,  setError]  = useState('')
  const [copied, setCopied] = useState(false)

  const msg = buildMessage(name1, name2, code)

  function openWhatsApp() {
    const clean = phone.replace(/\s/g, '').replace(/^00/, '+')
    if (!clean) return setError(`Introduz o número de WhatsApp d${name2 ? `o ${name2}` : 'a outra pessoa'}.`)
    if (clean.replace('+', '').length < 8) return setError('Número demasiado curto.')
    const url = `https://wa.me/${clean.replace('+', '')}?text=${encodeURIComponent(msg)}`
    window.open(url, '_blank')
    update({ inviteSent: true })
    setTimeout(() => nav('/analyzing'), 600)
  }

  async function copyMsg() {
    try { await navigator.clipboard.writeText(msg) } catch (_) {}
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
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
          <div style={{ marginTop: 28, marginBottom: 32 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.8, textTransform: 'uppercase', color: X.acc1, marginBottom: 12 }}>
              próximo passo
            </div>
            <h1 style={{ margin: 0, fontFamily: FED, fontSize: 36, fontWeight: 400, letterSpacing: -1.2, lineHeight: 1.05, color: X.text }}>
              Como queres o teu{' '}
              <em style={{ fontFamily: FED, fontStyle: 'italic', background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>veredicto?</em>
            </h1>
          </div>

          {/* Opção A — convidar */}
          <div
            onClick={() => setStep('whatsapp')}
            style={{ position: 'relative', borderRadius: 24, padding: '26px 22px', cursor: 'pointer',
              background: `linear-gradient(145deg, ${X.acc1}18 0%, ${X.acc1}06 100%)`,
              border: `1px solid ${X.acc1}50`,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: X.acc1, marginBottom: 10 }}>
              veredicto completo
            </div>
            <h2 style={{ margin: 0, fontFamily: FED, fontSize: 26, fontWeight: 400, letterSpacing: -0.8, lineHeight: 1.1, color: X.text }}>
              Convidar o{' '}
              <em style={{ fontFamily: FED, fontStyle: 'italic', background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{name2}</em>
            </h2>
            <p style={{ margin: '10px 0 0', fontSize: 13.5, color: X.textSoft, lineHeight: 1.6 }}>
              Ouvimos os dois lados. O veredicto fica muito mais preciso e justo.
            </p>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: 34, height: 34, borderRadius: 17, background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${X.acc1}35` }}>
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

          {/* Opção B — só a tua versão */}
          <div
            onClick={() => { update({ skippedInvite: true }); nav('/analyzing') }}
            style={{ position: 'relative', borderRadius: 24, padding: '26px 22px', cursor: 'pointer',
              background: `linear-gradient(145deg, ${X.acc2}14 0%, ${X.acc2}06 100%)`,
              border: `1px solid ${X.acc2}45`,
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, textTransform: 'uppercase', color: X.acc2, marginBottom: 10 }}>
              só a tua versão
            </div>
            <h2 style={{ margin: 0, fontFamily: FED, fontSize: 26, fontWeight: 400, letterSpacing: -0.8, lineHeight: 1.1, color: X.text }}>
              Ver o veredicto{' '}
              <em style={{ fontFamily: FED, fontStyle: 'italic', background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>agora</em>
            </h2>
            <p style={{ margin: '10px 0 0', fontSize: 13.5, color: X.textSoft, lineHeight: 1.6 }}>
              A Mara analisa o conflito com base no que partilhaste e dá-te o resultado já.
            </p>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <div style={{ width: 34, height: 34, borderRadius: 17, background: `linear-gradient(135deg, ${X.acc2}, ${X.accDeep})`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 14px ${X.acc2}35` }}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M3 6.5h7m0 0L7 3.5m3 3l-3 3" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18, textAlign: 'center', fontSize: 12, color: X.textMute }}>
            🔒 tudo o que partilhaste é confidencial
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
            passo 2 de 3
          </div>
          <h1 style={{ margin: '10px 0 0', fontFamily: FED, fontSize: 34, fontWeight: 400, letterSpacing: -1.2, lineHeight: 1.05, color: X.text }}>
            Agora vamos contactar<br/>
            <em style={{
              display: 'inline-block', fontFamily: FED, fontSize: 34, fontWeight: 400,
              fontStyle: 'italic', letterSpacing: -1, lineHeight: 1.1, paddingRight: 4,
              background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>o {name2}</em>
            <span style={{ fontFamily: FED, fontSize: 34, fontWeight: 400, color: X.text }}> e ouvir</span><br/>
            <span style={{ fontFamily: FED, fontSize: 34, fontWeight: 400, color: X.text }}>a versão dele.</span>
          </h1>
          <p style={{ margin: '12px 0 0', fontSize: 14, color: X.textSoft, lineHeight: 1.5, maxWidth: 300 }}>
            Vamos enviar uma mensagem ao {name2} via WhatsApp — já está tudo escrito, ele recebe o código e responde quando quiser.
          </p>
        </div>

        {/* Nome + código */}
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 14, background: 'rgba(255,255,255,0.025)', border: `1px solid ${X.line}` }}>
            <div style={{
              width: 36, height: 36, borderRadius: 18, flexShrink: 0, background: GRAD,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: FED, fontStyle: 'italic',
            }}>
              {name2[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: X.text, letterSpacing: -0.2 }}>{name2}</div>
              <div style={{ fontSize: 11.5, color: X.textMute, marginTop: 1 }}>destinatário do convite</div>
            </div>
            <div style={{ marginLeft: 'auto', padding: '3px 9px', borderRadius: 999, fontSize: 10, fontWeight: 700, letterSpacing: 0.6, color: X.acc2, background: `${X.acc2}18`, border: `1px solid ${X.acc2}40` }}>
              código {code}
            </div>
          </div>

          {/* Telefone */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: X.textMute, marginBottom: 6 }}>
              Número de WhatsApp
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 18 }}>📱</div>
              <input
                type="tel" inputMode="tel" placeholder="+351 912 345 678"
                value={phone}
                onChange={e => { setPhone(e.target.value.replace(/[^\d+\s]/g, '')); setError('') }}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${error ? '#FF4B6E' : X.line}`, borderRadius: 13,
                  padding: '12px 14px 12px 44px', color: X.text, fontFamily: FUI, fontSize: 15,
                  outline: 'none', boxSizing: 'border-box', letterSpacing: 0.5,
                }}
              />
            </div>
            {error && <div style={{ marginTop: 6, fontSize: 12.5, color: '#FF4B6E' }}>{error}</div>}
          </div>
        </div>

        {/* Pré-visualização da mensagem */}
        <div style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: X.textMute }}>
              mensagem pré-escrita
            </div>
            <div onClick={copyMsg} style={{ fontSize: 11.5, color: copied ? X.good : X.acc1, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              {copied
                ? <><svg width="11" height="11" viewBox="0 0 11 11"><path d="M1 5.5L4 8.5 10 2" stroke={X.good} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg> copiado</>
                : <><svg width="11" height="11" viewBox="0 0 11 11"><rect x="1" y="3" width="7" height="8" rx="1.2" stroke={X.acc1} strokeWidth="1.2" fill="none"/><path d="M3 3V2a1 1 0 011-1h5a1 1 0 011 1v7a1 1 0 01-1 1H9" stroke={X.acc1} strokeWidth="1.2" fill="none"/></svg> copiar</>
              }
            </div>
          </div>
          <Card style={{ padding: '14px 16px', position: 'relative', overflow: 'hidden', maxHeight: 130 }}>
            <div style={{ fontSize: 12.5, lineHeight: 1.6, color: X.textSoft, whiteSpace: 'pre-wrap', overflowY: 'auto', maxHeight: 110 }}>
              {msg}
            </div>
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 36, background: `linear-gradient(transparent, ${X.ink2})`, borderRadius: '0 0 14px 14px', pointerEvents: 'none' }}/>
          </Card>
        </div>

        <div style={{ flex: 1, minHeight: 16 }} />

        {/* Botão enviar */}
        <div
          onClick={openWhatsApp}
          style={{
            height: 54, borderRadius: 999, background: GRAD, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            boxShadow: `0 8px 28px ${X.acc1}45`,
            fontSize: 15, fontWeight: 600, fontFamily: FUI, color: '#fff',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 32 32" fill="#fff">
            <path d="M16 3C8.82 3 3 8.82 3 16c0 2.3.6 4.5 1.7 6.4L3 29l6.8-1.7A13 13 0 0016 29c7.18 0 13-5.82 13-13S23.18 3 16 3zm0 2c6.07 0 11 4.93 11 11s-4.93 11-11 11a11 11 0 01-5.5-1.5l-.4-.23-4.03 1 1.02-3.94-.26-.42A11 11 0 015 16c0-6.07 4.93-11 11-11zm-3.5 6c-.28 0-.73.1-1.1.5-.38.4-1.4 1.37-1.4 3.34 0 1.97 1.43 3.87 1.63 4.14.2.26 2.76 4.33 6.8 5.9 3.38 1.3 4.07 1.04 4.8.98.74-.07 2.37-.97 2.7-1.9.34-.94.34-1.74.24-1.9-.1-.17-.37-.27-.78-.47-.4-.2-2.38-1.17-2.75-1.3-.37-.14-.63-.2-.9.2-.26.4-1.02 1.3-1.25 1.56-.23.27-.46.3-.86.1-.4-.2-1.7-.63-3.23-2-1.2-1.07-2-2.38-2.24-2.78-.23-.4-.02-.62.17-.82.18-.18.4-.47.6-.7.2-.23.27-.4.4-.67.13-.26.07-.5-.03-.7-.1-.2-.88-2.17-1.23-2.97-.3-.72-.62-.65-.87-.65z"/>
          </svg>
          Enviar pelo WhatsApp
        </div>

        <div style={{ marginTop: 10, textAlign: 'center', fontSize: 12, color: X.textMute, display: 'flex', justifyContent: 'center', gap: 16 }}>
          <span>🔒 confidencial</span><span>⏱ expira em 48h</span>
        </div>
      </div>
    </div>
  )
}
