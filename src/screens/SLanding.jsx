import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { X, FUI, FED, GRAD, GRAD_TXT } from '../design/tokens'
import Lens from '../components/Lens'

const ease = [0.22, 1, 0.36, 1]

function GradText({ children }) {
  return (
    <span style={{
      background: GRAD_TXT,
      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
      padding: '0 3px', marginLeft: '-3px',
    }}>{children}</span>
  )
}

function Badge({ children }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 14px', borderRadius: 99,
      background: `${X.acc1}18`, border: `1px solid ${X.acc1}44`,
      fontSize: 11, fontWeight: 700, letterSpacing: 1.6,
      textTransform: 'uppercase', color: X.acc1,
      fontFamily: FUI,
    }}>{children}</span>
  )
}

/* ── nav ── */
function Nav({ onCode, onStart }) {
  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 48px', height: 64,
      background: `${X.ink}dd`, backdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${X.line}`,
    }}>
      <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6 }}>
        <span style={{
          fontFamily: FED, fontSize: 22, fontWeight: 500, fontStyle: 'italic', letterSpacing: -0.8,
          background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>mara</span>
        <span style={{ width: 5, height: 5, borderRadius: 3, display: 'inline-block', background: GRAD, marginBottom: 2 }}/>
        <span style={{ fontFamily: FUI, fontSize: 9, fontWeight: 800, letterSpacing: 1.6, color: X.textSoft, textTransform: 'uppercase' }}>ai</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onCode} style={{
          background: 'none', border: `1px solid ${X.line}`, borderRadius: 99, padding: '8px 20px',
          color: X.textSoft, fontFamily: FUI, fontSize: 13.5, fontWeight: 600, cursor: 'pointer',
        }}>Tenho um código</button>
        <button onClick={onStart} style={{
          background: GRAD, border: 'none', borderRadius: 99, padding: '9px 22px',
          color: '#fff', fontFamily: FUI, fontSize: 13.5, fontWeight: 700,
          cursor: 'pointer', boxShadow: `0 4px 16px ${X.acc1}44`,
        }}>Me conta o que aconteceu →</button>
      </div>
    </nav>
  )
}

/* ── report item (do paywall real) ── */
function ReportItem({ icon, accent, label, title, preview }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 16,
      padding: '18px 20px', borderRadius: 18,
      background: 'rgba(255,255,255,0.02)', border: `1px solid ${X.line}`,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', left: 0, top: 8, bottom: 8, width: 2.5, borderRadius: 2, background: accent, opacity: 0.5 }}/>
      <div style={{
        width: 38, height: 38, borderRadius: 10, flexShrink: 0,
        background: `${accent}14`, border: `1px solid ${accent}28`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{icon}</div>
      <div>
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: accent, marginBottom: 3 }}>{label}</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: X.text, marginBottom: 3 }}>{title}</div>
        <div style={{ fontSize: 12.5, color: X.textMute, lineHeight: 1.5 }}>{preview}</div>
      </div>
    </div>
  )
}

/* ── step ── */
function Step({ num, title, desc }) {
  return (
    <div style={{
      flex: 1, minWidth: 220,
      background: X.ink2, borderRadius: 24, border: `1px solid ${X.line}`,
      padding: '30px 26px',
    }}>
      <div style={{
        width: 34, height: 34, borderRadius: 9, background: GRAD,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 800, color: '#fff', fontFamily: FUI, marginBottom: 16,
      }}>{num}</div>
      <div style={{ fontSize: 17, fontWeight: 700, color: X.text, fontFamily: FUI, letterSpacing: -0.3, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 14, color: X.textSoft, lineHeight: 1.6 }}>{desc}</div>
    </div>
  )
}

/* ── main ── */
export default function SLanding() {
  const nav = useNavigate()

  return (
    <div style={{ width: '100%', background: X.ink, fontFamily: FUI, color: X.text }}>

      <Nav onCode={() => nav('/code')} onStart={() => nav('/chat')} />

      {/* ── HERO ── */}
      <section style={{
        minHeight: '100svh', display: 'flex', alignItems: 'center',
        padding: '100px 48px 80px', maxWidth: 1200, margin: '0 auto', gap: 80,
      }}>
        {/* left */}
        <motion.div
          initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease }}
          style={{ flex: 1.1 }}
        >
          <Badge>mediação imparcial</Badge>

          <h1 style={{
            marginTop: 24, marginBottom: 0,
            fontFamily: FED, fontWeight: 400,
            fontSize: 'clamp(52px, 6vw, 88px)',
            letterSpacing: -3, lineHeight: 1.0, color: X.text,
          }}>
            Quem tem<br/>
            <em style={{ fontStyle: 'italic' }}><GradText>razão?</GradText></em>
          </h1>

          <p style={{
            marginTop: 24, fontSize: 'clamp(16px, 1.5vw, 19px)',
            color: X.textSoft, lineHeight: 1.65, maxWidth: 460,
          }}>
            Conta a sua versão. A Mara escuta os dois lados — e diz com clareza.
          </p>

          {/* fake input bar — igual ao app */}
          <div
            onClick={() => nav('/chat')}
            style={{
              marginTop: 36, maxWidth: 440,
              background: 'rgba(255,255,255,0.04)', border: `1px solid ${X.line}`,
              borderRadius: 999, padding: 6,
              display: 'flex', alignItems: 'center', gap: 6,
              cursor: 'pointer', boxShadow: `0 8px 32px rgba(0,0,0,0.3)`,
            }}>
            <div style={{ flex: 1, padding: '6px 18px', fontSize: 15, color: X.textMute }}>
              Me conta o que aconteceu…
            </div>
            <div style={{
              width: 44, height: 44, borderRadius: 22, background: GRAD, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 6px 16px ${X.acc1}55`,
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14">
                <path d="M2 7h10m0 0L8 3m4 4l-4 4" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <div style={{ marginTop: 16 }}>
            <span onClick={() => nav('/code')} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer',
              padding: '10px 20px', borderRadius: 999,
              border: `1px solid ${X.line}`, background: 'rgba(255,255,255,0.02)',
              fontSize: 13.5, fontWeight: 600, color: X.textSoft,
            }}>
              <svg width="14" height="14" viewBox="0 0 15 15" fill="none">
                <rect x="1" y="3" width="13" height="9" rx="2" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M4 7.5h2M7.5 7.5h2M11 7.5h0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Tenho um código
            </span>
          </div>
        </motion.div>

        {/* right — orb */}
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 1.1, ease }}
          style={{ flex: 0.9, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}
        >
          <div style={{
            position: 'absolute', width: 500, height: 500, borderRadius: '50%',
            background: `radial-gradient(circle, ${X.acc1}22 0%, transparent 65%)`,
            filter: 'blur(60px)',
          }}/>
          <Lens size={260} intensity={1.6} />
        </motion.div>
      </section>

      {/* ── DIVIDER ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px' }}>
        <div style={{ height: 1, background: X.line }}/>
      </div>

      {/* ── COMO FUNCIONA ── */}
      <section style={{ padding: '100px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 56 }}>
          <Badge>Como funciona</Badge>
          <h2 style={{
            marginTop: 20, fontFamily: FED, fontWeight: 400,
            fontSize: 'clamp(36px, 4vw, 54px)', letterSpacing: -2, color: X.text,
          }}>
            Três passos. <GradText>Um relatório.</GradText>
          </h2>
        </div>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          <Step num="1" title="Conta o teu lado"
            desc="Responde às perguntas da Mara sobre o conflito. Ela faz perguntas de esclarecimento para entender bem a situação." />
          <Step num="2" title="Convida a outra pessoa"
            desc="A Mara envia um convite via WhatsApp para a outra pessoa contar a versão dela — de forma completamente independente." />
          <Step num="3" title="Recebe o relatório"
            desc="Depois de ouvir os dois lados, a Mara gera um relatório completo com veredicto, análise psicológica e plano de resolução." />
        </div>
      </section>

      {/* ── DIVIDER ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 48px' }}>
        <div style={{ height: 1, background: X.line }}/>
      </div>

      {/* ── O QUE INCLUI (do paywall real) ── */}
      <section style={{ padding: '100px 48px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 80, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* left */}
          <div style={{ flex: 1, minWidth: 280 }}>
            <Badge>O que inclui</Badge>
            <h2 style={{
              marginTop: 20, fontFamily: FED, fontWeight: 400,
              fontSize: 'clamp(34px, 3.5vw, 50px)', letterSpacing: -1.8, lineHeight: 1.1, color: X.text,
            }}>
              O relatório <GradText>completo</GradText>
            </h2>
            <p style={{ fontSize: 15, color: X.textSoft, lineHeight: 1.7, maxWidth: 380, marginTop: 16 }}>
              A Mara analisa os dois lados e gera um relatório detalhado.
            </p>

            {/* price — real do paywall */}
            <div style={{
              marginTop: 36, display: 'inline-flex', flexDirection: 'column',
              padding: '24px 32px', borderRadius: 20,
              background: X.ink2, border: `1px solid ${X.acc1}33`,
              boxShadow: `0 12px 40px ${X.acc1}14`,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.2, color: X.acc1, textTransform: 'uppercase', marginBottom: 6 }}>
                por relatório
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: 13, color: X.textMute, fontWeight: 500 }}>R$</span>
                <span style={{
                  fontFamily: FED, fontSize: 56, fontWeight: 400, letterSpacing: -2,
                  background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                }}>9,99</span>
              </div>
              <div style={{ fontSize: 12, color: X.textMute, marginTop: 4 }}>pagamento único · Pix · cartão · Apple Pay</div>
              <button onClick={() => nav('/chat')} style={{
                  marginTop: 20, background: GRAD, border: 'none',
                  borderRadius: 99, padding: '12px 24px',
                  color: '#fff', fontFamily: FUI, fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', boxShadow: `0 6px 20px ${X.acc1}44`,
                }}>Me conta o que aconteceu →</button>
            </div>
          </div>

          {/* right — report items reais */}
          <div style={{ flex: 1, minWidth: 280, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <ReportItem
              accent={X.acc1}
              label="Veredicto"
              title="Quem teve mais responsabilidade"
              preview="Análise detalhada da culpa com justificação baseada em evidências da conversa."
              icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5l3.5-.5z" stroke={X.acc1} strokeWidth="1.3" strokeLinejoin="round"/></svg>}
            />
            <ReportItem
              accent={X.acc2}
              label="Análise Clínica"
              title="Diagnóstico psicológico da relação"
              preview="Avaliação clínica dos padrões relacionais, com base em TCC e terapia de casal."
              icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.5" stroke={X.acc2} strokeWidth="1.3"/><path d="M8 5v3.5l2 1.5" stroke={X.acc2} strokeWidth="1.3" strokeLinecap="round"/></svg>}
            />
            <ReportItem
              accent={X.warm}
              label="Saúde da Relação"
              title="Saudável, frágil ou tóxico?"
              preview="Classificação clínica do estado atual da relação e dos seus padrões de interação."
              icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 13s-5-3.5-5-7a5 5 0 0110 0c0 3.5-5 7-5 7z" stroke={X.warm} strokeWidth="1.3"/></svg>}
            />
            <ReportItem
              accent={X.good}
              label="Estilos de Vinculação"
              title="Ansioso, evitante ou seguro?"
              preview="Perfil de vinculação de cada pessoa — como afeta o conflito e a comunicação."
              icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="5" cy="6" r="2.2" stroke={X.good} strokeWidth="1.3"/><circle cx="11" cy="6" r="2.2" stroke={X.good} strokeWidth="1.3"/><path d="M1 13c0-2 1.8-3 4-3m6 3c0-2-1.8-3-4-3" stroke={X.good} strokeWidth="1.3" strokeLinecap="round"/></svg>}
            />
            <ReportItem
              accent="#FF4B6E"
              label="Padrões de Gottman"
              title="Os 4 cavaleiros detectados"
              preview="Crítica, desprezo, defensividade e bloqueio — quais estão presentes e em quem."
              icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 4h10M3 8h7M3 12h5" stroke="#FF4B6E" strokeWidth="1.4" strokeLinecap="round"/></svg>}
            />
            <ReportItem
              accent={X.acc1}
              label="Plano de Resolução"
              title="3 passos concretos para resolver"
              preview="Recomendações práticas e personalizadas para mudar o que não está a funcionar."
              icon={<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 8h8M8 4l4 4-4 4" stroke={X.acc1} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            />
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        borderTop: `1px solid ${X.line}`,
        padding: '28px 48px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{ display: 'inline-flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{
            fontFamily: FED, fontSize: 18, fontWeight: 500, fontStyle: 'italic', letterSpacing: -0.8,
            background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>mara</span>
          <span style={{ width: 4, height: 4, borderRadius: 2, display: 'inline-block', background: GRAD, marginBottom: 2 }}/>
          <span style={{ fontFamily: FUI, fontSize: 8, fontWeight: 800, letterSpacing: 1.6, color: X.textMute, textTransform: 'uppercase' }}>ai</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
          <span
            onClick={() => nav('/privacy')}
            style={{ fontSize: 12.5, color: X.textMute, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
          >Política de Privacidade</span>
          <span
            onClick={() => nav('/terms')}
            style={{ fontSize: 12.5, color: X.textMute, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 3 }}
          >Termos e Condições</span>
          <a href="mailto:antonio@sweetlabgroup.com" style={{ fontSize: 12.5, color: X.textMute, textDecoration: 'none' }}>Contacto</a>
          <span style={{ fontSize: 12.5, color: X.textMute }}>© 2025 Polido e Carvalho Lda</span>
        </div>
      </footer>
    </div>
  )
}
