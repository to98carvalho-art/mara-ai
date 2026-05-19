import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { X, FUI, FED, GRAD, GRAD_TXT } from '../design/tokens'
import { track } from '../utils/analytics'
import XStatus from '../components/XStatus'
import XBack from '../components/XBack'
import XBtn from '../components/XBtn'

const types = [
  { k: 'casal',    emoji: '💑', label: 'Casal',     sub: 'parceiro · ex'   },
  { k: 'amigos',   emoji: '👫', label: 'Amigos',    sub: 'amizade · grupo' },
  { k: 'familia',  emoji: '👨‍👩‍👧', label: 'Família',   sub: 'pais · irmãos'   },
  { k: 'trabalho', emoji: '💼', label: 'Trabalho',  sub: 'colegas · chefe' },
]

export default function S02Setup() {
  const nav = useNavigate()
  const { data, update } = useApp()

  const [name1, setName1] = useState(data.name1 || '')
  const [name2, setName2] = useState(data.name2 || '')
  const [rel,   setRel]   = useState(data.rel   || 'casal')
  const [error, setError] = useState('')

  function handleContinue() {
    if (!name1.trim()) return setError('Digite o seu nome para continuar.')
    setError('')
    update({ name1: name1.trim(), name2: name2.trim() || '', rel, duration: 50 })
    track('step1_completed', { rel_type: rel, has_name2: !!name2.trim() })
    nav('/chat')
  }

  return (
    <div style={{ position: 'relative', flex: 1, background: X.ink, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <XStatus />
      <div style={{ padding: '16px 28px 32px', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Header */}
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
          <XBack onClick={() => nav('/')} />
          <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ width: '33%', height: 3, background: GRAD }}/>
          </div>
          <span style={{ fontSize: 11, fontWeight: 700, color: X.textMute, letterSpacing: 0.5 }}>1 / 3</span>
        </div>

        {/* Title */}
        <div style={{ marginTop: 24 }}>
          <h1 style={{
            margin: 0, fontFamily: FED, fontSize: 34, fontWeight: 400,
            letterSpacing: -1.2, lineHeight: 1.05, color: X.text,
          }}>
            Sobre quem é{' '}
            <em style={{
              fontFamily: FED, fontSize: 34, fontWeight: 400, fontStyle: 'italic',
              letterSpacing: -1, paddingRight: 4,
              background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>este conflito?</em>
          </h1>
          <p style={{ margin: '8px 0 0', fontSize: 13.5, color: X.textSoft, lineHeight: 1.5 }}>
            Leva menos de 30 segundos. 🔒 100% confidencial.
          </p>
        </div>

        {/* Relationship type */}
        <div style={{ marginTop: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: X.textMute, marginBottom: 10 }}>
            Tipo de relação
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {types.map(t => {
              const active = rel === t.k
              return (
                <div key={t.k} onClick={() => setRel(t.k)} style={{
                  padding: '14px 16px',
                  borderRadius: 18,
                  background: active ? GRAD : 'rgba(255,255,255,0.025)',
                  border: active ? 'none' : `1px solid ${X.line}`,
                  boxShadow: active ? `0 8px 24px ${X.acc1}35` : 'none',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 10,
                  transition: 'all .15s',
                }}>
                  <span style={{ fontSize: 20 }}>{t.emoji}</span>
                  <div>
                    <div style={{ fontSize: 14.5, fontWeight: 650, letterSpacing: -0.3, color: X.text }}>{t.label}</div>
                    <div style={{ fontSize: 11, color: active ? 'rgba(255,255,255,0.6)' : X.textMute, marginTop: 2 }}>{t.sub}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Names */}
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: X.textMute, marginBottom: 6 }}>
              O seu nome
            </div>
            <input
              type="text"
              placeholder="Ex: Ana"
              value={name1}
              maxLength={20}
              autoFocus
              onChange={e => { setName1(e.target.value); setError('') }}
              onKeyDown={e => e.key === 'Enter' && handleContinue()}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.05)',
                border: `1.5px solid ${error ? '#FF4B6E' : name1 ? X.acc1 : X.line}`,
                borderRadius: 14, padding: '12px 16px',
                color: X.text, fontFamily: FUI, fontSize: 16,
                outline: 'none', boxSizing: 'border-box',
                boxShadow: name1 ? `0 0 0 3px ${X.acc1}15` : 'none',
                transition: 'border-color .15s, box-shadow .15s',
              }}
            />
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: X.textMute, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              Nome da outra pessoa
              <span style={{ fontSize: 10, fontWeight: 500, color: X.acc1, background: `${X.acc1}18`, padding: '1px 7px', borderRadius: 99, letterSpacing: 0.5, textTransform: 'none' }}>opcional</span>
            </div>
            <input
              type="text"
              placeholder="Ex: Rui"
              value={name2}
              maxLength={20}
              onChange={e => setName2(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleContinue()}
              style={{
                width: '100%', background: 'rgba(255,255,255,0.04)',
                border: `1.5px solid ${name2 ? X.acc1 : X.line}`,
                borderRadius: 14, padding: '12px 16px',
                color: X.text, fontFamily: FUI, fontSize: 16,
                outline: 'none', boxSizing: 'border-box',
                transition: 'border-color .15s',
              }}
            />
            <div style={{ fontSize: 11.5, color: X.textMute, marginTop: 5 }}>
              A Mara vai perguntar durante a conversa se não preencheres agora.
            </div>
          </div>
        </div>

        {error && (
          <div style={{
            marginTop: 10, background: 'rgba(255,75,110,0.1)', border: '1px solid rgba(255,75,110,0.3)',
            borderRadius: 12, color: '#FF4B6E', padding: '10px 14px', fontSize: 13,
          }}>{error}</div>
        )}

        <div style={{ flex: 1, minHeight: 16 }} />

        <XBtn primary onClick={handleContinue}>
          Começar a conversa
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 7h10m0 0L8 3m4 4l-4 4" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </XBtn>

        <div style={{ marginTop: 10, textAlign: 'center', fontSize: 11.5, color: X.textMute }}>
          🔒 os seus dados são estritamente confidenciais
        </div>

      </div>
    </div>
  )
}
