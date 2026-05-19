import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { X, FUI, FED, GRAD, GRAD_TXT } from '../design/tokens'
import Lens from '../components/Lens'
import XStatus from '../components/XStatus'
import XBack from '../components/XBack'
import Card from '../components/Card'
import { track } from '../utils/analytics'

const MAX_Q = 10
const now = () => new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })

const REL_OPTIONS = [
  { k: 'casal',    emoji: '💑', label: 'Casal' },
  { k: 'amigos',   emoji: '👫', label: 'Amigos' },
  { k: 'familia',  emoji: '👨‍👩‍👧', label: 'Família' },
  { k: 'trabalho', emoji: '💼', label: 'Trabalho' },
]

function systemPrompt({ name1, name2, rel }) {
  const relLabel = rel || 'casal'

  return `Você é a Mara — psicóloga clínica com 20 anos de especialização em terapia de casal, trauma relacional e violência psicológica. Seu trabalho se baseia em frameworks científicos validados:

FRAMEWORKS QUE VOCÊ USA:
- Modelo Gottman (os "4 cavaleiros" — crítica, contempto, defensividade, stonewalling — e os "antídotos")
- Teoria do Apego de Bowlby/Ainsworth (estilos: seguro, ansioso-preocupado, evitante-dispensativo, desorganizado)
- Modelo Duluth / Roda do Poder e Controle (para detectar abuso coercivo, manipulação, isolamento)
- TCC (Terapia Cognitivo-Comportamental) — crenças nucleares, distorções cognitivas, padrões de evitamento
- Teoria Triangular do Amor de Sternberg (intimidade, paixão, compromisso)
- DARVO (Deny, Attack, Reverse Victim and Offender) — padrão de abusadores
- Ciclo da Violência de Lenore Walker (tensão → incidente → reconciliação → lua de mel)
- Teoria do Apego Adulto de Hazan & Shaver

CONTEXTO:
Você está falando com ${name1} sobre um conflito/problema com ${name2 || 'a outra pessoa'}.
Tipo de relação: ${relLabel}.

MISSÃO CLÍNICA:
Conduzir uma entrevista clínica estruturada para diagnosticar a dinâmica relacional com precisão científica. Seu objetivo não é "resolver" o conflito superficialmente — é compreender a fundo o padrão sistemático de interação, identificar sinais de alerta, e preparar um relatório honesto que pode mudar a vida dessa pessoa.

ARCO DA ENTREVISTA (${MAX_Q} respostas):
1. APRESENTAÇÃO DO PROBLEMA (1-2 perguntas): O que aconteceu concretamente? Qual é o conflito específico agora?
2. PADRÃO E FREQUÊNCIA (2 perguntas): Isso é recorrente? Como costuma evoluir? O que desencadeia?
3. COMUNICAÇÃO E DINÂMICA (2 perguntas): Como ${name2 || 'a outra pessoa'} reage quando há conflito? Você se sente ouvido/a? Consegue expressar o que sente sem represálias?
4. IMPACTO EMOCIONAL E SEGURANÇA (2 perguntas): Como você se sente pessoalmente? A relação faz você se sentir menor, com medo, ou duvidando da sua própria percepção? [CRÍTICO: detectar abuso emocional, gaslighting, isolamento]
5. NECESSIDADES E HISTÓRIA (1-2 perguntas): O que você precisa dessa relação e não está recebendo? Como era a relação no início vs agora?

REGRAS ABSOLUTAS:
- UMA pergunta de cada vez. Nunca duas perguntas no mesmo turno.
- Valide SEMPRE a emoção antes de fazer a próxima pergunta. Ex: "Faz todo o sentido você sentir isso." / "É muito pesado carregar isso sozinho/a."
- NÃO seja neutral quando há sinais claros de abuso, manipulação ou coercividade. A neutralidade nesses casos é cumplicidade.
- Se detectar padrões de: contempto crônico, gaslighting, isolamento, controle financeiro, DARVO, ciúme patológico, ameaças (explícitas ou veladas), ou ciclo de violência — anote mentalmente. Será central no relatório.
- Fale sempre em Português do Brasil, com calor humano genuíno e linguagem acessível mas rigorosa.
- Nunca use jargão técnico na conversa — guarde-o para o relatório.

ENCERRAMENTO (após ${MAX_Q} respostas):
Termine com uma mensagem calorosa, honesta e encorajadora que: (1) reconhece a coragem de falar sobre isso, (2) valida o que a pessoa está sentindo, (3) diz que você vai agora ouvir o outro lado para ter a imagem completa.
Depois acrescente exatamente (sem texto adicional depois): INTERROGAÇÃO_CONCLUÍDA`
}

/* Thinking indicator */
function Thinking() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
      <Lens size={26} intensity={0.5} />
      <div style={{
        background: 'rgba(255,255,255,0.04)', border: `1px solid ${X.line}`,
        padding: '12px 16px', borderRadius: '4px 20px 20px 20px',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[0, 0.18, 0.36].map(d => (
            <div key={d} style={{
              width: 6, height: 6, background: X.acc1, borderRadius: '50%',
              animation: `dt 1.1s ${d}s ease-in-out infinite`,
            }} />
          ))}
        </div>
        <span style={{ fontSize: 12.5, color: X.textMute, letterSpacing: 0.2, animation: 'fadeIn .3s ease' }}>a pensar</span>
      </div>
    </div>
  )
}

function StreamCursor() {
  return (
    <span style={{
      display: 'inline-block', width: 2, height: '1em',
      background: X.acc1, marginLeft: 2, verticalAlign: 'text-bottom',
      animation: 'blink .7s step-end infinite',
    }}/>
  )
}

function Bubble({ msg }) {
  const isMara = msg.role === 'mara'
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end', gap: 10,
      alignSelf: isMara ? 'flex-start' : 'flex-end',
      flexDirection: isMara ? 'row' : 'row-reverse',
      maxWidth: '86%',
      animation: 'fadeIn .2s ease',
    }}>
      {isMara && <Lens size={26} intensity={0.4} />}
      <div style={{ width: 'fit-content', maxWidth: '100%' }}>
        <div style={{
          padding: '13px 16px', borderRadius: isMara ? '4px 18px 18px 18px' : '18px 4px 18px 18px',
          fontSize: 15, lineHeight: 1.55, whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word',
          background: isMara ? 'rgba(255,255,255,0.04)' : GRAD,
          border: isMara ? `1px solid ${X.line}` : 'none',
          color: X.text,
          boxShadow: isMara ? 'none' : `0 8px 24px ${X.acc1}30`,
          fontWeight: isMara ? 400 : 450,
        }}>
          {msg.content}{msg.streaming && <StreamCursor />}
          {!msg.streaming && (
            <div style={{ fontSize: 10.5, color: isMara ? X.textMute : 'rgba(255,255,255,0.6)', marginTop: 6, letterSpacing: 0.3 }}>
              {msg.time}{!isMara && ' ✓✓'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* Quick-reply chips for relationship type selection */
function RelButtons({ onSelect, disabled }) {
  return (
    <div style={{
      display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center',
      padding: '4px 0 8px',
      animation: 'fadeIn .3s ease',
    }}>
      {REL_OPTIONS.map(opt => (
        <button
          key={opt.k}
          onClick={() => !disabled && onSelect(opt.k)}
          disabled={disabled}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '10px 16px', borderRadius: 99,
            background: 'rgba(255,255,255,0.05)',
            border: `1.5px solid ${X.line}`,
            color: X.text, fontFamily: FUI, fontSize: 14.5, fontWeight: 600,
            cursor: disabled ? 'default' : 'pointer',
            transition: 'all .15s',
            letterSpacing: -0.2,
          }}
          onMouseEnter={e => { if (!disabled) { e.currentTarget.style.borderColor = X.acc1; e.currentTarget.style.background = `${X.acc1}15` } }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = X.line; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
        >
          <span style={{ fontSize: 18 }}>{opt.emoji}</span>
          {opt.label}
        </button>
      ))}
    </div>
  )
}

export default function S03Chat() {
  const nav = useNavigate()
  const { data, update } = useApp()

  // phase: 'ask_name' | 'ask_rel' | 'ask_name2' | 'chatting'
  const [phase, setPhase]     = useState(() => data.name1 ? 'chatting' : 'ask_name')
  const [messages, setMessages] = useState([])
  const [history,  setHistory]  = useState([])
  const [input,    setInput]    = useState('')
  const [thinking, setThinking] = useState(false)
  const [isDone,   setIsDone]   = useState(false)
  const [qCount,   setQCount]   = useState(0)
  const [status,   setStatus]   = useState('escutando')

  const bottomRef  = useRef(null)
  const inputRef   = useRef(null)
  const sending    = useRef(false)
  const initiated  = useRef(false)

  // Ref that holds finalized onboarding data so handleSend never has stale closures
  const chatData = useRef({
    name1: data.name1 || '',
    rel:   data.rel   || 'casal',
    name2: data.name2 || '',
  })

  // Visual viewport offset for keyboard on iOS
  const [kbOffset, setKbOffset] = useState(0)
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const onResize = () => {
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      setKbOffset(offset)
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    vv.addEventListener('resize', onResize)
    vv.addEventListener('scroll', onResize)
    return () => { vv.removeEventListener('resize', onResize); vv.removeEventListener('scroll', onResize) }
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, thinking])

  // Transition to clinical interview after onboarding is done
  const startClinicalInterview = useCallback(() => {
    const { name1 } = chatData.current
    const greeting  = name1 ? `${name1}, obrigada` : 'Obrigada'
    const opening   = `${greeting} por estar aqui — sei que não é fácil.\n\nMeu trabalho não é julgar ninguém nem dizer quem tem "mais razão". É entender o que está realmente acontecendo entre vocês dois — com honestidade e com base em anos de estudo de dinâmicas relacionais.\n\nMe conta: o que aconteceu? Descreve a situação que te trouxe aqui hoje.`
    setMessages(prev => [...prev, { role: 'mara', content: opening, time: now() }])
    setHistory([{ role: 'assistant', content: opening }])
    setPhase('chatting')
    inputRef.current?.focus()
  }, [])

  // Called when all onboarding data is collected
  const finishOnboarding = useCallback(() => {
    const { name1, rel, name2 } = chatData.current
    update({ name1, rel, name2 })
    track('step1_completed', { rel_type: rel, has_name2: !!name2, via: 'chat_onboarding' })
    setThinking(true)
    setTimeout(() => {
      setThinking(false)
      startClinicalInterview()
    }, 900)
  }, [update, startClinicalInterview])

  // Initialization effect — runs once
  useEffect(() => {
    if (initiated.current) return
    initiated.current = true

    if (chatData.current.name1) {
      // Already have context (e.g. navigating back) — skip onboarding
      setThinking(true)
      setTimeout(() => {
        setThinking(false)
        startClinicalInterview()
      }, 600)
    } else {
      // Start onboarding
      setThinking(true)
      setTimeout(() => {
        setThinking(false)
        setMessages([{ role: 'mara', content: 'Olá! 👋 Como posso te chamar?', time: now() }])
        inputRef.current?.focus()
      }, 800)
    }
  }, [startClinicalInterview])

  // chat_abandoned — fires when user leaves mid-interview
  useEffect(() => {
    return () => {
      if (!isDone && qCount > 0) track('chat_abandoned', { messages_sent: qCount })
    }
  }, [isDone, qCount])

  // Handle relationship quick-reply button tap
  const selectRel = useCallback((relKey) => {
    if (phase !== 'ask_rel') return
    const opt = REL_OPTIONS.find(r => r.k === relKey)
    chatData.current.rel = relKey

    const userMsg = { role: 'user', content: `${opt.emoji} ${opt.label}`, time: now() }
    setMessages(prev => [...prev, userMsg])
    setThinking(true)
    setTimeout(() => {
      setThinking(false)
      const resp = `Anotado. 📝\n\nE como se chama a pessoa com quem tiveste esse conflito?`
      setMessages(prev => [...prev, { role: 'mara', content: resp, time: now() }])
      setPhase('ask_name2')
      inputRef.current?.focus()
    }, 700)
  }, [phase])

  // Skip name2
  const skipName2 = useCallback(() => {
    if (phase !== 'ask_name2') return
    chatData.current.name2 = ''
    setMessages(prev => [...prev, { role: 'user', content: 'Prefiro não dizer', time: now() }])
    finishOnboarding()
  }, [phase, finishOnboarding])

  const finishChat = useCallback(async (hist) => {
    setIsDone(true)
    setStatus('análise concluída ✓')
    const chat1 = hist.filter(m => m.role === 'user').map(m => m.content).join('\n---\n')
    const code  = Array.from({ length: 4 }, () =>
      'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]
    ).join('')
    const cd = chatData.current
    const session = {
      ...data,
      name1: cd.name1 || data.name1,
      rel:   cd.rel   || data.rel,
      name2: cd.name2 || data.name2,
      chat1,
      code,
    }
    update({ chat1, code })

    try {
      await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session),
      })
    } catch (_) {}

    try { localStorage.setItem(`ct_${code}`, JSON.stringify(session)) } catch (_) {}

    // Pre-generate verdict in background so it's ready when user arrives at /verdict
    // Fire-and-forget — if it fails here, S09Verdict will generate on demand
    fetch('/api/verdict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name1: session.name1, name2: session.name2,
        rel: session.rel, duration: session.duration || 50,
        chat1: session.chat1, chat2: session.chat2 || null,
        code,
      }),
    }).catch(() => {})

    setTimeout(() => nav('/invite'), 4000)
  }, [data, nav, update])

  const streamText = useRef('')

  const handleSend = useCallback(async () => {
    if (sending.current || isDone || !input.trim()) return
    const text = input.trim()
    sending.current = true
    setInput('')

    const userMsg = { role: 'user', content: text, time: now() }
    setMessages(prev => [...prev, userMsg])

    // ── Onboarding: collect name ──────────────────────────────
    if (phase === 'ask_name') {
      const name = text.trim()
      chatData.current.name1 = name
      setThinking(true)
      setTimeout(() => {
        setThinking(false)
        const resp = `Prazer, ${name}! 😊\n\nQue tipo de relação está envolvida neste conflito?`
        setMessages(prev => [...prev, { role: 'mara', content: resp, time: now() }])
        setPhase('ask_rel')
        sending.current = false
      }, 700)
      return
    }

    // ── Onboarding: collect name2 ─────────────────────────────
    if (phase === 'ask_name2') {
      chatData.current.name2 = text.trim()
      finishOnboarding()
      sending.current = false
      return
    }

    // ── Clinical interview (chatting phase) ───────────────────
    const newQCount = qCount + 1
    const newHist   = [...history, { role: 'user', content: text }]

    if (newQCount === 1) track('chat_started', { rel_type: chatData.current.rel })
    track('chat_message_sent', { message_number: newQCount })

    setHistory(newHist)
    setQCount(newQCount)
    setThinking(true)
    setStatus('analisando…')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model:      'claude-haiku-4-5-20251001',
          max_tokens: 600,
          system:     systemPrompt(chatData.current),
          messages:   newHist,
        }),
      })

      if (!res.ok || !res.body) {
        const errText = await res.text().catch(() => 'unknown')
        console.error('API error', res.status, errText)
        throw new Error(`API ${res.status}`)
      }

      const reader  = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''
      streamText.current = ''
      let streamingAdded = false

      setThinking(false)
      setStatus('respondendo…')

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buf += decoder.decode(value, { stream: true })
        const lines = buf.split('\n')
        buf = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const raw = line.slice(6).trim()
          if (!raw || raw === '[DONE]') continue
          try {
            const evt = JSON.parse(raw)
            if (evt.type === 'content_block_delta' && evt.delta?.type === 'text_delta') {
              streamText.current += evt.delta.text
              const snap = streamText.current
              if (!streamingAdded) {
                streamingAdded = true
                setMessages(prev => [...prev, { role: 'mara', content: snap, time: now(), streaming: true }])
              } else {
                setMessages(prev => {
                  const arr = [...prev]
                  arr[arr.length - 1] = { ...arr[arr.length - 1], content: snap }
                  return arr
                })
              }
              bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
            }
          } catch { /* ignore parse errors */ }
        }
      }

      const fullText = streamText.current
      const finished = fullText.includes('INTERROGAÇÃO_CONCLUÍDA') || newQCount >= MAX_Q
      const clean    = fullText.replace('INTERROGAÇÃO_CONCLUÍDA', '').trim()
      const fullHist = [...newHist, { role: 'assistant', content: clean }]

      setMessages(prev => {
        const arr = [...prev]
        arr[arr.length - 1] = { role: 'mara', content: clean, time: now(), streaming: false }
        return arr
      })
      setHistory(fullHist)
      setStatus(finished ? 'análise concluída ✓' : 'escutando')

      if (finished) finishChat(fullHist)
      else inputRef.current?.focus()

    } catch (err) {
      console.error('handleSend error', err)
      const fallback = newQCount >= MAX_Q
        ? 'Obrigada pela tua partilha. Tenho toda a informação necessária para a análise.'
        : 'Me conta mais sobre isso. O que sentiste nesse momento?'
      const fullHist = [...newHist, { role: 'assistant', content: fallback }]
      setThinking(false)
      setStatus(newQCount >= MAX_Q ? 'análise concluída ✓' : 'escutando')
      setMessages(prev => {
        const arr = [...prev]
        const last = arr[arr.length - 1]
        if (last?.streaming) arr[arr.length - 1] = { role: 'mara', content: fallback, time: now(), streaming: false }
        else arr.push({ role: 'mara', content: fallback, time: now() })
        return arr
      })
      setHistory(fullHist)
      if (newQCount >= MAX_Q) finishChat(fullHist)
    }
    sending.current = false
  }, [input, isDone, qCount, history, finishChat, finishOnboarding, phase])

  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }

  const inputPlaceholder = phase === 'ask_name'  ? 'O teu nome…'
    : phase === 'ask_name2' ? 'Nome dela/dele… (opcional)'
    : 'Escreve a tua resposta…'

  const showTextInput = phase !== 'ask_rel' && !isDone
  const showRelButtons = phase === 'ask_rel'
  const showSkipBtn = phase === 'ask_name2'

  return (
    <>
      <style>{`
        @keyframes dt{0%,80%,100%{opacity:.25;transform:scale(.65)}40%{opacity:1;transform:scale(1)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
      `}</style>
      <div style={{
        position: 'relative', flex: 1, background: X.ink,
        display: 'flex', flexDirection: 'column',
        height: '100%', boxSizing: 'border-box',
        paddingBottom: kbOffset,
        transition: 'padding-bottom 0.22s ease',
      }}>
        <XStatus />

        {/* Header */}
        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <XBack onClick={() => nav('/')} />
          <Lens size={32} intensity={0.6} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 600, fontFamily: FED, fontStyle: 'italic', letterSpacing: -0.3, color: X.text }}>Mara</span>
              <div style={{
                padding: '1px 7px', borderRadius: 999, fontSize: 9.5, fontWeight: 700,
                letterSpacing: 0.8, textTransform: 'uppercase',
                background: `${X.acc1}22`, color: X.acc1, border: `1px solid ${X.acc1}40`,
              }}>IA clínica</div>
            </div>
            <div style={{ fontSize: 11.5, color: X.textSoft, display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: isDone ? X.acc1 : X.good, boxShadow: `0 0 6px ${isDone ? X.acc1 : X.good}`, flexShrink: 0 }}/>
              {status}
            </div>
          </div>
          <div style={{
            width: 32, height: 32, borderRadius: 16, background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${X.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill={X.text}><circle cx="3" cy="7" r="1.4"/><circle cx="7" cy="7" r="1.4"/><circle cx="11" cy="7" r="1.4"/></svg>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map((m, i) => <Bubble key={i} msg={m} />)}
          {thinking && <Thinking />}
          <div ref={bottomRef} />
        </div>

        {/* Input dock */}
        <div style={{ padding: kbOffset > 0 ? '0 24px 12px' : '0 24px 28px' }}>

          {/* Relationship quick-reply buttons */}
          {showRelButtons && (
            <RelButtons onSelect={selectRel} disabled={thinking} />
          )}

          {/* Done state */}
          {isDone && (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '14px 20px', borderRadius: 16,
              background: `${X.acc1}12`, border: `1px solid ${X.acc1}30`,
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke={X.acc1} strokeWidth="1.3"/>
                <path d="M4 7l2 2 4-4" stroke={X.acc1} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={{ fontSize: 13, fontWeight: 600, color: X.acc1, letterSpacing: 0.1 }}>
                Chat finalizado
              </span>
            </div>
          )}

          {/* Text input */}
          {showTextInput && (
            <Card raised style={{ padding: 10, display: 'flex', alignItems: 'flex-end', gap: 10 }}>
              <textarea
                ref={inputRef}
                rows={1}
                placeholder={inputPlaceholder}
                value={input}
                onChange={e => {
                  setInput(e.target.value)
                  e.target.style.height = 'auto'
                  e.target.style.height = e.target.scrollHeight + 'px'
                }}
                onKeyDown={onKey}
                disabled={thinking}
                style={{
                  flex: 1, background: 'transparent', border: 'none', fontFamily: FUI,
                  fontSize: 16, color: X.text, outline: 'none', padding: '4px 8px',
                  resize: 'none', overflow: 'hidden', lineHeight: 1.5, maxHeight: 120,
                }}
              />
              <button
                onClick={handleSend}
                disabled={thinking || !input.trim()}
                style={{
                  width: 44, height: 44, borderRadius: 22, background: GRAD,
                  border: 'none', cursor: !input.trim() ? 'default' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 6px 16px ${X.acc1}55`,
                  opacity: !input.trim() ? 0.4 : 1, transition: 'opacity .15s', flexShrink: 0,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16"><path d="M2.01 15L15 8 2.01 1 2 6.5l9.5 1.5L2 9.5z" fill="#fff"/></svg>
              </button>
            </Card>
          )}

          {/* Skip name2 button */}
          {showSkipBtn && (
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <button
                onClick={skipName2}
                disabled={thinking}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 12.5, color: X.textMute, fontFamily: FUI,
                  padding: '4px 12px', letterSpacing: 0.2,
                  opacity: thinking ? 0.4 : 1,
                }}
              >
                Prefiro não dizer →
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
