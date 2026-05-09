/**
 * MARA AI — Design Reference
 * ─────────────────────────────────────────────────────────
 * Este ficheiro documenta o design language completo da app.
 * Serve de referência visual para implementar os ecrãs.
 *
 * Usa como: import { tokens, screens } from './mara-screens'
 */

/* ── Design Tokens ────────────────────────────────────────── */
export const tokens = {
  colors: {
    // Backgrounds (dark screens)
    bg:    '#08061A',
    bg2:   '#0E0A28',
    bg3:   '#14103A',
    card:  '#1A1535',
    card2: '#201A42',
    // Brand
    purple: '#7B35FF',
    purple2:'#9B5FFF',
    pink:   '#E040FB',
    pink2:  '#FF6BEB',
    grad:   'linear-gradient(135deg, #7B35FF, #E040FB)',
    // Semantic
    green: '#22C55E',
    red:   '#FF4B6E',
    blue:  '#60A5FA',
    // Text
    t1: '#FFFFFF',
    t2: 'rgba(255,255,255,.72)',
    t3: 'rgba(255,255,255,.42)',
    t4: 'rgba(255,255,255,.20)',
    // Surfaces
    b:  'rgba(255,255,255,.07)',
    b2: 'rgba(255,255,255,.13)',
    // S01 light theme
    s01Bg:     '#ECEAF8',
    s01Title:  '#1A0F3A',
    s01Sub:    '#7B7099',
    s01Accent: '#5B1FDB',
  },
  fonts: {
    body:    "'Inter', sans-serif",
    display: "'Playfair Display', serif",
    brand:   "'Comfortaa', cursive",
  },
  radii: {
    pill: '100px',
    card: '20px',
    input:'14px',
    btn:  '18px',
  },
}

/* ── Screen Manifest ──────────────────────────────────────── */
export const screens = [
  {
    id: 'S01',
    name: 'Welcome',
    route: '/',
    theme: 'light',
    bg: '#ECEAF8',
    description: 'Landing screen. Hero image with 3D animation. CTA "Conta o que aconteceu..." navigates to /setup.',
    sections: ['Logo (absolute top-left)', 'Hero image (3D parallax scene)', 'Title "Quem tem razão?"', 'Subtitle', 'Input pill CTA', 'Speed badge', 'Social proof avatars', 'Bounce arrow'],
    components: ['Logo', 'HeroScene (hero-wrap + rings + glows + sparks)', 'InputPill', 'AvatarStack'],
  },
  {
    id: 'S02',
    name: 'Setup',
    route: '/setup',
    theme: 'dark',
    bg: '#08061A',
    description: 'Passo 1 de 3. Collect names, relationship type, duration. Validates before proceeding to /chat.',
    sections: ['Back + progress bar (1/3)', 'Mara orb header', 'Names inputs', 'Relationship type grid (2x2)', 'Duration slider', 'Continue CTA'],
    components: ['BackBtn', 'ProgressBar', 'MaraOrb', 'FieldInput', 'RelTypeCard', 'DurationSlider', 'BtnGrad'],
  },
  {
    id: 'S03',
    name: 'Chat',
    route: '/chat',
    theme: 'dark',
    bg: '#0A0A1F',
    description: 'Conversação com a Mara. Mara guia o utilizador a descrever o conflito. Usa Anthropic Claude Haiku.',
    sections: ['Chat header (back + Mara avatar + status)', 'Message list (mara + user bubbles)', 'Typing indicator', 'Input bar'],
    components: ['ChatHeader', 'MessageBubble', 'TypingIndicator', 'ChatInput', 'SendBtn'],
    api: 'POST /api/chat → claude-haiku-4-5',
  },
  {
    id: 'S04',
    name: 'Invite',
    route: '/invite',
    theme: 'dark',
    bg: '#08061A',
    description: 'Gera código de convite e envia link ao parceiro.',
    sections: ['Step progress (2/3)', 'Mara orb header', 'Código único', 'Share options', 'Continue btn'],
    components: ['MaraOrb', 'InviteCode', 'ShareRow'],
  },
  {
    id: 'S05',
    name: 'Analyzing',
    route: '/analyzing',
    theme: 'dark',
    bg: '#08061A',
    description: 'Loading screen enquanto Mara analisa ambos os lados. Animated orb + progress steps.',
    sections: ['Animated orb', 'Progress steps list', 'Loading bar'],
    components: ['AnimatedOrb', 'StepList', 'ProgressBar'],
  },
  {
    id: 'S06',
    name: 'Replied',
    route: '/replied',
    theme: 'dark',
    bg: '#0A0A1F',
    description: 'Chat do parceiro. Mesmo layout que S03 mas do ponto de vista do parceiro.',
    sections: ['Chat header', 'Message list', 'Input bar'],
    components: ['ChatHeader', 'MessageBubble', 'ChatInput'],
    api: 'POST /api/chat → claude-haiku-4-5',
  },
  {
    id: 'S07',
    name: 'Complete',
    route: '/complete',
    theme: 'dark',
    bg: '#08061A',
    description: 'Ambos responderam. Animação de confetti. "A Mara está a preparar o veredicto."',
    sections: ['Confetti animation', 'Completion message', 'CTA para veredicto'],
    components: ['ConfettiLayer', 'BtnGrad'],
  },
  {
    id: 'S08',
    name: 'Paywall',
    route: '/paywall',
    theme: 'dark',
    bg: '#08061A',
    description: 'Paywall antes do veredicto. 3 planos (Free, Premium, Casal). Destaques de features.',
    sections: ['Orb + título', 'Plan cards (3)', 'Feature list', 'CTA compra'],
    components: ['PlanCard', 'FeatureRow', 'BtnGrad'],
  },
  {
    id: 'S09',
    name: 'Verdict',
    route: '/verdict',
    theme: 'dark',
    bg: '#08061A',
    description: 'O veredicto. Percentagens lado A vs lado B. Cards de análise. Usa Claude Sonnet.',
    sections: ['Verdict header + score', 'Analysis cards (2x2)', 'Sine wave divider', 'Resolution teaser'],
    components: ['ScoreBar', 'AnalysisCard', 'SineWave'],
    api: 'POST /api/verdict → claude-sonnet-4-5',
  },
  {
    id: 'S10',
    name: 'Resolution',
    route: '/resolution',
    theme: 'dark',
    bg: '#08061A',
    description: '3 passos de resolução recomendados pela Mara. Cards expansíveis.',
    sections: ['Resolution cards (3 steps)', 'Share result btn'],
    components: ['ResolutionCard', 'BtnGrad', 'ShareBtn'],
  },
]

/* ── Shared component specs ───────────────────────────────── */
export const components = {
  BtnGrad: {
    description: 'Primary CTA button with purple→pink gradient',
    className: 'btn btn-grad btn-full',
    style: { borderRadius: 18, padding: '18px', fontSize: 17 },
  },
  BackBtn: {
    description: '42px circular ghost button with back arrow',
    className: 'back-btn',
  },
  MaraOrb: {
    description: 'Glowing purple orb with sparkle ✦ — represents Mara AI',
    sizes: { sm: 36, md: 44, lg: 64, xl: 80 },
  },
  FieldInput: {
    className: 'field-input',
    description: 'Dark input on card background, purple focus border',
  },
  ProgressBar: {
    description: '3-segment bar. Filled = grad, partial = 35% opacity, empty = --b2',
    segments: 3,
  },
}
