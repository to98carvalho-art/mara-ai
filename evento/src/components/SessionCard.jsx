import { Link } from 'react-router-dom'
import { formatRange, durationMinutes, isOver } from '../lib/time'
import StatusBadges from './Badges'

export default function SessionCard({ session, showTime = false }) {
  const color = session.area?.color || 'var(--c-text-dim)'
  const past = isOver(session.endsAt)

  return (
    <Link
      to={`/atividade/${session.id}`}
      className={`card${past ? ' is-past' : ''}`}
      aria-label={session.title}
    >
      <span className="card__stripe" style={{ background: color }} />

      <div className="card__top">
        <span className="card__area" style={{ color }}>
          {session.area?.icon} {session.area?.name}
        </span>
        {showTime && (
          <span style={{ color: 'var(--c-text-dim)', fontSize: 13 }}>
            {formatRange(session.startsAt, session.endsAt)}
          </span>
        )}
      </div>

      <h3 className="card__title">{session.title}</h3>

      <div className="card__meta">
        {session.host && session.host !== '—' && <span>👤 {session.host}</span>}
        {session.location && <span>📍 {session.location}</span>}
        <span>⏱ {durationMinutes(session.startsAt, session.endsAt)} min</span>
      </div>

      <div className="card__foot">
        <StatusBadges session={session} />
      </div>
    </Link>
  )
}
