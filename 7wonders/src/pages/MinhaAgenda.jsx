import { Link } from 'react-router-dom'
import { useSchedule } from '../context/ScheduleContext'
import { useAuth } from '../context/AuthContext'
import { groupByDay, formatDayLong, formatRange, isOver } from '../lib/time'
import SessionCard from '../components/SessionCard'
import { Empty, Loading } from '../components/States'

export default function MinhaAgenda() {
  const { myEnrollments, loading } = useSchedule()
  const { user } = useAuth()

  const upcoming = myEnrollments.filter(s => !isOver(s.endsAt))
  const past = myEnrollments.filter(s => isOver(s.endsAt))
  const groups = groupByDay(upcoming)

  return (
    <main className="page">
      <header className="page__head">
        <h1 className="page__title">A minha agenda</h1>
        <p className="page__sub">
          Olá {user?.name} — tens {upcoming.length} atividade{upcoming.length === 1 ? '' : 's'} marcada{upcoming.length === 1 ? '' : 's'}.
        </p>
      </header>

      {loading ? (
        <Loading rows={3} />
      ) : upcoming.length === 0 ? (
        <Empty title="Ainda não marcaste nada">
          <Link to="/" style={{ color: 'var(--c-accent)', fontWeight: 600 }}>
            Vê o horário
          </Link>{' '}e inscreve-te nas atividades que quiseres.
        </Empty>
      ) : (
        groups.map(group => (
          <section key={group.key} style={{ marginBottom: 'var(--s-6)' }}>
            <h2 style={{ fontSize: 15, color: 'var(--c-text-dim)', margin: '0 0 var(--s-3)' }}>
              {formatDayLong(group.date)}
            </h2>
            <div className="slot__items">
              {group.sessions.map(s => <SessionCard key={s.id} session={s} showTime />)}
            </div>
          </section>
        ))
      )}

      {past.length > 0 && (
        <section style={{ marginTop: 'var(--s-6)' }}>
          <h2 style={{ fontSize: 15, color: 'var(--c-text-dim)', margin: '0 0 var(--s-3)' }}>
            Já aconteceram
          </h2>
          <div className="slot__items">
            {past.map(s => <SessionCard key={s.id} session={s} showTime />)}
          </div>
        </section>
      )}
    </main>
  )
}
