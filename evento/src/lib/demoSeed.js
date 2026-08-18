/* ────────────────────────────────────────────────────────────────
   Dados de exemplo do MODO DEMO.
   Servem para veres a plataforma a funcionar sem configurar nada.
   Quando ligares o Supabase, isto deixa de ser usado.
   ──────────────────────────────────────────────────────────────── */

export const DEMO_AREAS = [
  { id: 'a-movimento', name: 'Movimento',      color: '#f0674a', icon: '🤸', order: 1, description: 'Aulas de corpo em movimento — do suave ao intenso.' },
  { id: 'a-bemestar',  name: 'Bem-Estar',      color: '#4aa8f0', icon: '🧘', order: 2, description: 'Respirar, abrandar, recuperar.' },
  { id: 'a-workshops', name: 'Workshops',      color: '#b06af0', icon: '🛠️', order: 3, description: 'Mãos na massa, em grupos pequenos.' },
  { id: 'a-palco',     name: 'Palco Principal',color: '#f0b13a', icon: '🎤', order: 4, description: 'Conversas e concertos para todos.' },
  { id: 'a-aventura',  name: 'Aventura',       color: '#3ec98a', icon: '⛰️', order: 5, description: 'Ao ar livre, fora de portas.' },
  { id: 'a-comunidade',name: 'Comunidade',     color: '#ef7fb0', icon: '🔥', order: 6, description: 'Comer, jogar e conviver.' },
]

/* Modelo de cada atividade no horário:
   [areaId, título, formador, local, diaDoEvento(0..2), horaInício, duraçãoMin, capacidade|null] */
const TEMPLATE = [
  // ── Dia 1 ──
  ['a-comunidade','Abertura & Boas-vindas','Equipa','Praça Central',      0,'09:30',30,null],
  ['a-movimento', 'Despertar em Movimento','Rita Nunes','Relvado Norte',  0,'10:00',60,null],
  ['a-bemestar',  'Meditação Guiada','Tomás Leal','Tenda Calma',          0,'10:00',45,25],
  ['a-workshops', 'Introdução à Cerâmica','Ana Vaz','Atelier 1',          0,'10:00',90,12],
  ['a-aventura',  'Trilho da Manhã','João Pinto','Portão Este',           0,'10:30',120,20],
  ['a-palco',     'Conversa de Abertura','Convidados','Palco Principal',  0,'11:30',60,null],
  ['a-movimento', 'Yoga Vinyasa','Marta Sousa','Relvado Norte',           0,'12:00',60,30],
  ['a-comunidade','Almoço Partilhado','—','Zona de Comida',               0,'13:00',90,null],
  ['a-workshops', 'Escrita Criativa','Pedro Alves','Sala Azul',           0,'14:30',90,15],
  ['a-bemestar',  'Banho de Som','Inês Carvalho','Tenda Calma',           0,'15:00',60,20],
  ['a-movimento', 'Dança Livre','Rita Nunes','Relvado Norte',             0,'16:00',60,null],
  ['a-aventura',  'Iniciação ao Surf','Surf Club','Praia',                0,'16:00',120,10],
  ['a-palco',     'Concerto de Encerramento','Banda Convidada','Palco Principal',0,'21:00',90,null],

  // ── Dia 2 ──
  ['a-movimento', 'Corrida Suave','Hugo Dias','Portão Este',              1,'08:00',45,null],
  ['a-bemestar',  'Respiração & Frio','Tomás Leal','Tanques',             1,'09:00',60,16],
  ['a-workshops', 'Fotografia com Telemóvel','Sara Melo','Sala Azul',     1,'09:30',90,18],
  ['a-movimento', 'Pilates no Chão','Marta Sousa','Tenda Movimento',      1,'10:00',50,24],
  ['a-palco',     'Painel: O Futuro do Trabalho','Convidados','Palco Principal',1,'11:00',75,null],
  ['a-aventura',  'Canoagem no Rio','João Pinto','Cais',                  1,'11:00',120,8],
  ['a-comunidade','Almoço Partilhado','—','Zona de Comida',               1,'13:00',90,null],
  ['a-workshops', 'Fermentação em Casa','Ana Vaz','Atelier 2',            1,'14:30',90,14],
  ['a-bemestar',  'Yin Yoga','Inês Carvalho','Tenda Calma',               1,'15:00',75,22],
  ['a-movimento', 'Treino Funcional','Hugo Dias','Relvado Norte',         1,'16:30',60,20],
  ['a-comunidade','Jogos de Grupo','Equipa','Praça Central',              1,'18:00',90,null],
  ['a-palco',     'Noite de Micro Aberto','—','Palco Principal',          1,'21:00',120,null],

  // ── Dia 3 ──
  ['a-bemestar',  'Nascer do Sol em Silêncio','Tomás Leal','Miradouro',   2,'07:00',60,30],
  ['a-movimento', 'Yoga Suave','Marta Sousa','Tenda Movimento',           2,'09:00',60,null],
  ['a-workshops', 'Reparar em vez de Deitar Fora','Pedro Alves','Atelier 1',2,'10:00',90,12],
  ['a-aventura',  'Caminhada Longa','João Pinto','Portão Este',           2,'10:00',180,25],
  ['a-palco',     'Histórias do Evento','Comunidade','Palco Principal',   2,'12:00',60,null],
  ['a-comunidade','Almoço de Despedida','—','Zona de Comida',             2,'13:00',120,null],
  ['a-movimento', 'Alongamento Final','Rita Nunes','Relvado Norte',       2,'15:00',45,null],
  ['a-comunidade','Encerramento','Equipa','Praça Central',                2,'16:30',45,null],
]

const DESCRIPTIONS = {
  default: 'Traz roupa confortável e vontade. Chega 5 minutos antes para não perderes o início.',
}

/* Constrói as datas a partir de uma data-base, para o horário estar
   sempre "vivo" quando abres a plataforma. */
function buildDates(baseDate, dayOffset, hhmm, minutes) {
  const [h, m] = hhmm.split(':').map(Number)
  const start = new Date(baseDate)
  start.setDate(start.getDate() + dayOffset)
  start.setHours(h, m, 0, 0)
  const end = new Date(start.getTime() + minutes * 60000)
  return { startsAt: start.toISOString(), endsAt: end.toISOString() }
}

export function buildDemoSessions(baseDate = startOfTomorrow()) {
  return TEMPLATE.map(([areaId, title, host, location, day, time, mins, capacity], i) => {
    const { startsAt, endsAt } = buildDates(baseDate, day, time, mins)
    return {
      id: `s-${String(i + 1).padStart(3, '0')}`,
      areaId,
      title,
      host,
      location,
      startsAt,
      endsAt,
      capacity,                    // null → entrada livre, sem inscrição
      description: DESCRIPTIONS.default,
      // nº de inscritos "de outras pessoas", para as vagas parecerem reais
      seededTaken: capacity ? Math.floor(capacity * (0.35 + ((i * 37) % 55) / 100)) : 0,
    }
  })
}

export function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

/* O evento de demonstração começa amanhã, para que as inscrições
   estejam sempre abertas quando abres a plataforma. */
export function startOfTomorrow() {
  const d = startOfToday()
  d.setDate(d.getDate() + 1)
  return d
}
