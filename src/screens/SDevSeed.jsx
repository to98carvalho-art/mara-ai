import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { X, FED } from '../design/tokens'
import Lens from '../components/Lens'

const SEED = {
  name1: 'Ana',
  name2: 'João',
  rel: 'casal',
  duration: 60,
  code: 'T3ST',
  chat1: [
    'Ele ignora-me completamente quando discutimos. Fecha-se, sai da sala e fica horas sem falar comigo.',
    'Sim, acontece sempre que tento falar sobre os nossos problemas. Há pelo menos 6 meses que é assim. Qualquer coisa que diga ele interpreta como ataque.',
    'Sinto-me completamente sozinha na relação. É como se ele não ligasse ao que eu sinto. Às vezes choro e ele nem pergunta o que se passa.',
    'Não me ameaça diretamente, mas quando fico chateada ele fica com uma expressão que me faz sentir que estou a exagerar. Acabo sempre por pedir desculpa mesmo quando não fiz nada de errado.',
    'No início era completamente diferente — muito atencioso, mensagens o dia todo, queria estar sempre comigo. Agora parece que sou um fardo. Precisava que ele me ouvisse de verdade, pelo menos uma vez.',
  ].join('\n---\n'),
}

export default function SDevSeed() {
  const nav = useNavigate()
  const { update } = useApp()

  useEffect(() => {
    // Seed localStorage so the code screen can find it
    localStorage.setItem(`ct_${SEED.code}`, JSON.stringify(SEED))
    // Go to code entry to test the full flow
    const t = setTimeout(() => nav('/code'), 1200)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      flex: 1, background: X.ink, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 20, height: '100%',
    }}>
      <Lens size={64} intensity={1} />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: FED, fontSize: 22, color: X.text, letterSpacing: -0.5 }}>
          A carregar sessão de teste…
        </div>
        <div style={{ fontSize: 13, color: X.textMute, marginTop: 8 }}>
          a preparar código <strong style={{ color: X.acc1, fontFamily: FED }}>T3ST</strong>…
        </div>
      </div>
    </div>
  )
}
