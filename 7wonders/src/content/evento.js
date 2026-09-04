/* ════════════════════════════════════════════════════════════════
   CONTEÚDO DO 7WONDERS
   Tudo o que é texto, hora, preço ou nome vive aqui. Mudar o
   programa não obriga a tocar em nenhum ecrã.
   ════════════════════════════════════════════════════════════════ */

export const EVENTO = {
  nome: '7WONDERS',
  data: '12 SETEMBRO',
  dataLonga: '12 SETEMBRO 2026',
  local: 'CLUB DE GOLF DE BRAGA',
  recinto: '14H — 22H',
  mainStage: '18H — 02H',
  afterParty: '02H — 06H',
  idadeMinima: '+18',
  titulo: ['Doze horas.', 'Um campo de golfe.'],
  intro: 'O recinto abre às 14H com seis zonas em simultâneo. O palco principal entra às 18H e dura até às 02H.',
  introDesktop: 'O recinto abre às 14H com seis zonas de experiência a acontecer ao mesmo tempo. O palco principal entra às 18H e dura até às 02H.',
}

export const CONTACTO = {
  telefone: '+351 938 096 150',
  telefoneLimpo: '+351938096150',
  whatsapp: 'https://wa.me/351938096150',
}

export const BILHETEIRA = {
  url: 'https://3cket.com/pt/event/7-wonders-the-6th-wonder?cket=search-bar&tt_test_id=D9U9JVRC77UDTFS1R1M0_1786639407',
  nome: '3CKET',
}

/* ── navegação ── */

export const NAV = [
  { id: 'geral',  icone: '◐', etiqueta: 'GERAL' },
  { id: 'ativ',   icone: '✦', etiqueta: 'ATIVIDADES' },
  { id: 'stage',  icone: '♫', etiqueta: 'MAIN STAGE' },
  { id: 'priv',   icone: '▢', etiqueta: 'PRIVADOS' },
  { id: 'bilh',   icone: '◈', etiqueta: 'BILHETES' },
  { id: 'after',  icone: '☾', etiqueta: 'AFTER PARTY' },
]

/* ── o dia ── */

export const CRONOLOGIA = [
  { hora: '14H',   cor: 'verde', linhas: [['ABERTURA DO RECINTO', 'tinta'], ['ABERTURA MARKET · +50 BRANDS', 'taupe']] },
  { hora: '15H30', cor: 'taupe', linhas: [['RUN CLUB', 'tinta'], ['ABERTURA DAS AULAS', 'taupe']] },
  { hora: '18H',   cor: 'verde', linhas: [['ABERTURA MAIN STAGE', 'tinta']] },
  { hora: '22H',   cor: 'tinta', linhas: [['ENCERRAMENTO DO MARKET', 'tinta'], ['ENCERRAMENTO DAS ATIVIDADES', 'taupe']] },
]

/* ── as seis zonas ── */

export const ZONAS = [
  { id: 'wellness', nome: 'WELLNESS ZONE',      hora: '15H30 — 18H30', imagem: 'zone-wellness.jpg', legenda: 'foto — run club / aulas',
    linhas: ['RUN CLUB', 'BANHO DE GELO', 'AULAS DE FITNESS'] },
  { id: 'vinyl',    nome: 'VINYL SESSIONS',     hora: '',              imagem: 'zone-vinyl.jpg', legenda: 'foto — banca de discos',
    linhas: ['VENDA DE DISCOS', 'SHOW AO VIVO', 'RUBEN G.'] },
  { id: 'art',      nome: 'ART & CULTURE',      hora: '',              imagem: 'zone-art.jpg', legenda: 'foto — exposição',
    linhas: ['EXPOSIÇÃO', 'OBRA COLETIVA', 'PARTICIPAÇÃO LIVRE'] },
  { id: 'spirit',   nome: 'SPIRIT & SOUL',      hora: '16H — 18H',     imagem: 'zone-spirit.jpg', legenda: 'foto — yoga',
    linhas: ['YOGA', 'RITUAIS DE CURA', 'REIKI', 'TAROT'] },
  { id: 'food',     nome: 'FOOD TRUCK VILLAGE', hora: '',              imagem: 'zone-food.jpg', legenda: 'foto — food trucks',
    linhas: ['3 FOOD TRUCKS', 'CAFÉ ORGÂNICO', 'COMIDA VEGAN'] },
  { id: 'market',   nome: '7W MARKET',          hora: '14H — 22H',     imagem: 'zone-market.jpg', legenda: 'foto — market',
    linhas: ['+50 MARCAS PORTUGUESAS'] },
]

/* ── grelha de aulas ──────────────────────────────────────────────
   coluna 2–3 = WELLNESS · coluna 4–5 = SPIRIT & SOUL
   linha/duração seguem a coluna das horas (30 min por linha)

   capacidade: dois bolsos.
     convite — lugares já reservados para convidados
     bilhete — lugares abertos a quem tem bilhete
   O visitante nunca vê esta divisão: só o total de vagas livres.
   ──────────────────────────────────────────────────────────────── */

export const HORAS = ['15H', '15H30', '16H', '16H30', '17H', '17H30', '18H', '18H30', '19H']

export const AULAS = [
  { id: 'warmup', coluna: 2, inicio: 1, duracao: 1, hora: '15H — 15H30', nome: 'Warm Up',
    zona: 'WELLNESS', tom: 'verde' },

  { id: 'barre', coluna: 2, inicio: 2, duracao: 2, hora: '15H30 — 16H30', nome: 'Barre Class',
    zona: 'WELLNESS', tom: 'verde', por: '@soloStudio',
    capacidade: { convite: 0, bilhete: 10 }, jaOcupado: { convite: 0, bilhete: 0 } },

  { id: 'rob', coluna: 2, inicio: 4, duracao: 2, hora: '16H30 — 17H30', nome: 'Fitness Class',
    zona: 'WELLNESS', tom: 'verde', por: '@robfitness',
    capacidade: { convite: 15, bilhete: 15 }, jaOcupado: { convite: 15, bilhete: 0 } },

  { id: 'crossfit', coluna: 2, inicio: 6, duracao: 2, hora: '17H30 — 18H30', nome: 'CrossFit Class',
    zona: 'WELLNESS', tom: 'verde', por: '@bracaracf',
    capacidade: { convite: 24, bilhete: 11 }, jaOcupado: { convite: 24, bilhete: 0 } },

  { id: 'run', coluna: 3, inicio: 2, duracao: 2, hora: '15H30 — 16H30', nome: 'Run Club',
    zona: 'WELLNESS', tom: 'contorno', por: '@pacenlovehealthclub @bamobora',
    capacidade: { convite: 0, bilhete: 49 }, jaOcupado: { convite: 0, bilhete: 0 } },

  { id: 'ice', coluna: 3, inicio: 4, duracao: 3, hora: '16H30 — 18H', nome: 'Ice Bath & Sauna',
    zona: 'WELLNESS', tom: 'contorno', por: '@alaskarecover',
    soInformacao: true, preco: 'GRATUITO',
    nota: 'Não precisas de te inscrever — está disponível das {HORA}, sem marcação, grátis para quem tem bilhete.' },

  { id: 'reiki', coluna: 4, inicio: 1, duracao: 8, hora: '15H — 19H', nome: 'Reiki · Tarot · Massagens',
    zona: 'SPIRIT & SOUL', tom: 'tinta', soInformacao: true, precos: [['REIKI', '10 €'], ['TAROT', '10 €'], ['MASSAGENS', '15 €']],
    nota: 'Sem marcação — disponível das {HORA}. Pago no dia, por ordem de chegada.' },

  { id: 'yoga', coluna: 5, inicio: 1, duracao: 2, hora: '15H — 16H', nome: 'Yoga',
    zona: 'SPIRIT & SOUL', tom: 'tinta', por: '@mantayoga',
    capacidade: { convite: 0, bilhete: 15 }, jaOcupado: { convite: 0, bilhete: 0 } },

  { id: 'cacau', coluna: 5, inicio: 4, duracao: 3, hora: '16H30 — 18H', nome: "Cacau's Ritual",
    zona: 'SPIRIT & SOUL', tom: 'tinta', por: '@mae__natureza',
    capacidade: { convite: 0, bilhete: 15 }, jaOcupado: { convite: 0, bilhete: 0 } },
]

export const AULAS_LOCAL = 'RELVADO · ÁREA DE AULAS'

/* ── main stage ── */

export const LINEUP = {
  cabeca: { nome: 'REELOW', editora: 'SOLID GROOVES | REECORDS', foto: 'reelow.jpg' },
  flyer: 'flyer.jpg',
  restantes: ['Tony Shades B2B Goan', 'Isis Sage', 'Øxentä'],
  nota: 'O palco entra às 18H, quando as zonas de dia fecham. Dura até às 02H.',
}

/* ── camarotes ── */

export const CAMAROTES = {
  mapa: 'privados-mapa.jpg',
  nota: 'Dois níveis de seis camarotes, três de cada lado do corredor central. Os 03 e 04 ficam ao lado da cabine DJ, ao fundo do corredor.',
  legenda: [
    { estilo: 'cheio',     etiqueta: '03 · 04 — 1000 €' },
    { estilo: 'contorno',  etiqueta: '01 · 02 · 05 · 06 — 800 €' },
    { estilo: 'tracejado', etiqueta: '07 A 12 — 700 €' },
  ],
  capacidade: '10 PESSOAS',
}

/* ── bilhetes ── */

export const BILHETES = {
  esgotado: { nome: 'BLIND TICKET', subtitulo: 'BLIND TICKET · GENERAL ADMISSION' },
  disponiveis: [
    { nome: 'General Admission — Early Entry Ticket', quando: 'Sáb 12 set · 16H · válido até às 19H', preco: '10 €' },
    { nome: 'General Admission — 1st Release',        quando: 'Sáb 12 set · 16H',                     preco: '15 €' },
  ],
  nota: 'A venda é feita fora deste site. As fases seguintes e todos os acessos ao recinto são geridos no 3cket.',
  notaPrivados: 'Os camarotes não são vendidos no 3cket.',
}

/* ── after party ── */

export const AFTER = {
  etiquetas: ['02H — 06H', 'SECRET LOCATION', 'INVITE ONLY'],
  pergunta: 'DIZ-NOS 3 RAZÕES PARA TE CONVIDARMOS PARA O AFTER PARTY',
  botao: 'VAMOS ANALISAR',
  enviado: {
    titulo: 'Candidatura enviada.',
    nota: 'Se fores dos escolhidos, contactamos-te pelo telefone que deixaste. Não digas a ninguém.',
  },
}
