import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'
import { AppProvider } from './context/AppContext'
import SLanding      from './screens/SLanding'
import S01Welcome    from './screens/S01Welcome'
import S01bExplain   from './screens/S01bExplain'
import S02Mode       from './screens/S02Mode'
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
  '/explain':    1,
  '/mode':       2,
  '/chat':       3,
  '/chat2':      4,
  '/invite':     4,
  '/analyzing':  5,
  '/solo':       5,
  '/replied':    6,
  '/complete':   7,
  '/paywall':    8,
  '/verdict':    9,
  '/resolution': 10,
}

const ease = [0.32, 0.72, 0, 1] // iOS-like spring feel

function makeVariants(dir) {
  return {
    initial:  { x: dir * 60, opacity: 0, filter: 'blur(4px)' },
    animate:  { x: 0,        opacity: 1, filter: 'blur(0px)' },
    exit:     { x: dir * -40, opacity: 0, filter: 'blur(3px)' },
  }
}

// Gradual reveal — page fades in gently with slight upward drift
const fadeVariants = {
  initial: { opacity: 0, y: 18, scale: 0.98 },
  animate: { opacity: 1, y: 0,  scale: 1    },
  exit:    { opacity: 0, y: -8, scale: 0.99 },
}

function AnimatedPage({ children, dir, fade = false }) {
  return (
    <motion.div
      variants={fade ? fadeVariants : makeVariants(dir)}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={fade
        ? { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
        : { duration: 0.32, ease }
      }
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

  const P = ({ children, fade }) => <AnimatedPage dir={dir} fade={fade}>{children}</AnimatedPage>

  return (
    <AnimatePresence>
      <Routes location={loc} key={loc.pathname}>
        <Route path="/design"     element={<DesignCanvas />} />
        <Route path="/"           element={desktop ? <SLanding /> : <P><S01Welcome /></P>} />
        <Route path="/join"       element={<P><SJoin /></P>} />
        <Route path="/code"       element={<P><SCodeEntry /></P>} />
        <Route path="/dev/seed"   element={<P><SDevSeed /></P>} />
        <Route path="/setup"      element={<Navigate to="/explain" replace />} />
        <Route path="/explain"    element={<P><S01bExplain /></P>} />
        <Route path="/mode"       element={<P fade><S02Mode /></P>} />
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
