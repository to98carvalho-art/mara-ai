import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { AppProvider } from './context/AppContext'
import SLanding      from './screens/SLanding'
import S01Welcome    from './screens/S01Welcome'
import S03Chat       from './screens/S03Chat'
import S03bChat      from './screens/S03bChat'
import S04Invite     from './screens/S04Invite'
import S05Analyzing   from './screens/S05Analyzing'
import SSoloAnalyzing from './screens/SSoloAnalyzing'
import S06Replied    from './screens/S06Replied'
import S07Complete   from './screens/S07Complete'
import S08Paywall    from './screens/S08Paywall'
import S09Verdict    from './screens/S09Verdict'
import S10Resolution from './screens/S10Resolution'
import SJoin         from './screens/SJoin'
import SCodeEntry    from './screens/SCodeEntry'
import SDevSeed      from './screens/SDevSeed'
import SPrivacy      from './screens/SPrivacy'
import STerms        from './screens/STerms'
import DesignCanvas  from './design/DesignCanvas'
import CookieBanner  from './components/CookieBanner'

// Route order — used to determine slide direction
const ROUTE_ORDER = {
  '/':           0,
  '/join':       0,
  '/code':       0,
  '/setup':      1,
  '/chat':       2,
  '/chat2':      3,
  '/invite':     3,
  '/analyzing':  4,
  '/solo':       4,
  '/replied':    5,
  '/complete':   6,
  '/paywall':    7,
  '/verdict':    8,
  '/resolution': 9,
}

const ease = [0.32, 0.72, 0, 1] // iOS-like spring feel

function makeVariants(dir) {
  return {
    initial:  { x: dir * 60, opacity: 0, filter: 'blur(4px)' },
    animate:  { x: 0,        opacity: 1, filter: 'blur(0px)' },
    exit:     { x: dir * -40, opacity: 0, filter: 'blur(3px)' },
  }
}

function AnimatedPage({ children, dir }) {
  return (
    <motion.div
      custom={dir}
      variants={makeVariants(dir)}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.32, ease }}
      style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%', willChange: 'transform' }}
    >
      {children}
    </motion.div>
  )
}

function useIsDesktop() {
  const [desktop, setDesktop] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 1024 : false
  )
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    setDesktop(mq.matches)
    const handler = (e) => setDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return desktop
}


function Shell({ children }) {
  const loc = useLocation()
  const desktop = useIsDesktop()
  if (loc.pathname === '/design') return <>{children}</>
  // Landing page on desktop — full width website
  if (loc.pathname === '/' && desktop) return <>{children}</>
  // App pages on desktop — web layout (no phone frame)
  if (desktop) return <div className="desktop-app">{children}</div>
  // Mobile/tablet — full screen app
  return (
    <div className="phone-bg">
      <div className="phone">{children}</div>
    </div>
  )
}

function AnimatedRoutes() {
  const loc = useLocation()
  const prevPath = useRef(loc.pathname)
  const desktop = useIsDesktop()

  const prevOrder = ROUTE_ORDER[prevPath.current] ?? 0
  const currOrder = ROUTE_ORDER[loc.pathname]    ?? 0
  const dir = currOrder >= prevOrder ? 1 : -1

  // update after render
  prevPath.current = loc.pathname

  const P = ({ children }) => <AnimatedPage dir={dir}>{children}</AnimatedPage>

  return (
    <AnimatePresence mode="wait">
      <Routes location={loc} key={loc.pathname}>
        <Route path="/design"     element={<DesignCanvas />} />
        <Route path="/"           element={desktop ? <SLanding /> : <P><S01Welcome /></P>} />
        <Route path="/join"       element={<P><SJoin /></P>} />
        <Route path="/code"       element={<P><SCodeEntry /></P>} />
        <Route path="/dev/seed"   element={<P><SDevSeed /></P>} />
        <Route path="/setup"      element={<Navigate to="/chat" replace />} />
        <Route path="/chat"       element={<P><S03Chat /></P>} />
        <Route path="/chat2"      element={<P><S03bChat /></P>} />
        <Route path="/invite"     element={<P><S04Invite /></P>} />
        <Route path="/analyzing"  element={<P><S05Analyzing /></P>} />
        <Route path="/solo"       element={<P><SSoloAnalyzing /></P>} />
        <Route path="/replied"    element={<P><S06Replied /></P>} />
        <Route path="/complete"   element={<P><S07Complete /></P>} />
        <Route path="/paywall"    element={<P><S08Paywall /></P>} />
        <Route path="/verdict"    element={<P><S09Verdict /></P>} />
        <Route path="/resolution" element={<P><S10Resolution /></P>} />
        <Route path="/privacy"    element={<SPrivacy />} />
        <Route path="/terms"      element={<STerms />} />
        <Route path="*"           element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Shell>
          <AnimatedRoutes />
        </Shell>
        <CookieBanner />
      </BrowserRouter>
    </AppProvider>
  )
}
