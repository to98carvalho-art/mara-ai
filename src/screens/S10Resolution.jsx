import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { X, FED, FNUM, FUI, GRAD, GRAD_TXT } from '../design/tokens'
import { art, getGender } from '../utils/gender'
import XStatus from '../components/XStatus'
import XBack from '../components/XBack'
import Card from '../components/Card'

/* ─── Attachment info ─────────────────────────────── */
const ATTACH = {
  seguro:        { label: 'Seguro',        color: '#34D399', desc: 'Base emocional estável. Consegue dar e receber afeto sem ansiedade ou distância.' },
  ansioso:       { label: 'Ansioso',       color: '#FFB36B', desc: 'Necessita de reassurance constante. Medo de abandono ativa comportamentos de protesto.' },
  evitante:      { label: 'Evitante',      color: '#9B7BFF', desc: 'Mantém distância emocional como mecanismo de proteção. Intimidade é percebida como ameaça.' },
  desorganizado: { label: 'Desorganizado', color: '#FF4B6E', desc: 'Padrão instável — oscila entre aproximação e fuga. Frequentemente ligado a trauma de vinculação precoce.' },
}

/* ─── Slide transition ────────────────────────────── */
const slideIn  = { initial: { x: 40, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: 40, opacity: 0 } }
const slideOut = { initial: { x: -40, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: -40, opacity: 0 } }
const ease     = { duration: 0.26, ease: [0.22, 1, 0.36, 1] }

/* ─── Section back-header ─────────────────────────── */
function SecHeader({ label, color, onBack, onShare, copied }) {
  return (
    <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', padding: '6px 0' }}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M11 4l-5 5 5 5" stroke={X.textSoft} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span style={{ fontSize: 13, color: X.textSoft, fontWeight: 500 }}>Relatório</span>
      </div>
      <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase', color, padding: '4px 12px', borderRadius: 999, background: `${color}18`, border: `1px solid ${color}40` }}>
        {label}
      </div>
      {onShare && (
        <div onClick={onShare} style={{ width: 36, height: 36, borderRadius: 18, background: copied ? `${X.good}22` : 'rgba(255,255,255,0.05)', border: `1px solid ${copied ? X.good : X.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          {copied
            ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-6" stroke={X.good} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            : <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="2.5" cy="6" r="1.2" stroke={X.textSoft} strokeWidth="1"/><circle cx="9.5" cy="2.5" r="1.2" stroke={X.textSoft} strokeWidth="1"/><circle cx="9.5" cy="9.5" r="1.2" stroke={X.textSoft} strokeWidth="1"/><path d="M3.7 5.4l4-2M3.7 6.6l4 2" stroke={X.textSoft} strokeWidth="1"/></svg>
          }
        </div>
      )}
      {!onShare && <div style={{ width: 36 }}/>}
    </div>
  )
}

/* ════════════════════════════════════════════════════
   SUB-VIEWS
════════════════════════════════════════════════════ */

function ViewAnalysis({ v, onBack }) {
  return (
    <div style={{ padding: '20px 24px 44px', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <SecHeader label="Análise Clínica" color={X.acc1} onBack={onBack} />
      <h2 style={{ margin: '20px 0 0', fontFamily: FED, fontSize: 28, fontWeight: 400, letterSpacing: -0.8, lineHeight: 1.1, color: X.text }}>
        O diagnóstico<br/>
        <em style={{ fontStyle: 'italic', background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>da relação.</em>
      </h2>

      {/* Razão principal */}
      {v?.main_reason && (
        <div style={{ marginTop: 20, padding: '16px 18px', borderRadius: 18, background: `linear-gradient(135deg, ${X.acc1}0f 0%, ${X.acc2}08 100%)`, border: `1px solid ${X.acc1}30` }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.6, color: X.acc1, textTransform: 'uppercase', marginBottom: 8 }}>causa raiz</div>
          <div style={{ fontFamily: FED, fontStyle: 'italic', fontSize: 15.5, lineHeight: 1.65, color: X.text }}>"{v.main_reason}"</div>
        </div>
      )}

      <div style={{ marginTop: 20, fontSize: 14.5, color: X.textSoft, lineHeight: 1.85, whiteSpace: 'pre-line' }}>
        {v?.clinical_analysis || 'Análise não disponível.'}
      </div>
      {v?.gottman_horsemen?.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.6, color: X.acc1, textTransform: 'uppercase', marginBottom: 10 }}>frameworks detetados</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {v.gottman_horsemen.map((h, i) => (
              <div key={i} style={{ padding: '5px 12px', borderRadius: 999, background: `${X.acc1}14`, border: `1px solid ${X.acc1}40`, fontSize: 12.5, fontWeight: 600, color: X.acc1 }}>{h}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ViewAttachment({ v, name1, name2, onBack }) {
  const people = [
    { name: name1, style: v?.attachment_style_1 },
    { name: name2, style: v?.attachment_style_2 },
  ].filter(p => p.style)

  // Compatibility logic
  const styleKey1 = v?.attachment_style_1?.toLowerCase()
  const styleKey2 = v?.attachment_style_2?.toLowerCase()
  const COMPAT = {
    'seguro+seguro': { pct: 90, label: 'Muito alta' },
    'seguro+ansioso': { pct: 68, label: 'Moderada' },
    'ansioso+seguro': { pct: 68, label: 'Moderada' },
    'seguro+evitante': { pct: 60, label: 'Moderada' },
    'evitante+seguro': { pct: 60, label: 'Moderada' },
    'ansioso+evitante': { pct: 32, label: 'Difícil' },
    'evitante+ansioso': { pct: 32, label: 'Difícil' },
    'ansioso+ansioso': { pct: 45, label: 'Tensa' },
    'evitante+evitante': { pct: 40, label: 'Distante' },
    'desorganizado+desorganizado': { pct: 18, label: 'Muito difícil' },
  }
  const compatKey = styleKey1 && styleKey2 ? `${styleKey1}+${styleKey2}` : null
  const compat = compatKey ? COMPAT[compatKey] || { pct: 50, label: 'Variável' } : null

  return (
    <div style={{ padding: '20px 24px 44px', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <SecHeader label="Vinculação" color={X.acc2} onBack={onBack} />
      <h2 style={{ margin: '20px 0 0', fontFamily: FED, fontSize: 28, fontWeight: 400, letterSpacing: -0.8, lineHeight: 1.1, color: X.text }}>
        Como cada um<br/>
        <em style={{ fontStyle: 'italic', background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>se liga ao outro.</em>
      </h2>

      {/* Profile cards */}
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
        {people.map((p, i) => {
          const info = ATTACH[p.style?.toLowerCase()] || { label: p.style, color: X.acc1, desc: '' }
          return (
            <div key={i} style={{ padding: '18px 20px', borderRadius: 20, background: `${info.color}0c`, border: `1px solid ${info.color}35` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 19, background: `${info.color}22`, border: `1px solid ${info.color}45`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FED, fontStyle: 'italic', fontSize: 16, fontWeight: 500, color: info.color }}>
                  {p.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: X.textMute, textTransform: 'uppercase' }}>{p.name}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: info.color, letterSpacing: -0.3, marginTop: 1 }}>{info.label}</div>
                </div>
              </div>
              <div style={{ fontSize: 13.5, color: X.textSoft, lineHeight: 1.65 }}>{info.desc}</div>
            </div>
          )
        })}
      </div>

      {/* Compatibility */}
      {compat && (
        <div style={{ marginTop: 18, padding: '18px 20px', borderRadius: 20, background: 'rgba(255,255,255,0.03)', border: `1px solid ${X.line}` }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.6, color: X.textMute, textTransform: 'uppercase', marginBottom: 12 }}>compatibilidade de vinculação</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontFamily: FNUM, fontSize: 46, fontWeight: 300, letterSpacing: -2, color: X.text, lineHeight: 1 }}>
              {compat.pct}<span style={{ fontSize: 18 }}>%</span>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: X.text }}>{compat.label}</div>
              <div style={{ fontSize: 12.5, color: X.textSoft, marginTop: 2 }}>baseado nos estilos de vinculação</div>
            </div>
          </div>
          <div style={{ marginTop: 12, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ width: `${compat.pct}%`, height: '100%', background: GRAD, transition: 'width 1s ease' }}/>
          </div>
        </div>
      )}
    </div>
  )
}

function ViewPatterns({ v, onBack }) {
  const horsemen = v?.gottman_horsemen || []
  const flags    = v?.red_flags || []
  const HORSEMAN_DESC = {
    'crítica':        'Atacar o caráter da pessoa em vez do comportamento específico.',
    'contempto':      'O mais destrutivo. Transmite superioridade: sarcasmo, olhos revirados, insultos.',
    'defensividade':  'Vitimização para evitar responsabilidade. Responde às queixas com contra-ataques.',
    'stonewalling':   'Fechar-se, ignorar, desligar emocionalmente durante o conflito.',
  }
  return (
    <div style={{ padding: '20px 24px 44px', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <SecHeader label="Padrões" color={X.warm} onBack={onBack} />
      <h2 style={{ margin: '20px 0 0', fontFamily: FED, fontSize: 28, fontWeight: 400, letterSpacing: -0.8, lineHeight: 1.1, color: X.text }}>
        Os padrões que<br/>
        <em style={{ fontStyle: 'italic', background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>destroem relações.</em>
      </h2>
      {horsemen.length > 0 ? (
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.6, color: X.warm, textTransform: 'uppercase', marginBottom: 4 }}>cavaleiros de gottman detetados</div>
          {horsemen.map((h, i) => (
            <div key={i} style={{ padding: '16px 18px', borderRadius: 18, background: `${X.warm}0c`, border: `1px solid ${X.warm}35` }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: X.warm, marginBottom: 5, textTransform: 'capitalize' }}>{h}</div>
              <div style={{ fontSize: 13.5, color: X.textSoft, lineHeight: 1.6 }}>
                {HORSEMAN_DESC[h.toLowerCase()] || 'Padrão destrutivo detetado na dinâmica do conflito.'}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ marginTop: 20, padding: '18px', borderRadius: 18, background: `${X.good}0c`, border: `1px solid ${X.good}35` }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: X.good }}>Nenhum cavaleiro de Gottman detetado</div>
          <div style={{ fontSize: 13, color: X.textSoft, marginTop: 5, lineHeight: 1.55 }}>A comunicação não apresenta os padrões mais destrutivos descritos pelo modelo Gottman.</div>
        </div>
      )}
      {flags.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.6, color: '#FF4B6E', textTransform: 'uppercase', marginBottom: 10 }}>outros sinais de alerta</div>
          {flags.map((f, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
              <div style={{ width: 5, height: 5, borderRadius: 3, background: '#FF4B6E', marginTop: 7, flexShrink: 0 }}/>
              <div style={{ fontSize: 13.5, color: X.text, lineHeight: 1.5 }}>{f}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function OldVerdictNotice({ onBack }) {
  return (
    <div style={{ marginTop: 24, padding: '20px', borderRadius: 20, background: `${X.acc1}0c`, border: `1px solid ${X.acc1}30`, textAlign: 'center' }}>
      <div style={{ fontSize: 24, marginBottom: 10 }}>✨</div>
      <div style={{ fontSize: 14, fontWeight: 600, color: X.text, marginBottom: 6 }}>Conteúdo novo disponível</div>
      <div style={{ fontSize: 13, color: X.textSoft, lineHeight: 1.6, marginBottom: 16 }}>
        Esta secção foi adicionada recentemente. Para a ver, inicia uma nova análise — o relatório será gerado com todos os campos.
      </div>
      <div onClick={onBack} style={{ display: 'inline-block', padding: '8px 20px', borderRadius: 999, background: GRAD, fontSize: 13, fontWeight: 600, color: '#fff', cursor: 'pointer' }}>
        Voltar ao relatório
      </div>
    </div>
  )
}

/* ── "Who are you?" selector ── */
function WhoAreYou({ name1, name2, color1, color2, onSelect }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px 60px', gap: 20 }}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
        <div style={{ fontFamily: FED, fontSize: 22, fontWeight: 400, letterSpacing: -0.5, color: X.text, lineHeight: 1.2 }}>
          Este conteúdo é<br/>
          <em style={{ fontStyle: 'italic', background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>só para ti.</em>
        </div>
        <div style={{ marginTop: 10, fontSize: 13, color: X.textMute, lineHeight: 1.5 }}>
          Selecione quem você é para ver<br/>seu conteúdo personalizado.
        </div>
      </div>
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[{ name: name1, color: color1 }, { name: name2, color: color2 }].filter(p => p.name).map((p, i) => (
          <div key={i} onClick={() => onSelect(i === 0 ? 1 : 2)} style={{
            padding: '16px 20px', borderRadius: 18, cursor: 'pointer',
            background: `${p.color}10`, border: `1px solid ${p.color}40`,
            display: 'flex', alignItems: 'center', gap: 14,
            transition: 'all .15s',
          }}>
            <div style={{ width: 42, height: 42, borderRadius: 21, background: `${p.color}22`, border: `1px solid ${p.color}50`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FED, fontStyle: 'italic', fontSize: 18, color: p.color }}>
              {p.name[0]?.toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: X.text, letterSpacing: -0.2 }}>Sou {p.name}</div>
              <div style={{ fontSize: 12, color: X.textMute, marginTop: 2 }}>ver o meu conteúdo</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 4l4 4-4 4" stroke={p.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        ))}
      </div>
    </div>
  )
}

function LockedCard({ name, color }) {
  return (
    <div style={{ marginTop: 12, borderRadius: 20, overflow: 'hidden', position: 'relative' }}>
      {/* Blurred fake content */}
      <div style={{ padding: '20px', background: `${color}08`, border: `1px solid ${color}25`, borderRadius: 20, filter: 'blur(5px)', userSelect: 'none', pointerEvents: 'none' }}>
        <div style={{ height: 12, borderRadius: 6, background: `${color}30`, marginBottom: 10, width: '80%' }}/>
        <div style={{ height: 10, borderRadius: 5, background: `${color}20`, marginBottom: 8, width: '95%' }}/>
        <div style={{ height: 10, borderRadius: 5, background: `${color}20`, marginBottom: 8, width: '70%' }}/>
        <div style={{ height: 10, borderRadius: 5, background: `${color}20`, width: '85%' }}/>
      </div>
      {/* Lock overlay */}
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'rgba(10,7,23,0.55)', borderRadius: 20, border: `1px solid ${color}25` }}>
        <div style={{ fontSize: 22 }}>🔒</div>
        <div style={{ fontSize: 13, fontWeight: 600, color: X.textSoft, textAlign: 'center', lineHeight: 1.4 }}>
          Apenas <span style={{ color }}>{name}</span> pode ler isto
        </div>
      </div>
    </div>
  )
}

function ViewNeeds({ v, name1, name2, side, onBack }) {
  const hasData = !!(v?.needs_1 || v?.needs_2)
  const me    = side === 2 ? { name: name2, text: v?.needs_2, color: X.acc2 } : { name: name1, text: v?.needs_1, color: X.acc1 }
  const other = side === 2 ? { name: name1, color: X.acc1 } : { name: name2, color: X.acc2 }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 24px 0' }}>
        <SecHeader label="O que precisas" color={me.color} onBack={onBack} />
      </div>

      {!hasData ? (
        <div style={{ padding: '0 24px' }}><OldVerdictNotice onBack={onBack} /></div>
      ) : (
        <div style={{ padding: '0 24px 44px', flex: 1 }}>
          {/* Personal header */}
          <div style={{ marginTop: 20, padding: '12px 16px', borderRadius: 14, background: `${me.color}10`, border: `1px solid ${me.color}35`, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 34, height: 34, borderRadius: 17, background: `${me.color}22`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FED, fontStyle: 'italic', fontSize: 15, color: me.color, flexShrink: 0 }}>
              {me.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.4, color: me.color, textTransform: 'uppercase' }}>só para ti</div>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: X.text, marginTop: 1 }}>As necessidades de {me.name}</div>
            </div>
          </div>

          <div style={{ padding: '20px', borderRadius: 20, background: `${me.color}0c`, border: `1px solid ${me.color}30` }}>
            <div style={{ fontSize: 14.5, color: X.text, lineHeight: 1.8 }}>{me.text}</div>
          </div>

          {/* Other person — locked */}
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.4, color: X.textMute, textTransform: 'uppercase', marginBottom: 8 }}>
              necessidades de {other.name}
            </div>
            <LockedCard name={other.name} color={other.color} />
          </div>
        </div>
      )}
    </div>
  )
}

function ViewLetter({ v, name1, name2, side, onBack, onShare, copied }) {
  const hasData = !!(v?.letter_1 || v?.letter_2)
  const me    = side === 2 ? { name: name2, text: v?.letter_2, color: X.acc2 } : { name: name1, text: v?.letter_1, color: X.acc1 }
  const other = side === 2 ? { name: name1, color: X.acc1 } : { name: name2, color: X.acc2 }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '20px 24px 0' }}>
        <SecHeader label="Carta da Mara" color={me.color} onBack={onBack} onShare={hasData ? onShare : null} copied={copied} />
      </div>

      {!hasData ? (
        <div style={{ padding: '0 24px' }}><OldVerdictNotice onBack={onBack} /></div>
      ) : (
        <div style={{ padding: '0 24px 44px', flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Private header */}
          <div style={{ marginTop: 20, padding: '12px 16px', borderRadius: 14, background: `${me.color}10`, border: `1px solid ${me.color}35`, display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 16 }}>🔒</span>
            <div style={{ fontSize: 12.5, color: me.color, fontWeight: 600 }}>
              Esta carta é só para ti, {me.name}.
            </div>
          </div>

          {/* Letter card */}
          <div style={{ padding: '24px 22px', borderRadius: 22, background: `linear-gradient(135deg, ${me.color}0d 0%, rgba(255,255,255,0.015) 100%)`, border: `1px solid ${me.color}35` }}>
            <div style={{ fontFamily: FED, fontSize: 15.5, color: X.text, lineHeight: 1.9, whiteSpace: 'pre-line' }}>
              {me.text}
            </div>
            <div style={{ marginTop: 22, paddingTop: 16, borderTop: `1px solid ${me.color}20`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 14, background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FED, fontStyle: 'italic', fontSize: 13, color: '#fff' }}>M</div>
              <div style={{ fontFamily: FED, fontStyle: 'italic', fontSize: 13.5, color: me.color }}>Mara</div>
            </div>
          </div>

          {/* Other person — locked */}
          <div style={{ marginTop: 24 }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.4, color: X.textMute, textTransform: 'uppercase', marginBottom: 8 }}>
              carta de {other.name}
            </div>
            <LockedCard name={other.name} color={other.color} />
          </div>

          {/* Share */}
          <div onClick={onShare} style={{ marginTop: 16, height: 46, borderRadius: 999, background: 'rgba(255,255,255,0.04)', border: `1px solid ${X.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', fontSize: 13.5, fontWeight: 500, color: X.textSoft }}>
            {copied
              ? <><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l4 4 6-7" stroke={X.good} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg><span style={{ color: X.good }}>Copiado!</span></>
              : <><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="3" cy="7" r="1.4" stroke={X.textSoft} strokeWidth="1.2"/><circle cx="11" cy="3" r="1.4" stroke={X.textSoft} strokeWidth="1.2"/><circle cx="11" cy="11" r="1.4" stroke={X.textSoft} strokeWidth="1.2"/><path d="M4.4 6.3l5-2.6M4.4 7.7l5 2.6" stroke={X.textSoft} strokeWidth="1.2"/></svg>Partilhar a minha carta</>
            }
          </div>
        </div>
      )}
    </div>
  )
}

function ViewPlan({ v, onBack }) {
  const steps = v?.resolution_steps?.length > 0
    ? v.resolution_steps
    : [
        { tag: 'reconhecer', title: 'Nomear o padrão',       body: 'Identifica o ciclo que se repete — sem acusações, com factos observáveis.' },
        { tag: 'comunicar',  title: 'Falar com intenção',    body: 'Escolhe um momento calmo. Começa com "eu sinto" em vez de "tu fazes".' },
        { tag: 'decidir',    title: 'Definir o próximo passo', body: 'Com base na análise, decidam juntos o que muda — ou se faz sentido continuar.' },
      ]
  const prognosis  = v?.prognosis_pct ?? null
  const conditions = v?.prognosis_conditions || []

  return (
    <div style={{ padding: '20px 24px 44px', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <SecHeader label="Plano" color={X.good} onBack={onBack} />
      <h2 style={{ margin: '20px 0 0', fontFamily: FED, fontSize: 28, fontWeight: 400, letterSpacing: -0.8, lineHeight: 1.1, color: X.text }}>
        Os passos concretos<br/>
        <em style={{ fontStyle: 'italic', background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>para mudar.</em>
      </h2>

      {/* Steps */}
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {steps.map((s, i) => {
          const colors = [X.acc2, X.acc1, X.warm, X.good]
          const c = colors[i % colors.length]
          return (
            <div key={i} style={{ padding: '16px 18px', borderRadius: 18, background: 'rgba(255,255,255,0.025)', border: `1px solid ${X.line}`, display: 'flex', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 12, background: `${c}1a`, border: `1px solid ${c}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FNUM, fontSize: 16, fontWeight: 600, color: c, flexShrink: 0 }}>
                {i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 1.3, textTransform: 'uppercase', color: c }}>{s.tag}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: X.text, marginTop: 3, letterSpacing: -0.2 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: X.textSoft, marginTop: 5, lineHeight: 1.55 }}>{s.body}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Prognosis */}
      {prognosis !== null && (
        <div style={{ marginTop: 18, padding: '18px 20px', borderRadius: 20, background: `${X.good}09`, border: `1px solid ${X.good}30` }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.6, color: X.good, textTransform: 'uppercase', marginBottom: 12 }}>
            prognóstico se aplicarem o plano
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 12 }}>
            <div style={{ fontFamily: FNUM, fontSize: 52, fontWeight: 300, letterSpacing: -2, color: X.good, lineHeight: 1 }}>
              {prognosis}<span style={{ fontSize: 20 }}>%</span>
            </div>
            <div style={{ fontSize: 13, color: X.textSoft }}>probabilidade<br/>de melhoria real</div>
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 14 }}>
            <div style={{ width: `${prognosis}%`, height: '100%', background: `linear-gradient(90deg, ${X.good}88, ${X.good})`, transition: 'width 1s ease' }}/>
          </div>
          {conditions.length > 0 && (
            <>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, color: X.textMute, textTransform: 'uppercase', marginBottom: 8 }}>condições</div>
              {conditions.map((c, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
                  <div style={{ width: 5, height: 5, borderRadius: 3, background: X.good, marginTop: 7, flexShrink: 0 }}/>
                  <div style={{ fontSize: 13, color: X.textSoft, lineHeight: 1.5 }}>{c}</div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}

/* ════════════════════════════════════════════════════
   DASHBOARD
════════════════════════════════════════════════════ */

function Dashboard({ verdict, name1, name2, onSelect, onShare, onNewAnalysis, nav, copied }) {
  const v = verdict
  const isSalvageable = v?.is_relationship_salvageable ?? true

  const CARDS = [
    {
      id: 'analysis',
      emoji: '🧠',
      label: 'Análise Clínica',
      desc: 'Diagnóstico psicológico profundo baseado em evidência clínica',
      color: X.acc1,
    },
    {
      id: 'attachment',
      emoji: '🔗',
      label: 'Perfis de Vinculação',
      desc: v?.attachment_style_1 && v?.attachment_style_2
        ? `${v.attachment_style_1} × ${v.attachment_style_2}`
        : 'Como cada pessoa se liga emocionalmente',
      color: X.acc2,
    },
    {
      id: 'patterns',
      emoji: '♟',
      label: 'Padrões Detectados',
      desc: v?.gottman_horsemen?.length
        ? `${v.gottman_horsemen.length} cavaleiro${v.gottman_horsemen.length > 1 ? 's' : ''} de Gottman`
        : 'Comportamentos destrutivos identificados',
      color: X.warm,
    },
    {
      id: 'needs',
      emoji: '🎯',
      label: 'O que cada um precisa',
      desc: 'A necessidade emocional real por baixo do conflito',
      color: '#34D399',
    },
    {
      id: 'letter',
      emoji: '💌',
      label: 'Carta da Mara',
      desc: 'Uma mensagem pessoal para cada um',
      color: '#FF6BB1',
    },
    {
      id: 'plan',
      emoji: '🗺',
      label: 'Plano de Resolução',
      desc: v?.prognosis_pct ? `${v.prognosis_pct}% de probabilidade de melhoria` : 'Passos concretos para mudar',
      color: '#34D399',
    },
  ]

  return (
    <div style={{ padding: '20px 24px 44px', flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
        <XBack onClick={() => nav('/verdict')} />
        <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 5 }}>
          {[0,1,2,3].map(i => (
            <div key={i} style={{ height: 3, borderRadius: 2, width: i === 1 ? 22 : 6, background: i <= 1 ? GRAD : 'rgba(255,255,255,0.10)' }}/>
          ))}
        </div>
        <div onClick={onShare} style={{ width: 36, height: 36, borderRadius: 18, background: copied ? `${X.good}22` : 'rgba(255,255,255,0.05)', border: `1px solid ${copied ? X.good : X.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          {copied
            ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-6" stroke={X.good} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            : <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="2.5" cy="6" r="1.2" stroke={X.textSoft} strokeWidth="1"/><circle cx="9.5" cy="2.5" r="1.2" stroke={X.textSoft} strokeWidth="1"/><circle cx="9.5" cy="9.5" r="1.2" stroke={X.textSoft} strokeWidth="1"/><path d="M3.7 5.4l4-2M3.7 6.6l4 2" stroke={X.textSoft} strokeWidth="1"/></svg>
          }
        </div>
      </div>

      {/* Title */}
      <div style={{ marginTop: 20 }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.8, color: X.acc1, textTransform: 'uppercase' }}>relatório completo</div>
        <h1 style={{ margin: '8px 0 0', fontFamily: FED, fontSize: 30, fontWeight: 400, letterSpacing: -0.9, lineHeight: 1.05, color: X.text }}>
          {isSalvageable
            ? <>Não basta saber quem.<br/><em style={{ fontStyle:'italic', background: GRAD_TXT, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>Importa o como.</em></>
            : <>A coragem de{' '}<em style={{ fontStyle:'italic', background: GRAD_TXT, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>te escolheres.</em></>
          }
        </h1>
      </div>

      {/* Section cards */}
      <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 9 }}>
        {CARDS.map((card, i) => (
          <div
            key={card.id}
            onClick={() => onSelect(card.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
              borderRadius: 18, cursor: 'pointer',
              background: 'rgba(255,255,255,0.028)', border: `1px solid ${card.color}30`,
              position: 'relative', overflow: 'hidden',
            }}
          >
            {/* Left accent bar */}
            <div style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 3, borderRadius: 2, background: card.color }}/>

            {/* Icon */}
            <div style={{
              width: 42, height: 42, borderRadius: 13, flexShrink: 0,
              background: `${card.color}14`, border: `1px solid ${card.color}28`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
            }}>{card.emoji}</div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: X.text, letterSpacing: -0.2 }}>{card.label}</div>
              <div style={{ fontSize: 12, color: X.textMute, marginTop: 2, lineHeight: 1.4 }}>{card.desc}</div>
            </div>

            {/* Chevron */}
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
              <path d="M6 4l4 4-4 4" stroke={card.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, minHeight: 20 }} />

      {/* CTAs */}
      <div onClick={onShare} style={{ height: 52, borderRadius: 999, background: GRAD, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, cursor: 'pointer', boxShadow: `0 10px 32px ${X.acc1}40`, fontSize: 15, fontWeight: 600, fontFamily: FUI, color: '#fff' }}>
        {copied
          ? <><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>Copiado!</>
          : <><svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="4" cy="8" r="1.8" stroke="#fff" strokeWidth="1.3"/><circle cx="12" cy="3" r="1.8" stroke="#fff" strokeWidth="1.3"/><circle cx="12" cy="13" r="1.8" stroke="#fff" strokeWidth="1.3"/><path d="M5.8 7l4.4-3M5.8 9l4.4 3" stroke="#fff" strokeWidth="1.3"/></svg>Partilhar análise</>
        }
      </div>
      <div onClick={onNewAnalysis} style={{ marginTop: 9, height: 46, borderRadius: 999, background: 'rgba(255,255,255,0.03)', border: `1px solid ${X.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', fontSize: 13.5, fontWeight: 500, color: X.textSoft }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7a5 5 0 015-5 5 5 0 014.5 2.8" stroke={X.textSoft} strokeWidth="1.4" strokeLinecap="round"/><path d="M11.5 2l.5 3-3-.5" stroke={X.textSoft} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
        Nova análise
      </div>
      <div style={{ marginTop: 10, textAlign: 'center', fontSize: 11.5, color: X.textMute }}>🔒 confidencial · só você tem acesso</div>
    </div>
  )
}

/* ════════════════════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════════════════════ */
export default function S10Resolution() {
  const nav = useNavigate()
  const { data, update } = useApp()
  const [section, setSection] = useState(null)  // null = dashboard
  const [copied,  setCopied]  = useState(false)

  const verdict = data.verdict
  const name1   = data.name1 || ''
  const name2   = data.name2 || ''
  const side    = data.side === 2 ? 2 : 1

  function buildSummary() {
    const v = verdict
    return [
      `📊 Mara.ai — Relatório de ${name1} & ${name2}`,
      ``,
      v?.verdict_title ? `Veredicto: ${v.verdict_title}` : '',
      `${name1} ${v?.blame_pct_1 ?? '?'}%  ·  ${name2} ${v?.blame_pct_2 ?? '?'}%`,
      `Saúde: ${v?.relationship_health || ''}`,
      v?.main_reason ? `\n"${v.main_reason}"` : '',
      ``,
      `— mara.ai`,
    ].filter(Boolean).join('\n')
  }

  async function handleShare() {
    const text = section === 'letter' && verdict?.letter_1
      ? verdict.letter_1
      : buildSummary()
    if (navigator.share) {
      try { await navigator.share({ text, title: 'Mara.ai — Análise Relacional' }) } catch {}
    } else {
      await navigator.clipboard.writeText(text)
      setCopied(true); setTimeout(() => setCopied(false), 2500)
    }
  }

  function handleNewAnalysis() {
    update({ name1:'', name2:'', rel:'casal', duration:50, chat1:null, chat2:null, verdict:null, code:null, side:1, inviteSent:false, skippedInvite:false })
    nav('/')
  }

  const isDashboard = section === null
  const anim = isDashboard ? slideOut : slideIn

  return (
    <div style={{ position: 'relative', flex: 1, background: X.ink, display: 'flex', flexDirection: 'column', height: '100%' }}>
      <XStatus />
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        background: `radial-gradient(ellipse at 70% 0%, ${X.acc2}18 0%, transparent 50%),
                     radial-gradient(ellipse at 20% 70%, ${X.acc1}10 0%, transparent 45%)`,
      }}/>

      <div style={{ position: 'relative', zIndex: 1, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={section ?? 'dashboard'}
            initial={anim.initial}
            animate={anim.animate}
            exit={anim.exit}
            transition={ease}
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
          >
            {section === null && (
              <Dashboard
                verdict={verdict} name1={name1} name2={name2}
                onSelect={setSection} onShare={handleShare}
                onNewAnalysis={handleNewAnalysis} nav={nav} copied={copied}
              />
            )}
            {section === 'analysis'   && <ViewAnalysis   v={verdict} onBack={() => setSection(null)} />}
            {section === 'attachment' && <ViewAttachment v={verdict} name1={name1} name2={name2} onBack={() => setSection(null)} />}
            {section === 'patterns'   && <ViewPatterns   v={verdict} onBack={() => setSection(null)} />}
            {section === 'needs'      && <ViewNeeds      v={verdict} name1={name1} name2={name2} side={side} onBack={() => setSection(null)} />}
            {section === 'letter'     && <ViewLetter     v={verdict} name1={name1} name2={name2} side={side} onBack={() => setSection(null)} onShare={handleShare} copied={copied} />}
            {section === 'plan'       && <ViewPlan       v={verdict} onBack={() => setSection(null)} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
