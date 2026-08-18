/* ────────────────────────────────────────────────────────────────
   MOTOR — versão REAL (Supabase)
   Mesma interface do modo demo: auth.* e data.*
   Ativa-se sozinho quando existirem as variáveis
   VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.
   ──────────────────────────────────────────────────────────────── */

import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY, RULES } from './config'
import { AppError, ERR } from './errors'
import { overlaps, hasStarted } from './time'

/* O cliente só nasce quando é mesmo preciso — assim o modo demo
   pode importar este ficheiro sem exigir chaves do Supabase. */
let _client = null
export function db() {
  if (!_client) {
    _client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  }
  return _client
}

/* ── tradução base de dados → aplicação ── */

const toArea = row => row && ({
  id: row.id,
  name: row.name,
  description: row.description,
  color: row.color,
  icon: row.icon,
  order: row.sort_order,
})

function toSession(row, availability, myEnrollment, waitlistPosition) {
  const av = availability || {}
  const requiresSignup = row.capacity != null
  const spotsLeft = requiresSignup ? (av.spots_left ?? row.capacity) : null
  return {
    id: row.id,
    areaId: row.area_id,
    area: toArea(row.areas),
    title: row.title,
    description: row.description,
    host: row.host,
    location: row.location,
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    capacity: row.capacity,
    requiresSignup,
    spotsTaken: requiresSignup ? (av.spots_taken ?? 0) : 0,
    spotsLeft,
    isFull: requiresSignup && spotsLeft === 0,
    waitlistCount: av.waitlist_count ?? 0,
    myStatus: myEnrollment?.status ?? null,
    myWaitlistPosition: waitlistPosition ?? null,
    hasStarted: hasStarted(row.starts_at),
  }
}

/* Traduz o erro cru do Postgres/Supabase num código nosso. */
function translate(error) {
  if (!error) return new AppError(ERR.UNKNOWN)
  const raw = `${error.message || ''}`.toUpperCase()
  const known = Object.keys(ERR).find(code => raw.includes(code))
  if (known) return new AppError(ERR[known])
  if (raw.includes('INVALID LOGIN')) return new AppError(ERR.INVALID_CREDENTIALS)
  if (raw.includes('ALREADY REGISTERED') || raw.includes('USER ALREADY')) return new AppError(ERR.EMAIL_IN_USE)
  if (raw.includes('PASSWORD')) return new AppError(ERR.WEAK_PASSWORD)
  return new AppError(ERR.UNKNOWN, { raw: error.message })
}

const SESSION_COLUMNS = `
  id, area_id, title, description, host, location,
  starts_at, ends_at, capacity, published,
  areas ( id, name, description, color, icon, sort_order )
`

/* ── AUTENTICAÇÃO ── */

export const auth = {
  async getCurrentUser() {
    const { data: { user } } = await db().auth.getUser()
    if (!user) return null
    const { data: profile } = await supabase
      .from('profiles').select('id, name, email, role').eq('id', user.id).single()
    return profile || { id: user.id, name: user.email.split('@')[0], email: user.email, role: 'participant' }
  },

  async signUp({ name, email, password }) {
    const { error } = await db().auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: { data: { name: name.trim() } },
    })
    if (error) throw translate(error)
    return this.getCurrentUser()
  },

  async signIn({ email, password }) {
    const { error } = await db().auth.signInWithPassword({
      email: email.trim().toLowerCase(), password,
    })
    if (error) throw translate(error)
    return this.getCurrentUser()
  },

  async signOut() {
    await db().auth.signOut()
  },

  onAuthChange(callback) {
    const { data: sub } = db().auth.onAuthStateChange(async () => {
      callback(await auth.getCurrentUser())
    })
    return () => sub.subscription.unsubscribe()
  },
}

/* ── HORÁRIO ── */

async function loadMyEnrollments() {
  const { data: { user } } = await db().auth.getUser()
  if (!user) return { bySession: new Map(), userId: null }
  const { data, error } = await supabase
    .from('enrollments').select('id, session_id, status, created_at').eq('user_id', user.id)
  if (error) throw translate(error)
  return { bySession: new Map((data || []).map(e => [e.session_id, e])), userId: user.id }
}

async function loadAvailability() {
  const { data, error } = await db().from('session_availability').select('*')
  if (error) throw translate(error)
  return new Map((data || []).map(a => [a.session_id, a]))
}

export const data = {
  async listAreas() {
    const { data, error } = await supabase
      .from('areas').select('*').order('sort_order', { ascending: true })
    if (error) throw translate(error)
    return (data || []).map(toArea)
  },

  async listSessions(filters = {}) {
    let query = db().from('sessions').select(SESSION_COLUMNS).order('starts_at')
    if (filters.areaId) query = query.eq('area_id', filters.areaId)

    const [{ data: rows, error }, availability, mine] = await Promise.all([
      query, loadAvailability(), loadMyEnrollments(),
    ])
    if (error) throw translate(error)

    let list = (rows || []).map(r => toSession(r, availability.get(r.id), mine.bySession.get(r.id)))

    if (filters.onlyMine) list = list.filter(s => s.myStatus)
    if (filters.onlyAvailable) list = list.filter(s => !s.requiresSignup || !s.isFull)
    if (filters.query) {
      const q = filters.query.toLowerCase()
      list = list.filter(s =>
        s.title.toLowerCase().includes(q) ||
        (s.host || '').toLowerCase().includes(q) ||
        (s.location || '').toLowerCase().includes(q) ||
        (s.area?.name || '').toLowerCase().includes(q))
    }
    return list
  },

  async getSession(id) {
    const [{ data: row, error }, availability, mine] = await Promise.all([
      db().from('sessions').select(SESSION_COLUMNS).eq('id', id).single(),
      loadAvailability(), loadMyEnrollments(),
    ])
    if (error || !row) throw new AppError(ERR.SESSION_NOT_FOUND)
    return toSession(row, availability.get(row.id), mine.bySession.get(row.id))
  },

  async listMyEnrollments() {
    const mine = await loadMyEnrollments()
    if (!mine.userId || mine.bySession.size === 0) return []
    const ids = [...mine.bySession.keys()]
    const [{ data: rows, error }, availability] = await Promise.all([
      db().from('sessions').select(SESSION_COLUMNS).in('id', ids).order('starts_at'),
      loadAvailability(),
    ])
    if (error) throw translate(error)
    return (rows || []).map(r => toSession(r, availability.get(r.id), mine.bySession.get(r.id)))
  },

  async findConflicts(sessionId) {
    const [target, all] = await Promise.all([this.getSession(sessionId), this.listMyEnrollments()])
    return all.filter(s =>
      s.id !== sessionId &&
      s.myStatus === 'confirmed' &&
      overlaps(target.startsAt, target.endsAt, s.startsAt, s.endsAt))
  },

  async enroll(sessionId, options = {}) {
    const force = options.force || !RULES.warnOnTimeConflict
    const { error } = await db().rpc('enroll_in_session', {
      p_session_id: sessionId, p_force: force,
    })
    if (error) {
      const appError = translate(error)
      if (appError.code === ERR.TIME_CONFLICT) {
        appError.details = { conflicts: await this.findConflicts(sessionId) }
      }
      throw appError
    }
    return this.getSession(sessionId)
  },

  async cancelEnrollment(sessionId) {
    const { error } = await db().rpc('cancel_enrollment', { p_session_id: sessionId })
    if (error) throw translate(error)
    return this.getSession(sessionId)
  },

  async listEnrollmentsForSession(sessionId) {
    const { data, error } = await supabase
      .from('enrollments')
      .select('id, status, created_at, profiles ( id, name, email )')
      .eq('session_id', sessionId)
      .order('created_at')
    if (error) throw translate(error)
    return (data || []).map(e => ({
      id: e.id, status: e.status, createdAt: e.created_at, user: e.profiles,
    }))
  },
}

export default { auth, data, db }
