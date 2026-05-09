import { createContext, useContext, useState } from 'react'

const AppContext = createContext(null)

const initial = {
  name1: '',    // user name
  name2: '',    // partner name
  rel:   '',    // relationship type: casal | amigos | familia | trabalho
  duration: 40, // slider 0-100
  topic: '',    // conflict topic (from S01 input or S03 chat)
  chat1: [],    // user's chat messages
  chat2: [],    // partner's chat messages
  code:  '',    // invite code
}

export function AppProvider({ children }) {
  const [data, setData] = useState(initial)
  const update = (patch) => setData(prev => ({ ...prev, ...patch }))
  const reset  = ()      => setData(initial)
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
