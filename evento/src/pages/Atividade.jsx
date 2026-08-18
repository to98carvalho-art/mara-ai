import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useSchedule } from '../context/ScheduleContext'
import { useAuth } from '../context/AuthContext'
import { data } from '../lib/api'
import { messageFor, ERR } from '../lib/errors'
import { formatRange, formatDayLong, durationMinutes, isOver } from '../lib/time'
import StatusBadges from '../components/Badges'
import Modal from '../components/Modal'
import { Loading, Alert } from '../components/States'

export default function Atividade() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { sessions, enroll, cancel, loading: listLoading } = useSchedule()

  const [session, setSession] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [conflicts, setConflicts] = useState(null)

  // Usa o que já está em memória e confirma com o servidor.
  useEffect(() => {
    const cached = sessions.find(s => s.id === id)
    if (cached) setSession(cached)
    data.getSession(id).then(setSession).catch(() => {})
  }, [id, sessions])

  if (!session) return <main className="page">{listLoading ? <Loading rows={2} /> : null}</main>

  const past = isOver(session.endsAt)
  const color = session.area?.color || 'var(--c-accent)'

  async function doEnroll(force = false) {
    setBusy(true); setError(''); setNotice('')
    try {
      const updated = await enroll(session.id, { force })
      setSession(updated)
      setConflicts(null)
      setNotice(updated.myStatus === 'waitlist'
        ? 'Ficaste na lista de espera. Avisamos-te se abrir vaga.'
        : 'Inscrição confirmada!')
    } catch (e) {
      if (e.code === ERR.TIME_CONFLICT) setConflicts(e.details?.conflicts || [])
      else if (e.code === ERR.NOT_AUTHENTICATED) navigate('/entrar')
      else setError(messageFor(e))
    } finally {
      setBusy(false)
    }
  }

  async function doCancel() {
    setBusy(true); setError(''); setNotice('')
    try {
      const updated = await cancel(session.id)
      setSession(updated)
      setNotice('Inscrição cancelada.')
    } catch (e) {
      setError(messageFor(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="page">
      <Link to="/" className="backlink">← Voltar ao horário</Link>

      <div className="detail__hero">
        <span className="card__area" style={{ color }}>
          {session.area?.icon} {session.area?.name}
        </span>
        <h1 className="detail__title">{session.title}</h1>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <StatusBadges session={session} />
        </div>

        <div className="detail__grid">
          <div className="detail__cell">
            <small>Quando</small>
            <strong>{formatDayLong(session.startsAt)}</strong>
          </div>
          <div className="detail__cell">
            <small>Hora</small>
            <strong>{formatRange(session.startsAt, session.endsAt)}</strong>
          </div>
          <div className="detail__cell">
            <small>Duração</small>
            <strong>{durationMinutes(session.startsAt, session.endsAt)} min</strong>
          </div>
          {session.location && (
            <div className="detail__cell">
              <small>Onde</small>
              <strong>{session.location}</strong>
            </div>
          )}
          {session.host && session.host !== '—' && (
            <div className="detail__cell">
              <small>Com</small>
              <strong>{session.host}</strong>
            </div>
          )}
        </div>

        {session.description && (
          <p style={{ color: 'var(--c-text-dim)', margin: 0 }}>{session.description}</p>
        )}

        {session.requiresSignup && (
          <div style={{ marginTop: 'var(--s-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--c-text-dim)' }}>
              <span>{session.spotsTaken} de {session.capacity} lugares ocupados</span>
              <span>{session.spotsLeft} livres</span>
            </div>
            <div className="meter">
              <div
                className="meter__fill"
                style={{
                  width: `${Math.min(100, (session.spotsTaken / session.capacity) * 100)}%`,
                  background: session.isFull ? 'var(--c-danger)' : color,
                }}
              />
            </div>
            {session.waitlistCount > 0 && (
              <p style={{ fontSize: 13, color: 'var(--c-text-dim)', marginTop: 8 }}>
                {session.waitlistCount} pessoa{session.waitlistCount === 1 ? '' : 's'} em lista de espera.
              </p>
            )}
          </div>
        )}
      </div>

      {error && <Alert kind="error">{error}</Alert>}
      {notice && <Alert kind="success">{notice}</Alert>}

      <div style={{ marginTop: 'var(--s-4)' }}>
        {!session.requiresSignup ? (
          <Alert kind="info">
            Esta atividade é de <strong>entrada livre</strong>. Não precisas de te inscrever — aparece à hora marcada.
          </Alert>
        ) : past ? (
          <Alert kind="info">Esta atividade já terminou.</Alert>
        ) : !user ? (
          <Link to="/entrar" className="btn btn--primary btn--block">
            Entrar para me inscrever
          </Link>
        ) : session.myStatus ? (
          <button className="btn btn--danger btn--block" onClick={doCancel} disabled={busy}>
            {busy ? 'A cancelar…' : session.myStatus === 'waitlist' ? 'Sair da lista de espera' : 'Cancelar inscrição'}
          </button>
        ) : session.hasStarted ? (
          <Alert kind="info">As inscrições fecharam — esta atividade já começou.</Alert>
        ) : (
          <button className="btn btn--primary btn--block" onClick={() => doEnroll(false)} disabled={busy}>
            {busy ? 'A inscrever…' : session.isFull ? 'Entrar na lista de espera' : 'Inscrever-me'}
          </button>
        )}
      </div>

      {conflicts && (
        <Modal
          title="Já tens algo a esta hora"
          onClose={() => setConflicts(null)}
          actions={
            <>
              <button className="btn btn--ghost" onClick={() => setConflicts(null)}>Deixar estar</button>
              <button className="btn btn--primary" onClick={() => doEnroll(true)} disabled={busy}>
                Inscrever à mesma
              </button>
            </>
          }
        >
          <p>
            Esta atividade sobrepõe-se a{' '}
            {conflicts.map((c, i) => (
              <span key={c.id}>
                <strong>{c.title}</strong> ({formatRange(c.startsAt, c.endsAt)})
                {i < conflicts.length - 1 ? ' e ' : ''}
              </span>
            ))}.
          </p>
        </Modal>
      )}
    </main>
  )
}
