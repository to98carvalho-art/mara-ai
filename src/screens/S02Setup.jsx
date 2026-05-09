import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { X, FUI, FED, GRAD, GRAD_TXT } from '../design/tokens'
import XStatus from '../components/XStatus'
import XBack from '../components/XBack'
import XBtn from '../components/XBtn'

function durationLabel(v) {
  if (v < 15) return 'Menos de 6 meses'
  if (v < 30) return '6 meses – 1 ano'
  if (v < 50) return '1 a 3 anos'
  if (v < 70) return '3 a 5 anos'
  if (v < 85) return '5 a 10 anos'
  return 'Mais de 10 anos'
}

const types = [
  { k: 'casal',    label: 'Casal',     sub: 'parceiro · ex'    },
  { k: 'amigos',   label: 'Amigos',    sub: 'amizade · grupo'  },
  { k: 'familia',  label: 'Família',   sub: 'pais · irmãos'    },
  { k: 'trabalho', label: 'Trabalho',  sub: 'colegas · chefe'  },
]

export default function S02Setup() {
  const nav = useNavigate()
  const { data, update } = useApp()

  const [name1,    setName1]    = useState(data.name1 || '')
  const [name2,    setName2]    = useState(data.name2 || '')
  const [rel,      setRel]      = useState(data.rel || 'casal')
  const [duration, setDuration] = useState(data.duration || 50)
  const [error,    setError]    = useState('')

  function handleContinue() {
    if (!name1.trim()) return setError('Introduz o teu nome para continuar.')
    if (!name2.trim()) return setError('Introduz o nome do/a parceiro/a.')
    setError('')
    update({ name1: name1.trim(), name2: name2.trim(), rel, duration })
    nav('/chat')
  }

  return (
    <div style={{ position: 'relative', flex: 1, background: X.ink, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <XStatus />
      <div style={{ padding: '16px 28px 28px', flex: 1, display: 'flex', flexDirection: 'column' }}>

        {/* Header row: back + progress */}
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
          <XBack onClick={() => nav('/')} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: X.textSoft }}>
              <span style={{ color: X.acc1 }}>passo 1</span><span>de 3</span>
            </div>
            <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{ width: '33%', height: 3, background: GRAD }}/>
            </div>
          </div>
        </div>

        {/* Title */}
        <div style={{ marginTop: 20 }}>
          <h1 style={{
            margin: 0, fontFamily: FED, fontSize: 36, fontWeight: 400,
            letterSpacing: -1.2, lineHeight: 1.05, color: X.text,
          }}>
            Que tipo de{' '}
            <em style={{
              display: 'inline-block',
              fontFamily: FED, fontSize: 36, fontWeight: 400, fontStyle: 'italic',
              letterSpacing: -1, lineHeight: 1.1, paddingRight: 4,
              background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>relação?</em>
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: 13.5, color: X.textSoft, lineHeight: 1.4 }}>
            A Mara adapta as perguntas ao contexto.
          </p>
        </div>

        {/* Names */}
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'O teu nome',          placeholder: 'Ex: Ana', value: name1, set: setName1 },
            { label: 'Nome do/a parceiro/a', placeholder: 'Ex: Rui', value: name2, set: setName2 },
          ].map(({ label, placeholder, value, set }) => (
            <div key={label}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: X.textMute, marginBottom: 5 }}>{label}</div>
              <input
                type="text"
                placeholder={placeholder}
                value={value}
                maxLength={20}
                onChange={e => set(e.target.value)}
                style={{
                  width: '100%', background: 'rgba(255,255,255,0.04)',
                  border: `1px solid ${X.line}`, borderRadius: 13,
                  padding: '11px 15px', color: X.text, fontFamily: FUI, fontSize: 15,
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>
          ))}
        </div>

        {/* Relationship type grid */}
        <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {types.map(t => {
            const active = rel === t.k
            return (
              <div key={t.k} onClick={() => setRel(t.k)} style={{
                padding: '16px 16px 17px',
                borderRadius: 20,
                background: active ? GRAD : 'rgba(255,255,255,0.025)',
                border: active ? 'none' : `1px solid ${X.line}`,
                boxShadow: active ? `0 12px 28px ${X.acc1}38` : 'none',
                cursor: 'pointer',
              }}>
                <div style={{ fontSize: 15.5, fontWeight: 650, letterSpacing: -0.3, color: X.text }}>{t.label}</div>
                <div style={{ fontSize: 12, color: active ? 'rgba(255,255,255,0.65)' : X.textMute, marginTop: 4 }}>{t.sub}</div>
              </div>
            )
          })}
        </div>

        {/* Duration slider */}
        <div style={{ marginTop: 18 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: X.text }}>Há quanto tempo?</div>
            <div style={{ fontFamily: FED, fontStyle: 'italic', fontSize: 16, color: X.acc1 }}>{durationLabel(duration)}</div>
          </div>
          <div style={{ marginTop: 14, position: 'relative', height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, height: 4, borderRadius: 2,
              width: `${duration}%`, background: GRAD,
            }}/>
            <div style={{
              position: 'absolute', top: -7, left: `calc(${duration}% - 9px)`, width: 18, height: 18,
              borderRadius: 9, background: '#fff', boxShadow: `0 0 0 4px ${X.acc1}55, 0 4px 12px rgba(0,0,0,0.3)`,
            }}/>
            <input
              type="range" min="0" max="100"
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              style={{
                position: 'absolute', inset: 0, width: '100%', opacity: 0, cursor: 'pointer', height: 18, top: -7,
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11.5, color: X.textMute }}>
            <span>6 meses</span><span>10+ anos</span>
          </div>
        </div>

        {error && (
          <div style={{
            marginTop: 12, background: 'rgba(255,75,110,0.1)', border: '1px solid rgba(255,75,110,0.3)',
            borderRadius: 12, color: '#FF4B6E', padding: '10px 14px', fontSize: 13,
          }}>{error}</div>
        )}

        <div style={{ flex: 1, minHeight: 0 }} />
        <div style={{ marginTop: 16 }}>
          <XBtn primary onClick={handleContinue}>
            Continuar
            <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 7h10m0 0L8 3m4 4l-4 4" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </XBtn>
        </div>

      </div>
    </div>
  )
}
