/* Etiquetas de estado de uma atividade — a peça visual mais reutilizada. */

export function StatusBadges({ session, compact = false }) {
  const badges = []

  if (session.myStatus === 'confirmed') {
    badges.push(<span key="mine" className="badge badge--mine">✓ Inscrito</span>)
  } else if (session.myStatus === 'waitlist') {
    badges.push(
      <span key="wait" className="badge badge--waiting">
        Lista de espera{session.myWaitlistPosition ? ` · ${session.myWaitlistPosition}º` : ''}
      </span>,
    )
  }

  if (!session.requiresSignup) {
    badges.push(<span key="free" className="badge badge--free">Entrada livre</span>)
  } else if (session.isFull) {
    badges.push(<span key="full" className="badge badge--full">Sem vagas</span>)
  } else if (session.spotsLeft <= 3) {
    badges.push(
      <span key="low" className="badge badge--low">
        Últimas {session.spotsLeft} vaga{session.spotsLeft === 1 ? '' : 's'}
      </span>,
    )
  } else if (!compact) {
    badges.push(
      <span key="spots" className="badge badge--spots">{session.spotsLeft} vagas</span>,
    )
  }

  return <>{badges}</>
}

export default StatusBadges
