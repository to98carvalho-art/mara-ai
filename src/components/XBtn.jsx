import { X, FUI, GRAD } from '../design/tokens'

export default function XBtn({ children, primary, ghost, style, onClick }) {
  const bg = primary ? GRAD : ghost ? 'transparent' : 'rgba(255,255,255,0.05)'
  return (
    <div onClick={onClick} style={{
      height: 56, borderRadius: 999,
      background: bg, color: X.text,
      border: ghost ? `1px solid ${X.line}` : 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      fontFamily: FUI, fontWeight: 600, fontSize: 16, letterSpacing: -0.1,
      boxShadow: primary ? `0 16px 40px ${X.acc1}40` : 'none',
      cursor: 'pointer',
      ...style,
    }}>{children}</div>
  )
}
