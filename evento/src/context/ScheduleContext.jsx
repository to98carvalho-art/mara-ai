import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { data } from '../lib/api'
import { dayKey } from '../lib/time'
import { useAuth } from './AuthContext'

const ScheduleContext = createContext(null)

/* Guarda o horário todo em memória e trata de o recarregar
   sempre que algo muda (inscrição, cancelamento, login). */
export function ScheduleProvider({ children }) {
  const { user } = useAuth()
  const [areas, setAreas] = useState([])
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    try {
      const [a, s] = await Promise.all([data.listAreas(), data.listSessions()])
      setAreas(a)
      setSessions(s)
      setError(null)
    } catch (e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { setLoading(true); refresh() }, [refresh, user?.id])

  /* Os dias do evento, calculados a partir das atividades existentes. */
  const days = useMemo(() => {
    const seen = new Map()
    for (const s of sessions) {
      const key = dayKey(s.startsAt)
      if (!seen.has(key)) seen.set(key, s.startsAt)
    }
    return [...seen.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, date]) => ({ key, date }))
  }, [sessions])

  const myEnrollments = useMemo(
    () => sessions.filter(s => s.myStatus).sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt)),
    [sessions],
  )

  const enroll = useCallback(async (id, options) => {
    const updated = await data.enroll(id, options)
    await refresh()
    return updated
  }, [refresh])

  const cancel = useCallback(async id => {
    const updated = await data.cancelEnrollment(id)
    await refresh()
    return updated
  }, [refresh])

  return (
    <ScheduleContext.Provider value={{
      areas, sessions, days, myEnrollments,
      loading, error, refresh, enroll, cancel,
    }}>
      {children}
    </ScheduleContext.Provider>
  )
}

export function useSchedule() {
  const ctx = useContext(ScheduleContext)
  if (!ctx) throw new Error('useSchedule tem de estar dentro de <ScheduleProvider>')
  return ctx
}
