import { X } from '../design/tokens'

export default function XBack({ onClick }) {
  return (
    <div onClick={onClick} style={{
      width: 40, height: 40, borderRadius: 20,
      background: 'rgba(255,255,255,0.04)', border: `1px solid ${X.line}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(10px)', cursor: 'pointer', flexShrink: 0,
    }}>
      <svg width="9" height="14" viewBox="0 0 9 14">
        <path d="M7 1L1 7l6 6" stroke={X.text} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}
