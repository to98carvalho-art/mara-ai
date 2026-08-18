import { EVENT } from './config'

const TZ = EVENT.timeZone

/* ── formatação ── */

export function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('pt-PT', {
    hour: '2-digit', minute: '2-digit', timeZone: TZ,
  })
}

export function formatRange(startIso, endIso) {
  return `${formatTime(startIso)} – ${formatTime(endIso)}`
}

export function formatDayLong(iso) {
  const s = new Date(iso).toLocaleDateString('pt-PT', {
    weekday: 'long', day: 'numeric', month: 'long', timeZone: TZ,
  })
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export function formatDayShort(iso) {
  const d = new Date(iso)
  const weekday = d.toLocaleDateString('pt-PT', { weekday: 'short', timeZone: TZ }).replace('.', '')
  const day = d.toLocaleDateString('pt-PT', { day: 'numeric', timeZone: TZ })
  return { weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1), day }
}

export function durationMinutes(startIso, endIso) {
  return Math.round((new Date(endIso) - new Date(startIso)) / 60000)
}

/* ── chave do dia (YYYY-MM-DD no fuso do evento) ── */

export function dayKey(iso) {
  // 'en-CA' devolve o formato YYYY-MM-DD
  return new Date(iso).toLocaleDateString('en-CA', { timeZone: TZ })
}

/* ── comparações ── */

export function overlaps(aStart, aEnd, bStart, bEnd) {
  return new Date(aStart) < new Date(bEnd) && new Date(bStart) < new Date(aEnd)
}

export function hasStarted(startIso, now = new Date()) {
  return new Date(startIso) <= now
}

export function isOver(endIso, now = new Date()) {
  return new Date(endIso) <= now
}

/* Agrupa uma lista de sessões por dia e devolve blocos ordenados por hora. */
export function groupByDay(sessions) {
  const map = new Map()
  for (const s of sessions) {
    const key = dayKey(s.startsAt)
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(s)
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, list]) => ({
      key,
      date: list[0].startsAt,
      sessions: list.sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt)),
    }))
}

/* Agrupa sessões de um dia por hora de início — a vista "horário de ginásio". */
export function groupByTimeSlot(sessions) {
  const map = new Map()
  for (const s of sessions) {
    const key = formatTime(s.startsAt)
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(s)
  }
  return [...map.entries()]
    .sort(([, a], [, b]) => new Date(a[0].startsAt) - new Date(b[0].startsAt))
    .map(([time, list]) => ({ time, sessions: list }))
}
