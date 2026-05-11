import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)
const SESSION_KEY = 'mara_ctx'

const initial = {
  name1: '',
  name2: '',
  rel:   '',
  duration: 40,
  topic: '',
  chat1: [],
  chat2: [],
  code:  '',
}

function loadInitial() {
  try {
    const saved = sessionStorage.getItem(SESSION_KEY)
    if (saved) return { ...initial, ...JSON.parse(saved) }
  } catch {}
  return initial
}

export function AppProvider({ children }) {
  const [data, setData] = useState(loadInitial)

  const update = (patch) => setData(prev => {
    const next = { ...prev, ...patch }
    try { sessionStorage.setItem(SESSION_KEY, JSON.stringify(next)) } catch {}
    return next
  })

  const reset = () => {
    try { sessionStorage.removeItem(SESSION_KEY) } catch {}
    setData(initial)
  }

  return (
    <AppContext.Provider value={{ data, update, reset }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
