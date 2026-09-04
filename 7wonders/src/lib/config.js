/* ────────────────────────────────────────────────────────────────
   Configuração da plataforma.
   Tudo o que é "do evento" (nome, datas, textos) vive aqui,
   para não andar espalhado pelo código.
   ──────────────────────────────────────────────────────────────── */

export const EVENT = {
  name: import.meta.env.VITE_EVENT_NAME || 'O Meu Evento',
  tagline: import.meta.env.VITE_EVENT_TAGLINE || 'Todas as áreas, todas as atividades, num só horário.',
  // Fuso usado para mostrar horas. As datas são guardadas em UTC.
  timeZone: import.meta.env.VITE_EVENT_TZ || 'Europe/Lisbon',
}

/* Supabase — se estas variáveis não existirem, a plataforma arranca
   em MODO DEMO (dados de exemplo guardados no próprio browser).
   Assim dá para ver e clicar tudo sem configurar nada. */
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const IS_DEMO = !SUPABASE_URL || !SUPABASE_ANON_KEY

/* Regras do evento — mudar aqui muda o comportamento em toda a plataforma */
export const RULES = {
  // Permitir lista de espera quando uma atividade esgota
  waitlistEnabled: true,
  // Avisar quando o participante já tem outra atividade à mesma hora
  warnOnTimeConflict: true,
  // Impedir inscrição depois da atividade começar
  blockSignupAfterStart: true,
  // Nº máximo de inscrições por participante (null = sem limite)
  maxEnrollmentsPerUser: null,
}
