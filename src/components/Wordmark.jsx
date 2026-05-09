import { X, FUI, FED, GRAD } from '../design/tokens'

export default function Wordmark({ size = 28, color = X.text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
      <span style={{
        fontFamily: FED, fontSize: size, fontWeight: 700, fontStyle: 'italic',
        letterSpacing: -0.6, color,
      }}>mara</span>
      <span style={{
        width: 5, height: 5, borderRadius: 3, display: 'inline-block',
        background: GRAD,
      }}/>
      <span style={{
        fontFamily: FUI, fontSize: size * 0.42, fontWeight: 700,
        letterSpacing: 1.4, color: X.textSoft, textTransform: 'uppercase',
      }}>ai</span>
    </div>
  )
}
