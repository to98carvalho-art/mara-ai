/** Mara's animated avatar orb — used in dark screens */
export default function MaraOrb({ size = 44 }) {
  const inner = size - 4
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', flexShrink: 0,
    }}>
      {/* Outer glow */}
      <div style={{
        position: 'absolute', inset: -12, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(123,53,255,.55), transparent 70%)',
        filter: 'blur(8px)', zIndex: 0,
      }} />
      {/* Orb surface */}
      <div style={{
        width: inner, height: inner, borderRadius: '50%', zIndex: 1,
        background: 'radial-gradient(circle at 35% 35%, rgba(180,100,255,.9), rgba(100,30,220,.8) 60%, rgba(60,10,150,.9))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: '0 0 20px rgba(123,53,255,.6)',
      }}>
        {/* Sparkle ✦ */}
        <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
          <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5Z"/>
        </svg>
      </div>
    </div>
  )
}
