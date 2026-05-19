import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { X, FUI, FED, GRAD, GRAD_TXT } from '../design/tokens'
import Lens from '../components/Lens'
import XStatus from '../components/XStatus'
import XBack from '../components/XBack'
import Card from '../components/Card'
import { track, pixel } from '../utils/analytics'

const MAX_Q = 10
const now = () => new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })

// ── Onboarding question definitions ─────────────────────────────────────────

const Q_REL = {
  key: 'ask_rel',
  options: [
    { k: 'casal',    emoji: '💑', label: 'Casal',     sub: 'parceiro/a, ex' },
    { k: 'amigos',   emoji: '👫', label: 'Amizade',   sub: 'amigo/a, grupo' },
    { k: 'familia',  emoji: '👨‍👩‍👧', label: 'Família',  sub: 'pais, irmãos'  },
    { k: 'trabalho', emoji: '💼', label: 'Trabalho',  sub: 'colega, chefe'  },
  ],
}

const Q_DURATION = {
  key: 'ask_duration',
  options: [
    { k: 'menos_6m',  label: 'Menos de 6 meses'  },
    { k: '6m_2a',     label: '6 meses a 2 anos'  },
    { k: '2a_5a',     label: '2 a 5 anos'         },
    { k: 'mais_5a',   label: 'Mais de 5 anos'     },
  ],
}

const Q_TRIGGER = {
  key: 'ask_trigger',
  options: [
    { k: 'discussao',   label: 'Uma discussão recente'     },
    { k: 'repetido',    label: 'Comportamento repetido'    },
    { k: 'traicao',     label: 'Traição ou mentira'        },
    { k: 'afastamento', label: 'Afastamento emocional'     },
  ],
}

const Q_FEELING = {
  key: 'ask_feeling',
  options: [
    { k: 'magoado',   label: 'Magoado/a e confuso/a'      },
    { k: 'zangado',   label: 'Zangado/a e frustrado/a'    },
    { k: 'ansioso',   label: 'Ansioso/a e inseguro/a'     },
    { k: 'exausto',   label: 'Exausto/a emocionalmente'   },
  ],
}

// ── System prompt ────────────────────────────────────────────────────────────

function systemPrompt({ name1, name2, rel, duration, trigger, feeling }) {
  const relLabel = rel || 'casal'
  const durationMap = {
    menos_6m: 'menos de 6 meses', '6m_2a': '6 meses a 2 anos',
    '2a_5a': '2 a 5 anos', mais_5a: 'mais de 5 anos',
  }
  const triggerMap = {
    discussao: 'uma discussão recente', repetido: 'comportamento repetido',
    traicao: 'traição ou mentira', afastamento: 'afastamento emocional',
  }
  const feelingMap = {
    magoado: 'magoado/a e confuso/a', zangado: 'zangado/a e frustrado/a',
    ansioso: 'ansioso/a e inseguro/a', exausto: 'exausto/a emocionalmente',
  }
  const durLabel      = durationMap[duration] || ''
  const triggerLabel  = triggerMap[trigger]   || ''
  const feelingLabel  = feelingMap[feeling]   || ''

  return `Você é a Mara — psicóloga clínica com 20 anos de especialização em terapia de casal, trauma relacional e violência psicológica. Seu trabalho se baseia em frameworks científicos validados:

FRAMEWORKS:
- Modelo Gottman (4 cavaleiros + antídotos; ratio 5:1)
- Teoria do Apego de Bowlby/Ainsworth (seguro, ansioso, evitante, desorganizado)
- Modelo Duluth / Roda do Poder e Controle
- TCC — crenças nucleares, distorções cognitivas
- DARVO (Deny, Attack, Reverse Victim and Offender)
- Ciclo da Violência de Lenore Walker
- Teoria Triangular do Amor de Sternberg

CONTEXTO JÁ RECOLHIDO:
- ${name1} está a falar sobre um conflito com ${name2 || 'a outra pessoa'}
- Tipo de relação: ${relLabel}${durLabel ? ` — há ${durLabel}` : ''}
${triggerLabel ? `- O que desencadeou: ${triggerLabel}` : ''}
${feelingLabel ? `- Como ${name1} se sente agora: ${feelingLabel}` : ''}

IMPORTANTE: O utilizador JÁ respondeu às perguntas acima. NÃO repitas essas questões. Começa DIRETAMENTE a pedir que descrevam o que aconteceu concretamente.

MISSÃO CLÍNICA:
Conduzir uma entrevista clínica estruturada para diagnosticar a dinâmica relacional com precisão científica. Identificar padrões, sinais de alerta, e preparar um relatório honesto.

ARCO DA ENTREVISTA (${MAX_Q} respostas):
1. APRESENTAÇÃO DO PROBLEMA (1-2 perguntas): O que aconteceu concretamente?
2. PADRÃO E FREQUÊNCIA (2 perguntas): Isso é recorrente? O que desencadeia?
3. COMUNICAÇÃO E DINÂMICA (2 perguntas): Como ${name2 || 'a outra pessoa'} reage? Sente-se ouvido/a?
4. IMPACTO EMOCIONAL E SEGURANÇA (2 perguntas): Como se sente? [CRÍTICO: gaslighting, abuso]
5. NECESSIDADES E HISTÓRIA (1-2 perguntas): O que precisa? Como era no início vs agora?

REGRAS ABSOLUTAS:
- UMA pergunta de cada vez. Nunca duas no mesmo turno.
- Valide SEMPRE a emoção antes da próxima pergunta.
- NÃO seja neutral perante sinais claros de abuso ou manipulação.
- Fale sempre em Português do Brasil, com calor humano e linguagem acessível.
- Nunca use jargão técnico na conversa.

ENCERRAMENTO (após ${MAX_Q} respostas):
Termine com uma mensagem calorosa que: (1) reconhece a coragem, (2) valida o que sente, (3) diz que vai ouvir o outro lado.
Depois acrescente exatamente: INTERROGAÇÃO_CONCLUÍDA`
}

// ── UI Components ────────────────────────────────────────────────────────────

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
        <span style={{ fontSize: 12.5, color: X.textMute, letterSpacing: 0.2 }}>a pensar</span>
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
      animation: 'fadeIn .25s ease',
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

/* Full-width stacked option buttons */
function OptionButtons({ options, onSelect, disabled }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 8,
      animation: 'slideUp .3s ease',
      paddingBottom: 4,
    }}>
      {options.map(opt => (
        <button
          key={opt.k}
          onClick={() => !disabled && onSelect(opt.k, opt.label, opt.emoji)}
          disabled={disabled}
          style={{
            width: '100%', padding: '14px 18px',
            borderRadius: 14,
            background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${X.line}`,
            color: X.text, fontFamily: FUI,
            fontSize: 15, fontWeight: 500,
            cursor: disabled ? 'default' : 'pointer',
            textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: 10,
            transition: 'background .15s, border-color .15s',
            letterSpacing: -0.1,
          }}
          onMouseEnter={e => {
            if (!disabled) {
              e.currentTarget.style.background = `${X.acc1}12`
              e.currentTarget.style.borderColor = `${X.acc1}60`
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
            e.currentTarget.style.borderColor = X.line
          }}
        >
          {opt.emoji && <span style={{ fontSize: 19, flexShrink: 0 }}>{opt.emoji}</span>}
          <div style={{ flex: 1 }}>
            <div>{opt.label}</div>
            {opt.sub && <div style={{ fontSize: 11.5, color: X.textMute, marginTop: 1 }}>{opt.sub}</div>}
          </div>
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, opacity: 0.3 }}>
            <path d="M5 3l4 4-4 4" stroke={X.text} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      ))}
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

// Onboarding phases in order
const OB_PHASES = ['ask_name', 'ask_rel', 'ask_duration', 'ask_trigger', 'ask_feeling', 'ask_name2', 'chatting']

export default function S03Chat() {
  const nav = useNavigate()
  const { data, update } = useApp()

  const [phase,    setPhase]    = useState(() => data.name1 ? 'chatting' : 'ask_name')
  const [messages, setMessages] = useState([])
  const [history,  setHistory]  = useState([])
  const [input,    setInput]    = useState('')
  const [thinking, setThinking] = useState(false)
  const [isDone,   setIsDone]   = useState(false)
  const [qCount,   setQCount]   = useState(0)
  const [status,   setStatus]   = useState('escutando')

  const bottomRef = useRef(null)
  const inputRef  = useRef(null)
  const sending   = useRef(false)
  const initiated = useRef(false)

  // Accumulates onboarding data — ref avoids stale closures in AI calls
  const chatData = useRef({
    name1:    data.name1    || '',
    rel:      data.rel      || 'casal',
    duration: data.duration || '',
    trigger:  data.trigger  || '',
    feeling:  data.feeling  || '',
    name2:    data.name2    || '',
  })

  // iOS keyboard offset
  const [kbOffset, setKbOffset] = useState(0)
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const onResize = () => {
      setKbOffset(Math.max(0, window.innerHeight - vv.height - vv.offsetTop))
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    vv.addEventListener('resize', onResize)
    vv.addEventListener('scroll', onResize)
    return () => { vv.removeEventListener('resize', onResize); vv.removeEventListener('scroll', onResize) }
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, thinking])

  // ── Clinical interview opening ──────────────────────────────────────────
  const startClinicalInterview = useCallback(() => {
    const { name1, name2, trigger, feeling } = chatData.current

    const triggerMap = {
      discussao: 'uma discussão recente', repetido: 'um comportamento que se repete',
      traicao: 'uma traição ou mentira', afastamento: 'um afastamento emocional',
    }
    const feelingMap = {
      magoado: 'magoado/a', zangado: 'zangado/a',
      ansioso: 'ansioso/a', exausto: 'exausto/a',
    }

    let opening = `Obrigada por compartilhar isso, ${name1} — sei que não é fácil.\n\n`

    if (trigger && feeling) {
      opening += `Percebo que você está ${feelingMap[feeling] || ''} por causa de ${triggerMap[trigger] || 'algo importante'}. Não vou julgar ninguém nem dizer logo quem tem razão — meu trabalho é entender o que está realmente acontecendo entre vocês dois.\n\n`
    } else {
      opening += `Meu trabalho não é julgar ninguém nem dizer quem tem "mais razão" — é entender o que está realmente acontecendo entre vocês dois, com honestidade.\n\n`
    }

    opening += `Me conta: o que aconteceu? Descreve a situação que te trouxe aqui hoje.`

    setMessages(prev => [...prev, { role: 'mara', content: opening, time: now() }])
    setHistory([{ role: 'assistant', content: opening }])
    setPhase('chatting')
    inputRef.current?.focus()
  }, [])

  // ── Finish onboarding, update context, start interview ─────────────────
  const finishOnboarding = useCallback(() => {
    const { name1, rel, duration, trigger, feeling, name2 } = chatData.current
    update({ name1, rel, duration, trigger, feeling, name2 })
    track('step1_completed', { rel_type: rel, has_name2: !!name2, via: 'chat_onboarding' })
    setThinking(true)
    setTimeout(() => {
      setThinking(false)
      startClinicalInterview()
    }, 900)
  }, [update, startClinicalInterview])

  // ── Initialization ──────────────────────────────────────────────────────
  useEffect(() => {
    if (initiated.current) return
    initiated.current = true

    if (chatData.current.name1) {
      setThinking(true)
      setTimeout(() => { setThinking(false); startClinicalInterview() }, 600)
    } else {
      setThinking(true)
      setTimeout(() => {
        setThinking(false)
        setMessages([{ role: 'mara', content: 'Olá! 👋 Como posso te chamar?', time: now() }])
        inputRef.current?.focus()
      }, 800)
    }
  }, [startClinicalInterview])

  useEffect(() => {
    return () => {
      if (!isDone && qCount > 0) track('chat_abandoned', { messages_sent: qCount })
    }
  }, [isDone, qCount])

  // ── Option button tap (rel, duration, trigger, feeling) ────────────────
  const selectOption = useCallback((phaseKey, value, label, emoji) => {
    if (phase !== phaseKey) return

    const display = emoji ? `${emoji} ${label}` : label
    setMessages(prev => [...prev, { role: 'user', content: display, time: now() }])

    let nextPhase, nextQuestion, nextData

    if (phaseKey === 'ask_rel') {
      chatData.current.rel = value
      nextData = value
      const durQ = {
        casal:    'Há quanto tempo estão juntos?',
        amigos:   'Há quanto tempo se conhecem?',
        familia:  'Há quanto tempo este problema existe entre vocês?',
        trabalho: 'Há quanto tempo trabalham juntos?',
      }
      nextQuestion = durQ[value] || 'Há quanto tempo é esta relação?'
      nextPhase = 'ask_duration'
    } else if (phaseKey === 'ask_duration') {
      chatData.current.duration = value
      nextQuestion = 'O que melhor descreve o que desencadeou este conflito?'
      nextPhase = 'ask_trigger'
    } else if (phaseKey === 'ask_trigger') {
      chatData.current.trigger = value
      nextQuestion = 'Como você se sente agora em relação a essa situação?'
      nextPhase = 'ask_feeling'
    } else if (phaseKey === 'ask_feeling') {
      chatData.current.feeling = value
      nextQuestion = 'E a outra pessoa — como ela se chama?'
      nextPhase = 'ask_name2'
    }

    setThinking(true)
    setTimeout(() => {
      setThinking(false)
      setMessages(prev => [...prev, { role: 'mara', content: nextQuestion, time: now() }])
      setPhase(nextPhase)
      if (nextPhase === 'ask_name2') inputRef.current?.focus()
    }, 650)
  }, [phase])

  const skipName2 = useCallback(() => {
    if (phase !== 'ask_name2') return
    chatData.current.name2 = ''
    setMessages(prev => [...prev, { role: 'user', content: 'Prefiro não dizer', time: now() }])
    finishOnboarding()
  }, [phase, finishOnboarding])

  // ── finishChat ──────────────────────────────────────────────────────────
  const finishChat = useCallback(async (hist) => {
    setIsDone(true)
    setStatus('análise concluída ✓')
    const chat1 = hist.filter(m => m.role === 'user').map(m => m.content).join('\n---\n')
    const code  = Array.from({ length: 4 }, () =>
      'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]
    ).join('')
    const cd = chatData.current
    const session = { ...data, name1: cd.name1, rel: cd.rel, duration: cd.duration, trigger: cd.trigger, feeling: cd.feeling, name2: cd.name2, chat1, code }
    update({ chat1, code })

    try {
      await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session),
      })
    } catch (_) {}

    try { localStorage.setItem(`ct_${code}`, JSON.stringify(session)) } catch (_) {}

    // Pre-generate verdict in background
    fetch('/api/verdict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name1: cd.name1, name2: cd.name2, rel: cd.rel,
        duration: cd.duration, chat1, chat2: null, code,
      }),
    }).catch(() => {})

    setTimeout(() => nav('/invite'), 4000)
  }, [data, nav, update])

  const streamText = useRef('')

  // ── handleSend ──────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    if (sending.current || isDone || !input.trim()) return
    const text = input.trim()
    sending.current = true
    setInput('')

    setMessages(prev => [...prev, { role: 'user', content: text, time: now() }])

    // ── Onboarding: name ─────────────────────────────────────────────────
    if (phase === 'ask_name') {
      const name = text.trim()
      chatData.current.name1 = name
      setThinking(true)
      setTimeout(() => {
        setThinking(false)
        setMessages(prev => [...prev, { role: 'mara', content: `Prazer, ${name}! 😊\n\nQue tipo de relação está envolvida nesse conflito?`, time: now() }])
        setPhase('ask_rel')
        sending.current = false
      }, 650)
      return
    }

    // ── Onboarding: name2 ────────────────────────────────────────────────
    if (phase === 'ask_name2') {
      chatData.current.name2 = text.trim()
      finishOnboarding()
      sending.current = false
      return
    }

    // ── Clinical interview ───────────────────────────────────────────────
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

      if (!res.ok || !res.body) throw new Error(`API ${res.status}`)

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
                setMessages(prev => { const a = [...prev]; a[a.length-1] = { ...a[a.length-1], content: snap }; return a })
              }
              bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
            }
          } catch { /* ignore */ }
        }
      }

      const fullText = streamText.current
      const finished = fullText.includes('INTERROGAÇÃO_CONCLUÍDA') || newQCount >= MAX_Q
      const clean    = fullText.replace('INTERROGAÇÃO_CONCLUÍDA', '').trim()
      const fullHist = [...newHist, { role: 'assistant', content: clean }]

      setMessages(prev => { const a = [...prev]; a[a.length-1] = { role: 'mara', content: clean, time: now(), streaming: false }; return a })
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
        const a = [...prev]
        const last = a[a.length-1]
        if (last?.streaming) a[a.length-1] = { role: 'mara', content: fallback, time: now(), streaming: false }
        else a.push({ role: 'mara', content: fallback, time: now() })
        return a
      })
      setHistory(fullHist)
      if (newQCount >= MAX_Q) finishChat(fullHist)
    }
    sending.current = false
  }, [input, isDone, qCount, history, finishChat, finishOnboarding, phase])

  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }

  // What to show in the dock
  const showTextInput  = !['ask_rel', 'ask_duration', 'ask_trigger', 'ask_feeling'].includes(phase) && !isDone
  const currentButtons = {
    ask_rel:      Q_REL.options,
    ask_duration: Q_DURATION.options,
    ask_trigger:  Q_TRIGGER.options,
    ask_feeling:  Q_FEELING.options,
  }[phase]

  const inputPlaceholder = phase === 'ask_name'  ? 'O teu nome…'
    : phase === 'ask_name2' ? 'Nome dela/dele… (opcional)'
    : 'Escreve a tua resposta…'

  return (
    <>
      <style>{`
        @keyframes dt{0%,80%,100%{opacity:.25;transform:scale(.65)}40%{opacity:1;transform:scale(1)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
        @keyframes slideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
      `}</style>
      <div style={{
        position: 'relative', flex: 1, background: X.ink,
        display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box',
        paddingBottom: kbOffset, transition: 'padding-bottom 0.22s ease',
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

        {/* Dock */}
        <div style={{ padding: kbOffset > 0 ? '0 20px 12px' : '0 20px 28px' }}>

          {/* Multiple-choice options */}
          {currentButtons && !thinking && (
            <OptionButtons
              options={currentButtons}
              onSelect={(k, label, emoji) => selectOption(phase, k, label, emoji)}
              disabled={thinking}
            />
          )}

          {/* Done banner */}
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
              <span style={{ fontSize: 13, fontWeight: 600, color: X.acc1 }}>Chat finalizado</span>
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

          {/* Skip name2 */}
          {phase === 'ask_name2' && (
            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <button onClick={skipName2} disabled={thinking} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 12.5, color: X.textMute, fontFamily: FUI, padding: '4px 12px',
                opacity: thinking ? 0.4 : 1,
              }}>
                Prefiro não dizer →
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
