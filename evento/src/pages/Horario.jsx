import { useMemo, useState } from 'react'
import { useSchedule } from '../context/ScheduleContext'
import { useAuth } from '../context/AuthContext'
import { EVENT } from '../lib/config'
import { dayKey, formatDayShort, formatDayLong, groupByTimeSlot } from '../lib/time'
import SessionCard from '../components/SessionCard'
import { Empty, Loading, Alert } from '../components/States'

export default function Horario() {
  const { areas, sessions, days, loading, error } = useSchedule()
  const { user } = useAuth()

  const [day, setDay] = useState(null)          // null = primeiro dia disponível
  const [areaId, setAreaId] = useState(null)    // null = todas as áreas
  const [query, setQuery] = useState('')
  const [onlyMine, setOnlyMine] = useState(false)
  const [onlyFree, setOnlyFree] = useState(false)

  const activeDay = day || days[0]?.key || null

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return sessions.filter(s => {
      if (activeDay && dayKey(s.startsAt) !== activeDay) return false
      if (areaId && s.areaId !== areaId) return false
      if (onlyMine && !s.myStatus) return false
      if (onlyFree && s.requiresSignup && s.isFull) return false
      if (q) {
        const haystack = `${s.title} ${s.host} ${s.location} ${s.area?.name}`.toLowerCase()
        if (!haystack.includes(q)) return false
      }
      return true
    })
  }, [sessions, activeDay, areaId, query, onlyMine, onlyFree])

  const slots = useMemo(() => groupByTimeSlot(visible), [visible])

  return (
    <main className="page">
      <header className="page__head">
        <h1 className="page__title">{EVENT.name}</h1>
        <p className="page__sub">{EVENT.tagline}</p>
      </header>

      {error && <Alert kind="error">Não foi possível carregar o horário. Atualiza a página.</Alert>}

      {/* ── dias ── */}
      {days.length > 1 && (
        <div className="daytabs" style={{ marginBottom: 'var(--s-4)' }}>
          {days.map(d => {
            const { weekday, day: number } = formatDayShort(d.date)
            return (
              <button
                key={d.key}
                className={`daytab${activeDay === d.key ? ' is-active' : ''}`}
                onClick={() => setDay(d.key)}
              >
                <small>{weekday}</small>
                <strong>{number}</strong>
              </button>
            )
          })}
        </div>
      )}

      {/* ── filtros ── */}
      <div className="filters">
        <div className="chiprow">
          <button
            className={`chip${!areaId ? ' is-active' : ''}`}
            onClick={() => setAreaId(null)}
          >
            Todas as áreas
          </button>
          {areas.map(a => (
            <button
              key={a.id}
              className={`chip${areaId === a.id ? ' is-active' : ''}`}
              onClick={() => setAreaId(areaId === a.id ? null : a.id)}
            >
              <span className="chip__dot" style={{ background: a.color }} />
              {a.name}
            </button>
          ))}
        </div>

        <div className="chiprow">
          <button
            className={`chip${onlyFree ? ' is-active' : ''}`}
            onClick={() => setOnlyFree(v => !v)}
          >
            Só com vagas
          </button>
          {user && (
            <button
              className={`chip${onlyMine ? ' is-active' : ''}`}
              onClick={() => setOnlyMine(v => !v)}
            >
              Só as minhas
            </button>
          )}
        </div>

        <input
          className="search"
          placeholder="Procurar atividade, formador ou local…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      {activeDay && (
        <p className="page__sub" style={{ marginBottom: 'var(--s-4)' }}>
          {formatDayLong(days.find(d => d.key === activeDay)?.date)} · {visible.length} atividade{visible.length === 1 ? '' : 's'}
        </p>
      )}

      {/* ── horário ── */}
      {loading ? (
        <Loading rows={5} />
      ) : slots.length === 0 ? (
        <Empty title="Nada a mostrar">
          Experimenta limpar os filtros ou escolher outro dia.
        </Empty>
      ) : (
        slots.map(slot => (
          <section className="slot" key={slot.time}>
            <div className="slot__time">{slot.time}</div>
            <div className="slot__items">
              {slot.sessions.map(s => <SessionCard key={s.id} session={s} />)}
            </div>
          </section>
        ))
      )}
    </main>
  )
}
