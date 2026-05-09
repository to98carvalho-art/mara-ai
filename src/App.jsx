import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { AppProvider } from './context/AppContext'
import S01Welcome    from './screens/S01Welcome'
import S02Setup      from './screens/S02Setup'
import S03Chat       from './screens/S03Chat'
import S03bChat      from './screens/S03bChat'
import S04Invite     from './screens/S04Invite'
import S05Analyzing  from './screens/S05Analyzing'
import S06Replied    from './screens/S06Replied'
import S07Complete   from './screens/S07Complete'
import S08Paywall    from './screens/S08Paywall'
import S09Verdict    from './screens/S09Verdict'
import S10Resolution from './screens/S10Resolution'
import SJoin         from './screens/SJoin'
import SCodeEntry    from './screens/SCodeEntry'
import SDevSeed      from './screens/SDevSeed'
import DesignCanvas  from './design/DesignCanvas'

const variants = {
  initial:  { opacity: 0, y: 22, filter: 'blur(3px)' },
  animate:  { opacity: 1, y: 0,  filter: 'blur(0px)' },
  exit:     { opacity: 0, y: -10, filter: 'blur(2px)' },
}
const transition = { duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }

function AnimatedPage({ children }) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={transition}
      style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}
    >
      {children}
    </motion.div>
  )
}

function Shell({ children }) {
  const loc = useLocation()
  if (loc.pathname === '/design') return <>{children}</>
  return <div className="phone">{children}</div>
}

function AnimatedRoutes() {
  const loc = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={loc} key={loc.pathname}>
        <Route path="/design"     element={<DesignCanvas />} />
        <Route path="/"           element={<AnimatedPage><S01Welcome /></AnimatedPage>} />
        <Route path="/join"       element={<AnimatedPage><SJoin /></AnimatedPage>} />
        <Route path="/code"       element={<AnimatedPage><SCodeEntry /></AnimatedPage>} />
        <Route path="/dev/seed"   element={<AnimatedPage><SDevSeed /></AnimatedPage>} />
        <Route path="/setup"      element={<AnimatedPage><S02Setup /></AnimatedPage>} />
        <Route path="/chat"       element={<AnimatedPage><S03Chat /></AnimatedPage>} />
        <Route path="/chat2"      element={<AnimatedPage><S03bChat /></AnimatedPage>} />
        <Route path="/invite"     element={<AnimatedPage><S04Invite /></AnimatedPage>} />
        <Route path="/analyzing"  element={<AnimatedPage><S05Analyzing /></AnimatedPage>} />
        <Route path="/replied"    element={<AnimatedPage><S06Replied /></AnimatedPage>} />
        <Route path="/complete"   element={<AnimatedPage><S07Complete /></AnimatedPage>} />
        <Route path="/paywall"    element={<AnimatedPage><S08Paywall /></AnimatedPage>} />
        <Route path="/verdict"    element={<AnimatedPage><S09Verdict /></AnimatedPage>} />
        <Route path="/resolution" element={<AnimatedPage><S10Resolution /></AnimatedPage>} />
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
      </BrowserRouter>
    </AppProvider>
  )
}
