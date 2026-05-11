import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, FED, FUI, GRAD } from '../design/tokens'
import Lens from '../components/Lens'
import Wordmark from '../components/Wordmark'

export default function S00Splash() {
  const nav = useNavigate()

  useEffect(() => {
    sessionStorage.setItem('splashSeen', '1')
    const t = setTimeout(() => nav('/', { replace: true }), 2400)
    return () => clearTimeout(t)
  }, [])

  return (
    <div style={{
      flex: 1, background: X.ink, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', height: '100%',
      position: 'relative', overflow: 'hidden',
    }}>

      {/* Glow principal */}
      <div style={{
        position: 'absolute', top: '18%', left: '50%', transform: 'translateX(-50%)',
        width: 460, height: 460, borderRadius: '50%',
        background: `radial-gradient(circle, ${X.acc1}2a 0%, transparent 65%)`,
        filter: 'blur(70px)', pointerEvents: 'none',
      }}/>
      {/* Glow secundário */}
      <div style={{
        position: 'absolute', bottom: '18%', right: '5%',
        width: 300, height: 300, borderRadius: '50%',
        background: `radial-gradient(circle, ${X.acc2}22 0%, transparent 65%)`,
        filter: 'blur(55px)', pointerEvents: 'none',
      }}/>

      {/* Conteúdo central */}
      <div style={{
        position: 'relative', display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 34,
      }}>
        <Lens size={140} intensity={1.4} />

        <div style={{ textAlign: 'center' }}>
          <Wordmark size={42} />
          <div style={{
            marginTop: 11, fontSize: 14, color: X.textSoft,
            letterSpacing: 0.5, lineHeight: 1.45, fontFamily: FUI,
          }}>
            psicóloga virtual de conflitos
          </div>
        </div>
      </div>

      {/* Dots de loading */}
      <div style={{ position: 'absolute', bottom: 58, display: 'flex', gap: 8 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 5, height: 5, borderRadius: '50%',
            background: GRAD,
            animation: `splashDot 1.4s ease-in-out ${i * 0.2}s infinite`,
          }}/>
        ))}
      </div>

      <style>{`
        @keyframes splashDot {
          0%, 100% { opacity: 0.2; transform: scale(0.7); }
          50%       { opacity: 1;   transform: scale(1.3); }
        }
      `}</style>
    </div>
  )
}
