import { X } from '../design/tokens'

/*
  Animated "lens" mascot
  – ambient glow breathes (lensGlow)
  – ring 1 rotates slowly clockwise (lensR1)
  – ring 2 rotates slowly counter-clockwise (lensR2)
  – ring 3 pulses opacity (lensR3)
  – core gently scales / breathes (lensCore)
*/
const STYLE = `
@keyframes lensGlow {
  0%,100% { opacity: 0.7; transform: scale(0.92); }
  50%      { opacity: 1;   transform: scale(1.08); }
}
@keyframes lensR1 {
  from { transform: rotate(0deg);   }
  to   { transform: rotate(360deg); }
}
@keyframes lensR2 {
  from { transform: rotate(0deg);    }
  to   { transform: rotate(-360deg); }
}
@keyframes lensR3 {
  0%,100% { opacity: 0.55; }
  50%      { opacity: 0.90; }
}
@keyframes lensCore {
  0%,100% { transform: scale(0.96); }
  50%      { transform: scale(1.04); }
}
@keyframes lensCrescent {
  0%,100% { opacity: 0.4; }
  50%      { opacity: 0.8; }
}
`

export default function Lens({ size = 120, intensity = 1 }) {
  const id = `g${size}_${Math.round(intensity * 100)}`
  const glowOpacity = Math.round(intensity * 0x55).toString(16).padStart(2, '0')
  const cx = 60, cy = 60

  return (
    <>
      <style>{STYLE}</style>
      <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>

        {/* ambient glow — breathes */}
        <div style={{
          position: 'absolute',
          inset: -size * 0.45,
          background: `radial-gradient(circle, ${X.acc1}${glowOpacity} 0%, transparent 60%)`,
          filter: 'blur(14px)',
          pointerEvents: 'none',
          animation: 'lensGlow 3.2s ease-in-out infinite',
          transformOrigin: 'center',
        }}/>

        <svg viewBox="0 0 120 120" width={size} height={size}
          style={{ position: 'relative', overflow: 'visible' }}>
          <defs>
            <radialGradient id={`${id}c`} cx="50%" cy="50%" r="50%">
              <stop offset="0%"   stopColor="#FFFFFF"   stopOpacity="0.95"/>
              <stop offset="35%"  stopColor={X.acc2}    stopOpacity="0.9"/>
              <stop offset="100%" stopColor={X.accDeep} stopOpacity="1"/>
            </radialGradient>
            <linearGradient id={`${id}r`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%"   stopColor={X.acc1}/>
              <stop offset="100%" stopColor={X.acc2}/>
            </linearGradient>
          </defs>

          {/* ring 1 — slow clockwise rotation */}
          <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'lensR1 18s linear infinite' }}>
            <circle cx={cx} cy={cy} r="56" fill="none"
              stroke={`url(#${id}r)`} strokeWidth="0.6" opacity="0.35"
              strokeDasharray="12 6"/>
          </g>

          {/* ring 2 — counter-clockwise */}
          <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'lensR2 12s linear infinite' }}>
            <circle cx={cx} cy={cy} r="48" fill="none"
              stroke={`url(#${id}r)`} strokeWidth="0.8" opacity="0.5"
              strokeDasharray="8 4"/>
          </g>

          {/* ring 3 — opacity pulse */}
          <circle cx={cx} cy={cy} r="38" fill="none"
            stroke={`url(#${id}r)`} strokeWidth="1.1"
            style={{ animation: 'lensR3 2.4s ease-in-out infinite' }}/>

          {/* core — breathes */}
          <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: 'lensCore 2.8s ease-in-out infinite' }}>
            <circle cx={cx} cy={cy} r="26" fill={`url(#${id}c)`}/>
          </g>

          {/* highlight crescent — flickers */}
          <path d="M44 50 Q60 38 76 50"
            stroke="rgba(255,255,255,0.6)" strokeWidth="1.4" fill="none" strokeLinecap="round"
            style={{ animation: 'lensCrescent 2.8s ease-in-out infinite' }}/>
        </svg>
      </div>
    </>
  )
}
