/* ────────────────────────────────────────────────────────────────
   TOKENS DE DESIGN
   É AQUI que se muda o aspeto da plataforma inteira.
   Quando trouxeres o design do Claude Design, só estes valores
   (e o styles.css) precisam de mudar — a lógica fica na mesma.
   ──────────────────────────────────────────────────────────────── */

export const tokens = {
  color: {
    bg:        '#0e1116',   // fundo da página
    surface:   '#161b23',   // cartões
    surfaceAlt:'#1d232d',   // cartões em destaque / hover
    line:      '#2a323e',   // linhas e contornos
    text:      '#eef2f7',   // texto principal
    textDim:   '#98a3b3',   // texto secundário
    accent:    '#f0674a',   // cor de marca
    accentText:'#ffffff',
    success:   '#3ec98a',
    warning:   '#f0b13a',
    danger:    '#ef5f6b',
  },
  radius: { sm: '8px', md: '14px', lg: '20px', pill: '999px' },
  space:  { 1: '4px', 2: '8px', 3: '12px', 4: '16px', 5: '24px', 6: '32px', 7: '48px' },
  font: {
    body: "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
    display: "'Inter', system-ui, -apple-system, sans-serif",
  },
  shadow: {
    card: '0 1px 2px rgba(0,0,0,.4)',
    lift: '0 8px 30px rgba(0,0,0,.45)',
  },
}

/* Injeta os tokens como variáveis CSS (--c-bg, --r-md, …) */
export function applyTokens(root = document.documentElement) {
  const set = (k, v) => root.style.setProperty(k, v)
  Object.entries(tokens.color).forEach(([k, v]) => set(`--c-${kebab(k)}`, v))
  Object.entries(tokens.radius).forEach(([k, v]) => set(`--r-${k}`, v))
  Object.entries(tokens.space).forEach(([k, v]) => set(`--s-${k}`, v))
  Object.entries(tokens.font).forEach(([k, v]) => set(`--f-${k}`, v))
  Object.entries(tokens.shadow).forEach(([k, v]) => set(`--sh-${k}`, v))
}

const kebab = s => s.replace(/[A-Z]/g, m => `-${m.toLowerCase()}`)

export default tokens
