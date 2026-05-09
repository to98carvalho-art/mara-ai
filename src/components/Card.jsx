import { X } from '../design/tokens'

export default function Card({ children, style, raised }) {
  return (
    <div style={{
      borderRadius: 22,
      background: raised
        ? `linear-gradient(180deg, ${X.ink2} 0%, ${X.ink3} 100%)`
        : 'rgba(255,255,255,0.025)',
      border: `1px solid ${X.line}`,
      backdropFilter: 'blur(10px)',
      ...style,
    }}>{children}</div>
  )
}
