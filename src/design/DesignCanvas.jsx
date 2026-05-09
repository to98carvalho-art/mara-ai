import { Link } from 'react-router-dom'
import { AppProvider } from '../context/AppContext'
import S01Welcome    from '../screens/S01Welcome'
import S02Setup      from '../screens/S02Setup'
import S03Chat       from '../screens/S03Chat'
import S04Invite     from '../screens/S04Invite'
import S05Analyzing  from '../screens/S05Analyzing'
import S06Replied    from '../screens/S06Replied'
import S07Complete   from '../screens/S07Complete'
import S08Paywall    from '../screens/S08Paywall'
import S09Verdict    from '../screens/S09Verdict'
import S10Resolution from '../screens/S10Resolution'

/* Phone frame for canvas — non-interactive render */
function PhoneFrame({ id, name, route, children }) {
  return (
    <div style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      {/* Label row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, height: 28 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E' }} />
        <span style={{ fontSize: 11, fontWeight: 800, color: '#9B7BFF', letterSpacing: '.12em', textTransform: 'uppercase' }}>{id}</span>
        <span style={{ fontSize: 13, color: 'rgba(255,255,255,.55)', fontWeight: 500 }}>{name}</span>
        <Link
          to={route}
          style={{ fontSize: 11, color: '#FF6BB1', textDecoration: 'none', padding: '2px 8px', background: 'rgba(255,107,177,.1)', borderRadius: 100, border: '1px solid rgba(255,107,177,.2)' }}
          target="_blank" rel="noopener noreferrer"
        >
          open ↗
        </Link>
      </div>

      {/* Phone shell */}
      <div style={{
        width: 390, height: 844,
        borderRadius: 48, overflow: 'hidden',
        position: 'relative',
        boxShadow: '0 0 0 1px rgba(255,255,255,.06), 0 30px 80px rgba(0,0,0,.6)',
        background: '#0A0717',
        pointerEvents: 'none', userSelect: 'none',
      }}>
        {/* dynamic island */}
        <div style={{
          position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
          width: 120, height: 34, borderRadius: 22, background: '#000', zIndex: 50,
        }}/>
        {/* home indicator */}
        <div style={{
          position: 'absolute', bottom: 8, left: '50%', transform: 'translateX(-50%)',
          width: 134, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.5)', zIndex: 50,
        }}/>
        {/* screen content */}
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', color: '#F2EEFF', fontFamily: '"Inter", sans-serif' }}>
          {children}
        </div>
      </div>

      {/* Status badge */}
      <div style={{ fontSize: 11, color: '#22C55E', display: 'flex', alignItems: 'center', gap: 4 }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
        Implementado
      </div>
    </div>
  )
}

export default function DesignCanvas() {
  const screens = [
    { id: 'S01', name: 'Welcome',    route: '/',          comp: S01Welcome },
    { id: 'S02', name: 'Setup',      route: '/setup',     comp: S02Setup },
    { id: 'S03', name: 'Chat',       route: '/chat',      comp: S03Chat },
    { id: 'S04', name: 'Convite',    route: '/invite',    comp: S04Invite },
    { id: 'S05', name: 'Análise',    route: '/analyzing', comp: S05Analyzing },
    { id: 'S06', name: 'Respondeu',  route: '/replied',   comp: S06Replied },
    { id: 'S07', name: 'Completo',   route: '/complete',  comp: S07Complete },
    { id: 'S08', name: 'Paywall',    route: '/paywall',   comp: S08Paywall },
    { id: 'S09', name: 'Veredicto',  route: '/verdict',   comp: S09Verdict },
    { id: 'S10', name: 'Resolução',  route: '/resolution', comp: S10Resolution },
  ]

  return (
    <AppProvider>
      <div style={{
        position: 'fixed', inset: 0,
        background: '#04030F',
        overflowX: 'auto', overflowY: 'auto',
        zIndex: 9999,
        fontFamily: '"Inter", sans-serif',
      }}>
        {/* Header */}
        <div style={{
          position: 'sticky', top: 0, left: 0,
          background: 'rgba(4,3,15,.92)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,.06)',
          padding: '1rem 2rem',
          display: 'flex', alignItems: 'center', gap: '1.25rem',
          zIndex: 10, minWidth: 'max-content',
        }}>
          <Link
            to="/"
            style={{ fontSize: 13, color: '#9B7BFF', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4, padding: '6px 12px', background: 'rgba(155,123,255,.1)', borderRadius: 100, border: '1px solid rgba(155,123,255,.2)', flexShrink: 0 }}
          >
            ← App
          </Link>
          <div style={{ width: 1, height: 24, background: 'rgba(255,255,255,.08)' }} />
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#F2EEFF', letterSpacing: '-.01em' }}>Mara AI — Design Canvas</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,.35)', marginTop: 1 }}>10 ecrãs · todos implementados · scroll horizontal →</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,.45)', flexShrink: 0 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E' }} />
            10 implementados
          </div>
        </div>

        {/* Screens */}
        <div style={{
          display: 'flex', gap: '2.5rem', alignItems: 'flex-start',
          padding: '2.5rem 3rem 3rem', minWidth: 'max-content',
        }}>
          {screens.map(({ id, name, route, comp: Comp }) => (
            <PhoneFrame key={id} id={id} name={name} route={route}>
              <Comp />
            </PhoneFrame>
          ))}
        </div>
      </div>
    </AppProvider>
  )
}
