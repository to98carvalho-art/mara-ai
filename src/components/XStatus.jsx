import { X, FUI } from '../design/tokens'

export default function XStatus({ time = '9:41' }) {
  return (
    <div className="status-bar" style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '18px 28px 6px', color: X.text, fontFamily: FUI,
      fontSize: 15, fontWeight: 600, letterSpacing: -0.1,
    }}>
      <span>{time}</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {/* signal bars */}
        <svg width="17" height="11" viewBox="0 0 17 11">
          <g fill={X.text}>
            <rect x="0"    y="7"   width="3" height="4"    rx="0.5"/>
            <rect x="4.5"  y="5"   width="3" height="6"    rx="0.5"/>
            <rect x="9"    y="2.5" width="3" height="8.5"  rx="0.5"/>
            <rect x="13.5" y="0"   width="3" height="11"   rx="0.5"/>
          </g>
        </svg>
        {/* wifi */}
        <svg width="15" height="11" viewBox="0 0 15 11" fill={X.text}>
          <path d="M7.5 2.8c2 0 3.9.8 5.3 2.1l1-1A8.4 8.4 0 007.5 1.4 8.4 8.4 0 001.7 3.9l1 1c1.4-1.3 3.3-2.1 4.8-2.1z"/>
          <path d="M7.5 6c1.2 0 2.3.5 3.1 1.3l1-1A6 6 0 007.5 4.7 6 6 0 003.4 6.3l1 1A4.4 4.4 0 017.5 6z"/>
          <circle cx="7.5" cy="9.3" r="1.3"/>
        </svg>
        {/* battery */}
        <svg width="24" height="11" viewBox="0 0 24 11">
          <rect x="0.5" y="0.5" width="20" height="10" rx="2.5" fill="none" stroke={X.text} strokeOpacity="0.45"/>
          <rect x="2" y="2" width="17" height="7" rx="1.5" fill={X.text}/>
          <path d="M22 4v3c.7-.2 1.2-.9 1.2-1.5S22.7 4.2 22 4z" fill={X.text} fillOpacity="0.5"/>
        </svg>
      </div>
    </div>
  )
}
