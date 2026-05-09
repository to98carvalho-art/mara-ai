import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { X, FUI, FED, GRAD, GRAD_TXT } from '../design/tokens'
import Lens from '../components/Lens'
import XStatus from '../components/XStatus'
import XBack from '../components/XBack'
import Card from '../components/Card'

const MAX_Q = 10
const now = () => new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })

function systemPrompt({ name1, name2, rel, duration }) {
  const relLabel = rel || 'casal'
  const durLabel = duration < 15 ? 'menos de 6 meses'
    : duration < 30 ? 'entre 6 meses e 1 ano'
    : duration < 50 ? '1 a 3 anos'
    : duration < 70 ? '3 a 5 anos'
    : duration < 85 ? '5 a 10 anos'
    : 'mais de 10 anos'

  return `És a Mara — psicóloga clínica com 20 anos de especialização em terapia de casal, trauma relacional e violência psicológica. O teu trabalho baseia-se em frameworks científicos validados:

FRAMEWORKS QUE USAS:
- Modelo Gottman (os "4 cavaleiros" — crítica, contempto, defensividade, stonewalling — e os "antídotos")
- Teoria da Vinculação de Bowlby/Ainsworth (estilos: seguro, ansioso-preocupado, evitante-dispensativo, desorganizado)
- Modelo Duluth / Roda do Poder e Controlo (para detetar abuso coercivo, manipulação, isolamento)
- TCC (Terapia Cognitivo-Comportamental) — crenças nucleares, distorções cognitivas, padrões de evitamento
- Teoria Triangular do Amor de Sternberg (intimidade, paixão, compromisso)
- DARVO (Deny, Attack, Reverse Victim and Offender) — padrão de abusadores
- Ciclo da Violência de Lenore Walker (tensão → incidente → reconciliação → lua de mel)
- Teoria do Apego Adulto de Hazan & Shaver

CONTEXTO:
Estás a falar com ${name1} sobre um conflito/problema com ${name2}.
Tipo de relação: ${relLabel} | Duração: ${durLabel}.

MISSÃO CLÍNICA:
Conduzir uma entrevista clínica estruturada para diagnosticar a dinâmica relacional com precisão científica. O teu objetivo não é "resolver" o conflito superficialmente — é compreender a fundo o padrão sistemático de interação, identificar sinais de alerta, e preparar um relatório honesto que pode mudar a vida desta pessoa.

ARCO DA ENTREVISTA (${MAX_Q} respostas):
1. APRESENTAÇÃO DO PROBLEMA (1-2 perguntas): O que aconteceu concretamente? Qual é o conflito específico agora?
2. PADRÃO E FREQUÊNCIA (2 perguntas): Isto é recorrente? Como costuma evoluir? O que desencadeia?
3. COMUNICAÇÃO E DINÂMICA (2 perguntas): Como reage ${name2} quando há conflito? Sente-se ouvido/a? Consegue expressar o que sente sem represálias?
4. IMPACTO EMOCIONAL E SEGURANÇA (2 perguntas): Como se sente a nível pessoal? A relação faz-o/a sentir-se menor, com medo, ou a duvidar da sua própria perceção? [CRÍTICO: detetar abuso emocional, gaslighting, isolamento]
5. NECESSIDADES E HISTÓRIA (1-2 perguntas): O que precisa desta relação que não está a receber? Como era a relação no início vs agora?

REGRAS ABSOLUTAS:
- UMA pergunta de cada vez. Nunca duas perguntas no mesmo turno.
- Valida SEMPRE a emoção antes de fazer a próxima pergunta. Ex: "Faz todo o sentido sentires isso." / "É muito pesado carregar com isso sozinho/a."
- NÃO sejas neutral quando há sinais claros de abuso, manipulação ou coercividade. A neutralidade nesses casos é cumplicidade.
- Se detetares padrões de: contempto crónico, gaslighting, isolamento, controlo financeiro, DARVO, ciúme patológico, ameaças (explícitas ou veladas), ou ciclo de violência — anota mentalmente. Será central no relatório.
- Fala sempre em português de Portugal, com calor humano genuíno e linguagem acessível mas rigorosa.
- Nunca uses jargão técnico na conversa — guarda-o para o relatório.

ENCERRAMENTO (após ${MAX_Q} respostas):
Termina com uma mensagem calorosa, honesta e encorajadora que: (1) reconhece a coragem de falar sobre isto, (2) valida o que a pessoa está a sentir, (3) diz que vais agora ouvir o outro lado para teres a imagem completa.
Depois acrescenta exactamente (sem texto adicional depois): INTERROGAÇÃO_CONCLUÍDA`
}

/* Thinking indicator — pulsing "a pensar" text */
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
        <span style={{ fontSize: 12.5, color: X.textMute, letterSpacing: 0.2, animation: 'fadeIn .3s ease' }}>a analisar</span>
      </div>
    </div>
  )
}

/* Streaming cursor that blinks at end of message */
function StreamCursor() {
  return (
    <span style={{
      display: 'inline-block', width: 2, height: '1em',
      background: X.acc1, marginLeft: 2, verticalAlign: 'text-bottom',
      animation: 'blink .7s step-end infinite',
    }}/>
  )
}

/* Single message bubble */
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
      <div>
        <div style={{
          padding: '13px 16px', borderRadius: isMara ? '4px 18px 18px 18px' : '18px 4px 18px 18px',
          fontSize: 15, lineHeight: 1.55, whiteSpace: 'pre-wrap',
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

export default function S03Chat() {
  const nav = useNavigate()
  const { data, update } = useApp()

  const [messages,  setMessages]  = useState([])
  const [history,   setHistory]   = useState([])
  const [input,     setInput]     = useState('')
  const [thinking,  setThinking]  = useState(false)
  const [isDone,    setIsDone]    = useState(false)
  const [qCount,    setQCount]    = useState(0)
  const [status,    setStatus]    = useState('a escutar')

  const bottomRef  = useRef(null)
  const inputRef   = useRef(null)
  const sending    = useRef(false)
  const initiated  = useRef(false)

  // Track keyboard height via visualViewport so input stays above keyboard on iOS
  const [kbOffset, setKbOffset] = useState(0)
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const update = () => {
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      setKbOffset(offset)
      // scroll to bottom when keyboard opens
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => { vv.removeEventListener('resize', update); vv.removeEventListener('scroll', update) }
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, thinking])

  useEffect(() => {
    if (initiated.current) return
    initiated.current = true
    const name = data.name1 ? `, ${data.name1}` : ''
    const opening = `Olá${name}. Obrigada por estares aqui — sei que não é fácil.\n\nO meu trabalho não é julgar ninguém nem dizer quem tem "mais razão". É perceber o que está realmente a acontecer entre vocês dois — com honestidade e com base em anos de estudo de dinâmicas relacionais.\n\nConta-me: o que aconteceu? Descreve a situação que te trouxe aqui hoje.`
    setThinking(true)
    const t = setTimeout(() => {
      setThinking(false)
      setMessages([{ role: 'mara', content: opening, time: now() }])
      setHistory([{ role: 'assistant', content: opening }])
      inputRef.current?.focus()
    }, 900)
    return () => clearTimeout(t)
  }, [])

  const finishChat = useCallback(async (hist) => {
    setIsDone(true)
    setStatus('análise concluída ✓')
    const chat1 = hist.filter(m => m.role === 'user').map(m => m.content).join('\n---\n')
    const code  = Array.from({ length: 4 }, () =>
      'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]
    ).join('')
    const session = { ...data, chat1, code }
    update({ chat1, code })

    // Save to server (Upstash Redis — works cross-device for App Store users)
    try {
      await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session),
      })
    } catch (_) { /* non-fatal — fallback below */ }

    // Also keep localStorage as same-device fallback
    try { localStorage.setItem(`ct_${code}`, JSON.stringify(session)) } catch (_) {}

    setTimeout(() => nav('/invite'), 800)
  }, [data, nav, update])

  // Holds accumulating stream text so setState closure always has the latest
  const streamText = useRef('')

  const handleSend = useCallback(async () => {
    if (sending.current || isDone || !input.trim()) return
    const text = input.trim()
    sending.current = true
    setInput('')

    const newQCount = qCount + 1
    const userMsg   = { role: 'user', content: text, time: now() }
    const newHist   = [...history, { role: 'user', content: text }]

    setMessages(prev => [...prev, userMsg])
    setHistory(newHist)
    setQCount(newQCount)
    setThinking(true)
    setStatus('a analisar…')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model:      'claude-haiku-4-5-20251001',
          max_tokens: 600,
          system:     systemPrompt(data),
          messages:   newHist,
        }),
      })

      if (!res.ok || !res.body) {
        // Try to read error body
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
      setStatus('a responder…')

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

      // Finalise — remove streaming cursor, set final text
      setMessages(prev => {
        const arr = [...prev]
        arr[arr.length - 1] = { role: 'mara', content: clean, time: now(), streaming: false }
        return arr
      })
      setHistory(fullHist)
      setStatus(finished ? 'análise concluída ✓' : 'a escutar')

      if (finished) finishChat(fullHist)
      else inputRef.current?.focus()

    } catch (err) {
      console.error('handleSend error', err)
      const fallback = newQCount >= MAX_Q
        ? 'Obrigada pela tua partilha. Tenho toda a informação necessária para a análise.'
        : 'Conta-me mais sobre isso. O que sentiste nesse momento?'
      const fullHist = [...newHist, { role: 'assistant', content: fallback }]
      setThinking(false)
      setStatus(newQCount >= MAX_Q ? 'análise concluída ✓' : 'a escutar')
      setMessages(prev => {
        // Replace streaming placeholder if exists, else append
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
  }, [input, isDone, qCount, history, data, finishChat])

  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }

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
        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <XBack onClick={() => nav('/setup')} />
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
          <Card raised style={{ padding: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              ref={inputRef}
              type="text"
              placeholder={isDone ? 'Conversa terminada' : 'Escreve a tua resposta…'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKey}
              disabled={isDone || thinking}
              style={{
                flex: 1, background: 'transparent', border: 'none', fontFamily: FUI,
                fontSize: 15, color: X.text, outline: 'none', padding: '4px 8px',
              }}
            />
            <button
              onClick={handleSend}
              disabled={isDone || thinking || !input.trim()}
              style={{
                width: 44, height: 44, borderRadius: 22, background: GRAD,
                border: 'none', cursor: isDone || !input.trim() ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 6px 16px ${X.acc1}55`,
                opacity: isDone || !input.trim() ? 0.4 : 1, transition: 'opacity .15s', flexShrink: 0,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16"><path d="M2.01 15L15 8 2.01 1 2 6.5l9.5 1.5L2 9.5z" fill="#fff"/></svg>
            </button>
          </Card>
        </div>
      </div>
    </>
  )
}
