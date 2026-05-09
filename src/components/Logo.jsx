export default function Logo({ size = 50 }) {
  return (
    <img
      src="/logo.png"
      width={size}
      height={size}
      alt="Mara"
      style={{ borderRadius: 14, display: 'block', boxShadow: '0 4px 18px rgba(0,0,0,.45)' }}
      onError={e => {
        e.target.style.display = 'none'
        e.target.nextSibling && (e.target.nextSibling.style.display = 'block')
      }}
    />
  )
}
