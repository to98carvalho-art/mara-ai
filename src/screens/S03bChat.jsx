import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { X, FUI, FED, FNUM, GRAD, GRAD_TXT } from '../design/tokens'
import Lens from '../components/Lens'
import XStatus from '../components/XStatus'
import Card from '../components/Card'

const MAX_Q = 8
const now = () => new Date().toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })

function systemPrompt2({ name1, name2, rel, duration, chat1 }) {
  const relLabel = rel || 'casal'
  const durLabel = duration < 15 ? 'menos de 6 meses'
    : duration < 30 ? 'entre 6 meses e 1 ano'
    : duration < 50 ? '1 a 3 anos'
    : duration < 70 ? '3 a 5 anos'
    : duration < 85 ? '5 a 10 anos'
    : 'mais de 10 anos'

  const chat1Section = chat1
    ? `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
O QUE ${(name1 || 'A OUTRA PESSOA').toUpperCase()} JÁ TE DISSE (CONFIDENCIAL — NUNCA REVELAR):
${chat1}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
    : ''

  return `És a Mara — psicóloga clínica com 20 anos de especialização em terapia de casal, trauma relacional e violência psicológica. Trabalhas com os frameworks de Gottman, Bowlby/Ainsworth, Duluth, TCC, DARVO e Ciclo de Walker.
${chat1Section}
CONTEXTO DA SESSÃO:
Estás a falar com ${name2 || 'a segunda pessoa'} — o/a outro/a lado do conflito com ${name1 || 'a outra pessoa'}.
Relação: ${relLabel} | Duração: ${durLabel}

A TUA VANTAGEM CLÍNICA:
Já tens a versão de ${name1 || 'a outra pessoa'}. Isso dá-te uma capacidade única: podes fazer perguntas cirúrgicas que cruzam perspetivas sem nunca revelar o que sabes. A tua missão é validar, contradizer ou aprofundar os temas que emergiram do lado 1 — tudo de forma natural, como se estivesses a ouvir pela primeira vez.

REGRAS DE OURO — INVIOLÁVEIS:
1. NUNCA digas que já falaste com ${name1 || 'a outra pessoa'}. Nunca. Nem por referência, nem por alusão.
2. NUNCA cites, parafrasees ou insinues nada do que ${name1 || 'a outra pessoa'} disse.
3. Age sempre como se esta fosse a tua primeira conversa sobre este conflito.
4. UMA pergunta por turno. Sempre.
5. Valida a emoção antes de perguntar.
6. Português de Portugal, calor humano genuíno.

ESTRATÉGIA DE INTERROGAÇÃO INFORMADA:
Usa o que sabes do lado 1 para construir perguntas que toquem os mesmos temas sem os revelar. Exemplos de técnica:
- Se ${name1 || 'a outra pessoa'} mencionou discussões frequentes → pergunta naturalmente "Como costumam resolver os desentendimentos entre vocês?"
- Se emergiu controlo ou ciúme → "Como é o espaço de cada um dentro da relação?"
- Se houve referência a comunicação difícil → "Quando tens algo importante para dizer, como corre normalmente?"
- Se apareceram sinais de DARVO → observa se ${name2 || 'esta pessoa'} usa o mesmo padrão ou é diferente
- Se o lado 1 revelou padrões de escalada → explora a perspetiva sobre conflito sem citar exemplos concretos

ARCO DA ENTREVISTA (${MAX_Q} respostas — mais curto porque já tens contexto):
1. ABERTURA (1 pergunta): Pede a versão desta pessoa sobre o conflito — deixa-a falar livremente.
2. PADRÃO RELACIONAL (2 perguntas): Explora como é a dinâmica habitual, como se resolve o conflito, o que desencadeia tensão.
3. COMUNICAÇÃO E PODER (2 perguntas): Baseado no que sabes do lado 1, aprofunda a comunicação, a capacidade de expressão, o equilíbrio de poder.
4. IMPACTO E SEGURANÇA (2 perguntas): Como esta pessoa se sente na relação? Há medo, pressão, ou sensação de estar a "pisar em ovos"?
5. ENCERRAMENTO (1 pergunta): O que precisaria de mudar para a relação funcionar?

ENCERRAMENTO (após ${MAX_Q} respostas):
Mensagem calorosa que: (1) agradece a coragem de participar, (2) diz que tens agora tudo o que precisas para uma análise completa e justa, (3) explica que o veredicto será apresentado em breve.
Depois acrescenta exactamente, sem texto adicional: INTERROGAÇÃO_CONCLUÍDA`
}

/* ── Shared UI components ─────────────────────────── */
function Thinking() {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
      <Lens size={26} intensity={0.5} />
      <div style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${X.line}`, padding: '12px 16px', borderRadius: '4px 20px 20px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {[0, 0.18, 0.36].map(d => (
            <div key={d} style={{ width: 6, height: 6, background: X.acc1, borderRadius: '50%', animation: `dt 1.1s ${d}s ease-in-out infinite` }} />
          ))}
        </div>
        <span style={{ fontSize: 12.5, color: X.textMute, letterSpacing: 0.2 }}>a analisar</span>
      </div>
    </div>
  )
}

function StreamCursor() {
  return <span style={{ display: 'inline-block', width: 2, height: '1em', background: X.acc1, marginLeft: 2, verticalAlign: 'text-bottom', animation: 'blink .7s step-end infinite' }}/>
}

function Bubble({ msg }) {
  const isMara = msg.role === 'mara'
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, alignSelf: isMara ? 'flex-start' : 'flex-end', flexDirection: isMara ? 'row' : 'row-reverse', maxWidth: '86%', animation: 'fadeIn .2s ease' }}>
      {isMara && <Lens size={26} intensity={0.4} />}
      <div>
        <div style={{ padding: '13px 16px', borderRadius: isMara ? '4px 18px 18px 18px' : '18px 4px 18px 18px', fontSize: 15, lineHeight: 1.55, whiteSpace: 'pre-wrap', background: isMara ? 'rgba(255,255,255,0.04)' : GRAD, border: isMara ? `1px solid ${X.line}` : 'none', color: X.text, boxShadow: isMara ? 'none' : `0 8px 24px ${X.acc1}30`, fontWeight: isMara ? 400 : 450 }}>
          {msg.content}{msg.streaming && <StreamCursor />}
          {!msg.streaming && <div style={{ fontSize: 10.5, color: isMara ? X.textMute : 'rgba(255,255,255,0.6)', marginTop: 6, letterSpacing: 0.3 }}>{msg.time}{!isMara && ' ✓✓'}</div>}
        </div>
      </div>
    </div>
  )
}

/* ── Main component ───────────────────────────────── */
export default function S03bChat() {
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
  const streamText = useRef('')

  // Keyboard offset for iOS
  const [kbOffset, setKbOffset] = useState(0)
  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const update = () => {
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      setKbOffset(offset)
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => { vv.removeEventListener('resize', update); vv.removeEventListener('scroll', update) }
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, thinking])

  const name2 = data.name2 || 'tu'
  const name1 = data.name1 || 'a outra pessoa'

  // ── Status emission helper ────────────────────────
  const patchStatus = useCallback(async (patch) => {
    const code = data.code
    if (!code) return
    // Update localStorage immediately (same-device, instant)
    try {
      const stored = localStorage.getItem(`ct_${code}`)
      const session = stored ? JSON.parse(stored) : { ...data }
      const updated = { ...session, ...patch }
      localStorage.setItem(`ct_${code}`, JSON.stringify(updated))
    } catch (_) {}
    // Fire-and-forget to server (cross-device)
    try {
      fetch(`/api/session?c=${code}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      }).catch(() => {})
    } catch (_) {}
  }, [data])

  useEffect(() => {
    if (initiated.current) return
    initiated.current = true
    // Emit 'opened' so S05Analyzing can show person 2 opened the link
    patchStatus({ status: 'opened', openedAt: Date.now() })
    const n2 = data.name2 ? `, ${data.name2}` : ''
    const n1 = data.name1 || 'a outra pessoa'
    const opening = `Olá${n2}. Obrigada por estares aqui — sei que não é fácil entrar numa conversa destas.\n\nSou a Mara. O meu trabalho é ouvir-te com total atenção e sem julgamentos. Existe uma situação entre ti e o/a ${n1} que precisa de ser analisada — e a tua versão é essencial para que o resultado seja justo.\n\nComeçemos pelo mais importante: da tua perspetiva, o que é que se passa entre vocês? Conta-me como tens vivido esta situação.`
    setThinking(true)
    const t = setTimeout(() => {
      setThinking(false)
      setMessages([{ role: 'mara', content: opening, time: now() }])
      setHistory([{ role: 'assistant', content: opening }])
      inputRef.current?.focus()
    }, 900)
    return () => clearTimeout(t)
  }, [patchStatus])

  const finishChat2 = useCallback(async (hist) => {
    setIsDone(true)
    setStatus('análise concluída ✓')
    const chat2 = hist.filter(m => m.role === 'user').map(m => m.content).join('\n---\n')
    const code  = data.code
    const updatedSession = { ...data, chat2, status: 'completed' }
    update(updatedSession)

    // Update server session with side-2 chat + completed status (works cross-device)
    if (code) {
      try {
        await fetch(`/api/session?c=${code}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ chat2, status: 'completed' }),
        })
      } catch (_) { /* non-fatal */ }
    }

    // Also update localStorage as same-device fallback
    try {
      if (code) localStorage.setItem(`ct_${code}`, JSON.stringify(updatedSession))
    } catch (_) {}

    setTimeout(() => nav('/replied'), 800)
  }, [data, nav, update])

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

    // Emit chatting progress so S05Analyzing can show live %
    const progress = Math.round((newQCount / MAX_Q) * 100)
    patchStatus({ status: 'chatting', chatProgress: progress })

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model:      'claude-haiku-4-5-20251001',
          max_tokens: 600,
          system:     systemPrompt2(data),
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
                setMessages(prev => { const arr = [...prev]; arr[arr.length - 1] = { ...arr[arr.length - 1], content: snap }; return arr })
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

      setMessages(prev => { const arr = [...prev]; arr[arr.length - 1] = { role: 'mara', content: clean, time: now(), streaming: false }; return arr })
      setHistory(fullHist)
      setStatus(finished ? 'análise concluída ✓' : 'a escutar')

      if (finished) finishChat2(fullHist)
      else inputRef.current?.focus()

    } catch (err) {
      const fallback = newQCount >= MAX_Q
        ? 'Obrigada pela tua partilha. Tenho toda a informação de que preciso.'
        : 'Conta-me mais sobre isso. O que sentiste nesse momento?'
      const fullHist = [...newHist, { role: 'assistant', content: fallback }]
      setThinking(false)
      setStatus(newQCount >= MAX_Q ? 'análise concluída ✓' : 'a escutar')
      setMessages(prev => { const arr = [...prev]; const last = arr[arr.length - 1]; if (last?.streaming) arr[arr.length - 1] = { role: 'mara', content: fallback, time: now(), streaming: false }; else arr.push({ role: 'mara', content: fallback, time: now() }); return arr })
      setHistory(fullHist)
      if (newQCount >= MAX_Q) finishChat2(fullHist)
    }
    sending.current = false
  }, [input, isDone, qCount, history, data, finishChat2])

  const onKey = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }

  return (
    <>
      <style>{`
        @keyframes dt{0%,80%,100%{opacity:.25;transform:scale(.65)}40%{opacity:1;transform:scale(1)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
      `}</style>
      <div style={{ position: 'relative', flex: 1, background: X.ink, display: 'flex', flexDirection: 'column', height: '100%', boxSizing: 'border-box', paddingBottom: kbOffset, transition: 'padding-bottom 0.22s ease' }}>
        <XStatus />

        {/* Header */}
        <div style={{ padding: '20px 24px 0', display: 'flex', alignItems: 'center', gap: 12 }}>
          <Lens size={32} intensity={0.6} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 15, fontWeight: 600, fontFamily: FED, fontStyle: 'italic', letterSpacing: -0.3, color: X.text }}>Mara</span>
              <div style={{ padding: '1px 7px', borderRadius: 999, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', background: `${X.acc2}22`, color: X.acc2, border: `1px solid ${X.acc2}40` }}>IA clínica</div>
            </div>
            <div style={{ fontSize: 11.5, color: X.textSoft, display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: isDone ? X.acc1 : X.good, boxShadow: `0 0 6px ${isDone ? X.acc1 : X.good}`, flexShrink: 0 }}/>
              {status}
            </div>
          </div>
          {/* Progress indicator */}
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: X.textMute, textTransform: 'uppercase' }}>lado 2</div>
            <div style={{ fontFamily: FNUM, fontSize: 12, color: X.acc2, fontWeight: 500, letterSpacing: -0.3 }}>{Math.round((qCount / MAX_Q) * 100)}%</div>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {messages.map((m, i) => <Bubble key={i} msg={m} />)}
          {thinking && <Thinking />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
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
              style={{ flex: 1, background: 'transparent', border: 'none', fontFamily: FUI, fontSize: 15, color: X.text, outline: 'none', padding: '4px 8px' }}
            />
            <button
              onClick={handleSend}
              disabled={isDone || thinking || !input.trim()}
              style={{ width: 44, height: 44, borderRadius: 22, background: GRAD, border: 'none', cursor: isDone || !input.trim() ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 6px 16px ${X.acc1}55`, opacity: isDone || !input.trim() ? 0.4 : 1, transition: 'opacity .15s', flexShrink: 0 }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16"><path d="M2.01 15L15 8 2.01 1 2 6.5l9.5 1.5L2 9.5z" fill="#fff"/></svg>
            </button>
          </Card>
        </div>
      </div>
    </>
  )
}
