import { useEffect, useState } from 'react'
import { useSchedule } from '../context/ScheduleContext'
import { data } from '../lib/api'
import { formatDayLong, formatRange } from '../lib/time'
import { Loading, Empty, Alert } from '../components/States'

/* Painel da organização — ver quem está inscrito em cada atividade
   e exportar a lista. (Criar/editar atividades entra na fase seguinte.) */
export default function Organizacao() {
  const { sessions, areas, loading } = useSchedule()
  const [selected, setSelected] = useState(null)
  const [people, setPeople] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const limited = sessions.filter(s => s.requiresSignup)

  useEffect(() => {
    if (!selected) return
    setBusy(true); setError('')
    data.listEnrollmentsForSession(selected.id)
      .then(setPeople)
      .catch(() => setError('Não foi possível carregar as inscrições.'))
      .finally(() => setBusy(false))
  }, [selected])

  function exportCsv() {
    const rows = [
      ['Atividade', 'Data', 'Hora', 'Nome', 'Email', 'Estado'],
      ...people.map(p => [
        selected.title,
        formatDayLong(selected.startsAt),
        formatRange(selected.startsAt, selected.endsAt),
        p.user?.name || '',
        p.user?.email || '',
        p.status === 'waitlist' ? 'Lista de espera' : 'Confirmado',
      ]),
    ]
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `inscritos-${selected.title.toLowerCase().replace(/\s+/g, '-')}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="page">
      <header className="page__head">
        <h1 className="page__title">Organização</h1>
        <p className="page__sub">
          {areas.length} áreas · {sessions.length} atividades · {limited.length} com inscrição
        </p>
      </header>

      {loading ? <Loading rows={4} /> : (
        <>
          <h2 style={{ fontSize: 15, color: 'var(--c-text-dim)', margin: '0 0 var(--s-3)' }}>
            Atividades com vagas limitadas
          </h2>

          <table className="table">
            <thead>
              <tr>
                <th>Atividade</th>
                <th>Área</th>
                <th>Quando</th>
                <th>Ocupação</th>
                <th>Espera</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {limited.map(s => (
                <tr key={s.id}>
                  <td>{s.title}</td>
                  <td style={{ color: s.area?.color }}>{s.area?.name}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatRange(s.startsAt, s.endsAt)}</td>
                  <td>{s.spotsTaken}/{s.capacity}</td>
                  <td>{s.waitlistCount || '—'}</td>
                  <td>
                    <button className="chip" onClick={() => setSelected(s)}>Ver inscritos</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {selected && (
            <section style={{ marginTop: 'var(--s-6)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 'var(--s-3)' }}>
                <h2 style={{ fontSize: 17, margin: 0 }}>Inscritos · {selected.title}</h2>
                <button className="chip" onClick={exportCsv} disabled={!people.length}>Exportar CSV</button>
                <button className="chip" onClick={() => setSelected(null)}>Fechar</button>
              </div>

              {error && <Alert kind="error">{error}</Alert>}
              {busy ? <Loading rows={2} /> : people.length === 0 ? (
                <Empty title="Ainda ninguém se inscreveu" />
              ) : (
                <table className="table">
                  <thead>
                    <tr><th>#</th><th>Nome</th><th>Email</th><th>Estado</th></tr>
                  </thead>
                  <tbody>
                    {people.map((p, i) => (
                      <tr key={p.id}>
                        <td>{i + 1}</td>
                        <td>{p.user?.name}</td>
                        <td>{p.user?.email}</td>
                        <td>{p.status === 'waitlist' ? 'Lista de espera' : 'Confirmado'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          )}
        </>
      )}
    </main>
  )
}
