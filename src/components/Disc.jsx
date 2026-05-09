import { X, FED } from '../design/tokens'

export default function Disc({ initial, hue = X.acc1, size = 44 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size / 2,
      background: `radial-gradient(circle at 35% 30%, ${hue}, ${X.accDeep} 80%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: FED, fontSize: size * 0.4, fontWeight: 500, fontStyle: 'italic', color: '#fff',
      flexShrink: 0, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
    }}>{initial}</div>
  )
}
