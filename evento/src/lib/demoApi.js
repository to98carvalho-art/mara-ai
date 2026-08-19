/* ────────────────────────────────────────────────────────────────
   MOTOR — versão DEMO
   Guarda tudo no próprio browser (localStorage). Serve para
   experimentar a plataforma sem base de dados nenhuma.
   A interface (API) é EXACTAMENTE a mesma do modo real (Supabase),
   por isso trocar de um para o outro não obriga a mudar ecrãs.
   ⚠️ Não usar em produção: os dados ficam só neste dispositivo.
   ──────────────────────────────────────────────────────────────── */

import { DEMO_AREAS, buildDemoSessions } from './demoSeed'
import { AppError, ERR } from './errors'
import { RULES } from './config'
import { overlaps, hasStarted } from './time'

const KEY = 'evento.demo.v2'
const listeners = new Set()

/* Guarda no localStorage quando dá, e em memória quando não dá
   (navegação privada, páginas dentro de iframes, etc.). */
const store = (() => {
  try {
    const probe = '__evento_probe__'
    localStorage.setItem(probe, '1')
    localStorage.removeItem(probe)
    return localStorage
  } catch {
    const mem = new Map()
    return {
      getItem: k => (mem.has(k) ? mem.get(k) : null),
      setItem: (k, v) => mem.set(k, v),
      removeItem: k => mem.delete(k),
    }
  }
})()

/* ── armazenamento ── */

function freshState() {
  return {
    areas: DEMO_AREAS.map(a => ({ ...a })),
    sessions: buildDemoSessions(),
    users: [
      { id: 'u-admin', name: 'Organização', email: 'admin@evento.pt', passwordHash: null, role: 'admin' },
    ],
    enrollments: [],
    currentUserId: null,
  }
}

function read() {
  try {
    const raw = store.getItem(KEY)
    if (!raw) throw new Error('empty')
    const state = JSON.parse(raw)
    if (!state.sessions?.length) throw new Error('invalid')
    return state
  } catch {
    const state = freshState()
    write(state)
    return state
  }
}

function write(state) {
  store.setItem(KEY, JSON.stringify(state))
  listeners.forEach(fn => { try { fn(state) } catch { /* ignora */ } })
  return state
}

export function resetDemoData() {
  store.removeItem(KEY)
  return read()
}

/* ── utilitários ── */

async function hash(text) {
  const data = new TextEncoder().encode(`evento::${text}`)
  const buf = await crypto.subtle.digest('SHA-256', data)
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('')
}

const delay = (ms = 90) => new Promise(r => setTimeout(r, ms))

function publicUser(u) {
  if (!u) return null
  return { id: u.id, name: u.name, email: u.email, role: u.role }
}

/* Junta a uma sessão os números que a interface precisa. */
function decorate(session, state, userId) {
  const area = state.areas.find(a => a.id === session.areaId) || null
  const mine = userId
    ? state.enrollments.find(e => e.sessionId === session.id && e.userId === userId) || null
    : null

  const requiresSignup = session.capacity != null
  const confirmed = state.enrollments.filter(e => e.sessionId === session.id && e.status === 'confirmed').length
  const taken = requiresSignup ? (session.seededTaken || 0) + confirmed : 0
  const spotsLeft = requiresSignup ? Math.max(0, session.capacity - taken) : null
  const waitlistCount = state.enrollments.filter(e => e.sessionId === session.id && e.status === 'waitlist').length

  return {
    ...session,
    area,
    requiresSignup,
    spotsTaken: taken,
    spotsLeft,
    isFull: requiresSignup && spotsLeft === 0,
    waitlistCount,
    myStatus: mine ? mine.status : null,          // 'confirmed' | 'waitlist' | null
    myWaitlistPosition: mine && mine.status === 'waitlist'
      ? state.enrollments
          .filter(e => e.sessionId === session.id && e.status === 'waitlist')
          .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
          .findIndex(e => e.userId === userId) + 1
      : null,
    hasStarted: hasStarted(session.startsAt),
  }
}

/* ── AUTENTICAÇÃO ── */

export const auth = {
  async getCurrentUser() {
    const state = read()
    return publicUser(state.users.find(u => u.id === state.currentUserId))
  },

  async signUp({ name, email, password }) {
    await delay()
    if (!password || password.length < 6) throw new AppError(ERR.WEAK_PASSWORD)
    const state = read()
    const clean = email.trim().toLowerCase()
    if (state.users.some(u => u.email === clean)) throw new AppError(ERR.EMAIL_IN_USE)
    const user = {
      id: `u-${Date.now().toString(36)}`,
      name: name.trim() || clean.split('@')[0],
      email: clean,
      passwordHash: await hash(password),
      role: 'participant',
    }
    state.users.push(user)
    state.currentUserId = user.id
    write(state)
    return publicUser(user)
  },

  async signIn({ email, password }) {
    await delay()
    const state = read()
    const clean = email.trim().toLowerCase()
    const user = state.users.find(u => u.email === clean)
    if (!user) throw new AppError(ERR.INVALID_CREDENTIALS)
    // A conta de organização do demo entra com qualquer palavra-passe ≥6.
    if (user.passwordHash && user.passwordHash !== await hash(password)) {
      throw new AppError(ERR.INVALID_CREDENTIALS)
    }
    if (!user.passwordHash && (!password || password.length < 6)) {
      throw new AppError(ERR.INVALID_CREDENTIALS)
    }
    state.currentUserId = user.id
    write(state)
    return publicUser(user)
  },

  async signOut() {
    const state = read()
    state.currentUserId = null
    write(state)
  },

  onAuthChange(callback) {
    let last = read().currentUserId
    const fn = state => {
      if (state.currentUserId !== last) {
        last = state.currentUserId
        callback(publicUser(state.users.find(u => u.id === last)))
      }
    }
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
}

/* ── HORÁRIO ── */

export const data = {
  async listAreas() {
    const state = read()
    return [...state.areas].sort((a, b) => a.order - b.order)
  },

  /* filtros: { areaId, day (YYYY-MM-DD), onlyAvailable, onlyMine, query } */
  async listSessions(filters = {}) {
    const state = read()
    const userId = state.currentUserId
    let list = state.sessions.map(s => decorate(s, state, userId))

    if (filters.areaId) list = list.filter(s => s.areaId === filters.areaId)
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
    return list.sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))
  },

  async getSession(id) {
    const state = read()
    const raw = state.sessions.find(s => s.id === id)
    if (!raw) throw new AppError(ERR.SESSION_NOT_FOUND)
    return decorate(raw, state, state.currentUserId)
  },

  async listMyEnrollments() {
    const state = read()
    if (!state.currentUserId) return []
    const mine = state.enrollments.filter(e => e.userId === state.currentUserId)
    return mine
      .map(e => {
        const raw = state.sessions.find(s => s.id === e.sessionId)
        return raw ? decorate(raw, state, state.currentUserId) : null
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))
  },

  /* Devolve as atividades já marcadas que chocam com esta hora. */
  async findConflicts(sessionId) {
    const state = read()
    if (!state.currentUserId) return []
    const target = state.sessions.find(s => s.id === sessionId)
    if (!target) throw new AppError(ERR.SESSION_NOT_FOUND)
    const mineIds = state.enrollments
      .filter(e => e.userId === state.currentUserId && e.status === 'confirmed')
      .map(e => e.sessionId)
    return state.sessions
      .filter(s => mineIds.includes(s.id) && s.id !== sessionId)
      .filter(s => overlaps(target.startsAt, target.endsAt, s.startsAt, s.endsAt))
      .map(s => decorate(s, state, state.currentUserId))
  },

  /* options: { force: true } ignora o aviso de sobreposição de horas */
  async enroll(sessionId, options = {}) {
    await delay()
    const state = read()
    if (!state.currentUserId) throw new AppError(ERR.NOT_AUTHENTICATED)

    const raw = state.sessions.find(s => s.id === sessionId)
    if (!raw) throw new AppError(ERR.SESSION_NOT_FOUND)

    const view = decorate(raw, state, state.currentUserId)
    if (!view.requiresSignup) throw new AppError(ERR.NO_SIGNUP_NEEDED)
    if (view.myStatus) throw new AppError(ERR.ALREADY_ENROLLED)
    if (RULES.blockSignupAfterStart && view.hasStarted) throw new AppError(ERR.ALREADY_STARTED)

    if (RULES.maxEnrollmentsPerUser != null) {
      const count = state.enrollments.filter(e => e.userId === state.currentUserId && e.status === 'confirmed').length
      if (count >= RULES.maxEnrollmentsPerUser) throw new AppError(ERR.LIMIT_REACHED)
    }

    if (RULES.warnOnTimeConflict && !options.force) {
      const conflicts = await this.findConflicts(sessionId)
      if (conflicts.length) {
        throw new AppError(ERR.TIME_CONFLICT, {
          conflicts: conflicts.map(c => ({ id: c.id, title: c.title, startsAt: c.startsAt, endsAt: c.endsAt })),
        })
      }
    }

    const goesToWaitlist = view.isFull
    if (goesToWaitlist && !RULES.waitlistEnabled) throw new AppError(ERR.FULL)

    const enrollment = {
      id: `e-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4)}`,
      sessionId,
      userId: state.currentUserId,
      status: goesToWaitlist ? 'waitlist' : 'confirmed',
      createdAt: new Date().toISOString(),
    }
    state.enrollments.push(enrollment)
    write(state)
    return decorate(raw, read(), state.currentUserId)
  },

  async cancelEnrollment(sessionId) {
    await delay()
    const state = read()
    if (!state.currentUserId) throw new AppError(ERR.NOT_AUTHENTICATED)

    const index = state.enrollments.findIndex(e => e.sessionId === sessionId && e.userId === state.currentUserId)
    if (index === -1) throw new AppError(ERR.NOT_ENROLLED)

    const wasConfirmed = state.enrollments[index].status === 'confirmed'
    state.enrollments.splice(index, 1)

    // Abriu uma vaga → sobe o primeiro da lista de espera.
    if (wasConfirmed) {
      const next = state.enrollments
        .filter(e => e.sessionId === sessionId && e.status === 'waitlist')
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))[0]
      if (next) next.status = 'confirmed'
    }

    write(state)
    const raw = state.sessions.find(s => s.id === sessionId)
    return decorate(raw, read(), state.currentUserId)
  },

  /* ── organização ── */

  async listEnrollmentsForSession(sessionId) {
    const state = read()
    const me = state.users.find(u => u.id === state.currentUserId)
    if (me?.role !== 'admin') throw new AppError(ERR.FORBIDDEN)
    return state.enrollments
      .filter(e => e.sessionId === sessionId)
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .map(e => ({
        ...e,
        user: publicUser(state.users.find(u => u.id === e.userId)),
      }))
  },
}

export default { auth, data, resetDemoData }
