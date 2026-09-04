import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { auth } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    auth.getCurrentUser()
      .then(u => { if (alive) setUser(u) })
      .finally(() => { if (alive) setLoading(false) })
    const unsubscribe = auth.onAuthChange(u => { if (alive) setUser(u) })
    return () => { alive = false; unsubscribe?.() }
  }, [])

  const signIn = useCallback(async credentials => {
    const u = await auth.signIn(credentials)
    setUser(u)
    return u
  }, [])

  const signUp = useCallback(async details => {
    const u = await auth.signUp(details)
    setUser(u)
    return u
  }, [])

  const signOut = useCallback(async () => {
    await auth.signOut()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAdmin: user?.role === 'admin' || user?.role === 'staff',
      signIn, signUp, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth tem de estar dentro de <AuthProvider>')
  return ctx
}
