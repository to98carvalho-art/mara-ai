// Verra — original AI mediator concept screens
// Brand: Verra ("verdade" + clarity). Deep teal + warm coral, dark-first.
// Mascot: an abstract sound-prism (no face, no character art).

const VERRA = {
  ink: '#06121A',         // near-black teal
  ink2: '#0D1F2A',        // card surface
  ink3: '#143040',        // card surface raised
  line: 'rgba(180,220,230,0.08)',
  text: '#F0F7F8',
  textSoft: 'rgba(220,240,242,0.62)',
  textMute: 'rgba(220,240,242,0.36)',
  teal: '#19D7B0',        // primary accent (deep mint)
  tealDeep: '#0E8C77',
  coral: '#FF7A5A',       // warm secondary
  coralSoft: 'rgba(255,122,90,0.14)',
  amber: '#FFC36B',
};

const VFONT = '"Inter", -apple-system, "SF Pro Text", system-ui, sans-serif';
const VSERIF = '"Fraunces", "Times New Roman", Georgia, serif';

// ─── primitives ──────────────────────────────────────────────
function VStatus({ time = '9:41' }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '18px 28px 6px', color: VERRA.text, fontFamily: VFONT,
      fontSize: 15, fontWeight: 600, letterSpacing: -0.1,
    }}>
      <span>{time}</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <svg width="17" height="11" viewBox="0 0 17 11"><g fill={VERRA.text}>
          <rect x="0" y="7" width="3" height="4" rx="0.5"/>
          <rect x="4.5" y="5" width="3" height="6" rx="0.5"/>
          <rect x="9" y="2.5" width="3" height="8.5" rx="0.5"/>
          <rect x="13.5" y="0" width="3" height="11" rx="0.5"/>
        </g></svg>
        <svg width="15" height="11" viewBox="0 0 15 11" fill={VERRA.text}>
          <path d="M7.5 2.8c2 0 3.9.8 5.3 2.1l1-1A8.4 8.4 0 007.5 1.4 8.4 8.4 0 001.7 3.9l1 1c1.4-1.3 3.3-2.1 4.8-2.1z"/>
          <path d="M7.5 6c1.2 0 2.3.5 3.1 1.3l1-1A6 6 0 007.5 4.7 6 6 0 003.4 6.3l1 1A4.4 4.4 0 017.5 6z"/>
          <circle cx="7.5" cy="9.3" r="1.3"/>
        </svg>
        <svg width="24" height="11" viewBox="0 0 24 11">
          <rect x="0.5" y="0.5" width="20" height="10" rx="2.5" fill="none" stroke={VERRA.text} strokeOpacity="0.45"/>
          <rect x="2" y="2" width="17" height="7" rx="1.5" fill={VERRA.text}/>
          <path d="M22 4v3c.7-.2 1.2-.9 1.2-1.5S22.7 4.2 22 4z" fill={VERRA.text} fillOpacity="0.5"/>
        </svg>
      </div>
    </div>
  );
}

function VFrame({ children, bg }) {
  return (
    <div style={{
      width: 390, height: 844, borderRadius: 48, overflow: 'hidden',
      position: 'relative', background: bg || VERRA.ink,
      boxShadow: '0 30px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.06)',
      fontFamily: VFONT, color: VERRA.text,
      WebkitFontSmoothing: 'antialiased',
    }}>
      <div style={{
        position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
        width: 120, height: 34, borderRadius: 22, background: '#000', zIndex: 50,
      }} />
      <VStatus />
      <div style={{
        position: 'absolute', bottom: 8, left: 0, right: 0,
        display: 'flex', justifyContent: 'center',
      }}>
        <div style={{ width: 134, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.5)' }} />
      </div>
      {children}
    </div>
  );
}

// Abstract sound-prism mascot (NOT a face — just geometry)
function Prism({ size = 120, glow = true }) {
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      {glow && (
        <div style={{
          position: 'absolute', inset: -size * 0.4,
          background: `radial-gradient(circle, ${VERRA.teal}55 0%, transparent 60%)`,
          filter: 'blur(8px)',
        }} />
      )}
      <svg viewBox="0 0 120 120" width={size} height={size} style={{ position: 'relative' }}>
        <defs>
          <linearGradient id="prismG" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={VERRA.teal} />
            <stop offset="100%" stopColor={VERRA.coral} />
          </linearGradient>
        </defs>
        {/* triangular prism */}
        <polygon points="60,12 108,96 12,96" fill="none" stroke="url(#prismG)" strokeWidth="2.5" strokeLinejoin="round"/>
        <polygon points="60,12 108,96 12,96" fill="url(#prismG)" fillOpacity="0.12"/>
        {/* inner stripe — light through prism */}
        <line x1="22" y1="86" x2="98" y2="86" stroke={VERRA.teal} strokeWidth="2" strokeLinecap="round" opacity="0.85"/>
        <line x1="32" y1="74" x2="88" y2="74" stroke={VERRA.coral} strokeWidth="1.6" strokeLinecap="round" opacity="0.7"/>
        <line x1="42" y1="62" x2="78" y2="62" stroke={VERRA.amber} strokeWidth="1.2" strokeLinecap="round" opacity="0.6"/>
      </svg>
    </div>
  );
}

function VLogo({ size = 26 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <svg width={size} height={size} viewBox="0 0 32 32">
        <polygon points="16,4 28,26 4,26" fill="none" stroke={VERRA.teal} strokeWidth="2.4" strokeLinejoin="round"/>
        <line x1="10" y1="22" x2="22" y2="22" stroke={VERRA.coral} strokeWidth="2.2" strokeLinecap="round"/>
      </svg>
      <span style={{ fontFamily: VSERIF, fontSize: size * 0.85, fontWeight: 600, letterSpacing: -0.5 }}>verra</span>
    </div>
  );
}

function VBtn({ children, primary, style }) {
  return (
    <div style={{
      height: 56, borderRadius: 18,
      background: primary ? VERRA.teal : 'rgba(255,255,255,0.05)',
      color: primary ? VERRA.ink : VERRA.text,
      border: primary ? 'none' : `1px solid ${VERRA.line}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      fontFamily: VFONT, fontWeight: 600, fontSize: 16.5, letterSpacing: -0.2,
      boxShadow: primary ? `0 14px 32px ${VERRA.teal}33` : 'none',
      ...style,
    }}>{children}</div>
  );
}

function VBack() {
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 20,
      background: 'rgba(255,255,255,0.05)', border: `1px solid ${VERRA.line}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="10" height="16" viewBox="0 0 10 16">
        <path d="M8 2L2 8l6 6" stroke={VERRA.text} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

function VStepper({ step, total = 5 }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          flex: 1, height: 4, borderRadius: 2,
          background: i <= step ? VERRA.teal : 'rgba(255,255,255,0.08)',
        }} />
      ))}
    </div>
  );
}

// ─── 01 · Welcome / intake ──────────────────────────────────
function S1Welcome() {
  return (
    <VFrame>
      {/* atmospheric backdrop */}
      <div style={{
        position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)',
        width: 520, height: 520, borderRadius: '50%',
        background: `radial-gradient(circle, ${VERRA.tealDeep}33 0%, transparent 60%)`,
        filter: 'blur(20px)', pointerEvents: 'none',
      }} />
      <div style={{
        padding: '32px 28px 36px', height: '100%',
        display: 'flex', flexDirection: 'column', position: 'relative',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 }}>
          <VLogo />
          <div style={{
            width: 38, height: 38, borderRadius: 19, background: 'rgba(255,255,255,0.06)',
            border: `1px solid ${VERRA.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill={VERRA.teal}>
              <path d="M8 1l1.8 4.2L14 6l-3 3 .7 4.5L8 11l-3.7 2.5L5 9 2 6l4.2-.8z"/>
            </svg>
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 36 }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Prism size={150} />
          </div>

          <div>
            <h1 style={{
              margin: 0, fontFamily: VSERIF, fontSize: 52, lineHeight: 0.96,
              fontWeight: 500, letterSpacing: -1.6, textWrap: 'pretty',
            }}>
              Quem<br/>tem <em style={{ color: VERRA.teal, fontStyle: 'italic' }}>razão?</em>
            </h1>
            <p style={{
              margin: '18px 0 0', fontSize: 16, lineHeight: 1.45,
              color: VERRA.textSoft, letterSpacing: -0.1, maxWidth: 300,
            }}>
              Conta-nos a tua versão. A Verra escuta os dois lados — e diz-te com clareza.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <VBtn primary>
            Começar análise
            <svg width="16" height="16" viewBox="0 0 16 16"><path d="M3 8h10m0 0L9 4m4 4l-4 4" stroke={VERRA.ink} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </VBtn>
          <div style={{ textAlign: 'center', fontSize: 14, color: VERRA.textSoft }}>
            Já tens conta? <span style={{ color: VERRA.teal, fontWeight: 600 }}>Entrar</span>
          </div>
        </div>
      </div>
    </VFrame>
  );
}

// ─── 02 · Voice intake ──────────────────────────────────────
function S2Voice() {
  return (
    <VFrame>
      <div style={{ padding: '20px 24px 28px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
          <VBack />
          <div style={{ flex: 1 }}>
            <VStepper step={0} />
          </div>
        </div>

        <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Prism size={36} glow={false} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Verra</div>
            <div style={{ fontSize: 12, color: VERRA.textSoft, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: VERRA.teal }} /> a escutar
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Verra bubble */}
          <div style={{
            alignSelf: 'flex-start', maxWidth: '82%',
            background: VERRA.ink2, padding: '14px 16px', borderRadius: '4px 18px 18px 18px',
            border: `1px solid ${VERRA.line}`,
            fontSize: 15, lineHeight: 1.45, color: VERRA.text,
          }}>
            Olá. Conta-me o que aconteceu — sem pressa. Só preciso da tua versão para começar.
          </div>
          {/* user bubble */}
          <div style={{
            alignSelf: 'flex-end', maxWidth: '82%',
            background: VERRA.teal, color: VERRA.ink,
            padding: '14px 16px', borderRadius: '18px 4px 18px 18px',
            fontSize: 15, lineHeight: 1.45, fontWeight: 500,
          }}>
            Cheguei duas horas atrasado ao jantar. Não avisei. Ele ficou furioso.
          </div>
          {/* Verra follow-up */}
          <div style={{
            alignSelf: 'flex-start', maxWidth: '82%',
            background: VERRA.ink2, padding: '14px 16px', borderRadius: '4px 18px 18px 18px',
            border: `1px solid ${VERRA.line}`,
            fontSize: 15, lineHeight: 1.45,
          }}>
            Entendo. Tinhas algum motivo para o atraso? E o jantar — era ocasião especial?
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* recording dock */}
        <div style={{
          padding: '18px 18px', borderRadius: 24,
          background: `linear-gradient(180deg, ${VERRA.ink2} 0%, ${VERRA.ink3} 100%)`,
          border: `1px solid ${VERRA.line}`,
          display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center',
        }}>
          {/* waveform */}
          <svg width="280" height="44" viewBox="0 0 280 44">
            {Array.from({ length: 38 }).map((_, i) => {
              const h = 6 + Math.abs(Math.sin(i * 0.6) * 18) + (i > 8 && i < 28 ? Math.random() * 14 : 0);
              return <rect key={i} x={i * 7.5} y={22 - h / 2} width="3" height={h} rx="1.5"
                fill={i < 22 ? VERRA.teal : 'rgba(255,255,255,0.18)'} />;
            })}
          </svg>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%' }}>
            <div style={{ fontSize: 13, color: VERRA.textSoft, fontVariantNumeric: 'tabular-nums' }}>0:42</div>
            <div style={{ flex: 1 }} />
            <div style={{
              width: 56, height: 56, borderRadius: 28, background: VERRA.coral,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 10px 28px ${VERRA.coral}55`,
            }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, background: '#fff' }} />
            </div>
            <div style={{ flex: 1 }} />
            <div style={{
              fontSize: 13, color: VERRA.text, fontWeight: 600,
              padding: '8px 12px', borderRadius: 12, background: 'rgba(255,255,255,0.06)',
            }}>Texto</div>
          </div>
        </div>
      </div>
    </VFrame>
  );
}

// ─── 03 · Invite the other side ─────────────────────────────
function S3Invite() {
  return (
    <VFrame>
      <div style={{ padding: '20px 28px 28px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
          <VBack />
          <div style={{ flex: 1 }}>
            <VStepper step={1} />
          </div>
        </div>

        <div style={{ marginTop: 36 }}>
          <div style={{
            display: 'inline-flex', padding: '6px 12px', borderRadius: 999,
            background: VERRA.coralSoft, color: VERRA.coral,
            fontSize: 12, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase',
          }}>passo 2 de 5</div>
          <h1 style={{
            margin: '14px 0 0', fontFamily: VSERIF, fontSize: 38, fontWeight: 500,
            letterSpacing: -1, lineHeight: 1.05,
          }}>
            Agora é a vez<br/>
            <em style={{ color: VERRA.coral, fontStyle: 'italic' }}>do outro lado.</em>
          </h1>
          <p style={{ margin: '12px 0 0', color: VERRA.textSoft, fontSize: 15, lineHeight: 1.45 }}>
            Sem a versão dele, não há veredicto justo. Envia o convite — é anónimo do teu lado.
          </p>
        </div>

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* recipient card */}
          <div style={{
            padding: 16, borderRadius: 18, background: VERRA.ink2,
            border: `1px solid ${VERRA.line}`,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 24,
              background: `linear-gradient(135deg, ${VERRA.teal}, ${VERRA.tealDeep})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: VSERIF, fontSize: 20, fontWeight: 600, color: VERRA.ink,
            }}>R</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600 }}>Rui</div>
              <div style={{ fontSize: 13, color: VERRA.textSoft, fontVariantNumeric: 'tabular-nums' }}>+351 912 345 678</div>
            </div>
            <div style={{
              width: 32, height: 32, borderRadius: 16, background: 'rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="12" height="12" viewBox="0 0 12 12"><path d="M3 1l5 5-5 5" stroke={VERRA.text} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
          </div>

          {/* preview message */}
          <div style={{
            padding: 16, borderRadius: 18, background: VERRA.ink2,
            border: `1px dashed ${VERRA.line}`,
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: VERRA.teal, textTransform: 'uppercase', marginBottom: 8 }}>
              ✶ pré-visualização do convite
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.5, color: VERRA.text }}>
              "Olá Rui. A Ana pediu uma análise imparcial sobre uma situação entre vocês. Dá a tua versão — pode mudar o resultado."
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <VBtn primary>
          <svg width="16" height="16" viewBox="0 0 16 16"><path d="M14 2L1 8l5 1.5L11 5l-3 6 1.5 3z" fill={VERRA.ink}/></svg>
          Enviar convite
        </VBtn>
        <div style={{ textAlign: 'center', fontSize: 13, color: VERRA.textMute, marginTop: 12 }}>
          Anónimo · expira em 48 h
        </div>
      </div>
    </VFrame>
  );
}

// ─── 04 · Analyzing ─────────────────────────────────────────
function S4Analyzing() {
  const r = 90, c = 2 * Math.PI * r, p = 0.73;
  return (
    <VFrame>
      <div style={{ padding: '20px 28px 28px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
          <VBack />
          <div style={{ flex: 1 }}>
            <VStepper step={2} />
          </div>
        </div>

        <div style={{ marginTop: 28, textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontFamily: VSERIF, fontSize: 32, fontWeight: 500, letterSpacing: -0.8, lineHeight: 1.1 }}>
            A pesar <em style={{ color: VERRA.teal, fontStyle: 'italic' }}>os dois lados.</em>
          </h1>
          <p style={{ margin: '10px 0 0', color: VERRA.textSoft, fontSize: 14.5, lineHeight: 1.45 }}>
            Quanto mais contexto, mais justo o veredicto.
          </p>
        </div>

        {/* progress ring */}
        <div style={{ display: 'flex', justifyContent: 'center', margin: '32px 0' }}>
          <div style={{ position: 'relative', width: 220, height: 220 }}>
            <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="110" cy="110" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6"/>
              <circle cx="110" cy="110" r={r} fill="none" stroke={VERRA.teal} strokeWidth="6"
                strokeDasharray={c} strokeDashoffset={c * (1 - p)} strokeLinecap="round"/>
            </svg>
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ fontFamily: VSERIF, fontSize: 56, fontWeight: 500, letterSpacing: -2, lineHeight: 1 }}>73<span style={{ fontSize: 24, color: VERRA.textSoft }}>%</span></div>
              <div style={{ fontSize: 13, color: VERRA.textSoft, marginTop: 4 }}>analisado</div>
            </div>
          </div>
        </div>

        {/* checklist */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { t: 'Convite enviado ao Rui', done: true },
            { t: 'Rui abriu o convite', done: true },
            { t: 'Rui está a responder', done: true },
            { t: 'A calcular veredicto final', active: true },
            { t: 'Análise concluída', mute: true },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 22, height: 22, borderRadius: 11,
                background: s.done ? VERRA.teal : s.active ? VERRA.coralSoft : 'transparent',
                border: s.mute ? `1.5px solid ${VERRA.line}` : s.active ? `1.5px solid ${VERRA.coral}` : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {s.done && <svg width="11" height="11" viewBox="0 0 11 11"><path d="M2 5.5l2.5 2.5L9 3" stroke={VERRA.ink} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                {s.active && <div style={{ width: 8, height: 8, borderRadius: 4, background: VERRA.coral }} />}
              </div>
              <div style={{ fontSize: 14.5, color: s.mute ? VERRA.textMute : VERRA.text, fontWeight: s.active ? 600 : 400 }}>{s.t}</div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <div style={{
          padding: 14, borderRadius: 16, background: VERRA.ink2,
          border: `1px solid ${VERRA.line}`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 2l7 4v5c0 4-3 6.5-7 7-4-.5-7-3-7-7V6z" stroke={VERRA.teal} strokeWidth="1.6"/>
            <path d="M7 10l2 2 4-4" stroke={VERRA.teal} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Análise 100% confidencial</div>
            <div style={{ fontSize: 12, color: VERRA.textSoft }}>Privacidade entre vocês.</div>
          </div>
        </div>
      </div>
    </VFrame>
  );
}

// ─── 05 · Verdict (locked / paywall preview) ────────────────
function S5Verdict() {
  return (
    <VFrame>
      <div style={{ padding: '20px 24px 28px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
          <VBack />
          <div style={{ flex: 1 }}>
            <VStepper step={3} />
          </div>
        </div>

        <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Prism size={42} glow={false} />
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: VERRA.teal, textTransform: 'uppercase' }}>veredicto pronto</div>
            <div style={{ fontSize: 22, fontFamily: VSERIF, fontWeight: 500, letterSpacing: -0.4, marginTop: 2 }}>A balança decidiu.</div>
          </div>
        </div>

        {/* split scoreboard */}
        <div style={{
          marginTop: 24, padding: 22, borderRadius: 22,
          background: VERRA.ink2, border: `1px solid ${VERRA.line}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: VERRA.textSoft }}>Ana</div>
              <div style={{ fontFamily: VSERIF, fontSize: 38, fontWeight: 500, letterSpacing: -1, color: VERRA.teal, lineHeight: 1 }}>30<span style={{ fontSize: 18, color: VERRA.textSoft }}>%</span></div>
            </div>
            <div style={{ width: 1, height: 56, background: VERRA.line }} />
            <div style={{ flex: 1, textAlign: 'right' }}>
              <div style={{ fontSize: 13, color: VERRA.textSoft }}>Rui</div>
              <div style={{ fontFamily: VSERIF, fontSize: 38, fontWeight: 500, letterSpacing: -1, color: VERRA.coral, lineHeight: 1 }}>70<span style={{ fontSize: 18, color: VERRA.textSoft }}>%</span></div>
            </div>
          </div>
          <div style={{ marginTop: 16, height: 8, borderRadius: 4, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: '30%', background: VERRA.teal }} />
            <div style={{ flex: 1, background: VERRA.coral }} />
          </div>
          <div style={{ marginTop: 14, fontSize: 13.5, lineHeight: 1.5, color: VERRA.textSoft }}>
            A responsabilidade pende para o lado do <strong style={{ color: VERRA.coral }}>Rui</strong>. A análise completa explica porquê.
          </div>
        </div>

        {/* locked report */}
        <div style={{
          marginTop: 14, position: 'relative', borderRadius: 22, overflow: 'hidden',
          border: `1px solid ${VERRA.line}`, background: VERRA.ink2,
        }}>
          <div style={{ padding: 18 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: VERRA.teal, textTransform: 'uppercase' }}>relatório completo</div>
            <div style={{ fontSize: 16, fontFamily: VSERIF, marginTop: 6, fontWeight: 500 }}>3 razões + 3 passos para resolver</div>
            <div style={{ marginTop: 12, height: 8, width: '70%', borderRadius: 4, background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ marginTop: 8, height: 8, width: '92%', borderRadius: 4, background: 'rgba(255,255,255,0.06)' }} />
            <div style={{ marginTop: 8, height: 8, width: '54%', borderRadius: 4, background: 'rgba(255,255,255,0.06)' }} />
          </div>
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(180deg, transparent 0%, ${VERRA.ink2}cc 60%, ${VERRA.ink2} 100%)`,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 16,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '10px 16px', borderRadius: 999, background: 'rgba(255,255,255,0.06)',
              border: `1px solid ${VERRA.line}`,
              fontSize: 13, fontWeight: 600,
            }}>
              <svg width="13" height="14" viewBox="0 0 13 14"><path d="M3 6V4a3.5 3.5 0 117 0v2m-9 0h11v7H1z" fill="none" stroke={VERRA.text} strokeWidth="1.5"/></svg>
              Bloqueado
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, justifyContent: 'center', marginBottom: 12 }}>
          <span style={{ fontFamily: VSERIF, fontSize: 30, fontWeight: 500, letterSpacing: -0.6 }}>€4,99</span>
          <span style={{ fontSize: 13, color: VERRA.textSoft }}>· pagamento único</span>
        </div>
        <VBtn primary>Desbloquear veredicto</VBtn>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, marginTop: 14, fontSize: 11.5, color: VERRA.textMute }}>
          <span>✓ Pagamento seguro</span>
          <span>✓ Sem subscrições</span>
        </div>
      </div>
    </VFrame>
  );
}

// ─── 06 · Resolution / next steps ───────────────────────────
function S6Resolution() {
  const cards = [
    { tag: 'reconhecer', title: 'O que correu mal', body: 'Ausência de aviso quebrou a confiança numa ocasião marcada.', accent: VERRA.coral },
    { tag: 'reparar', title: 'Quem deve dar o passo', body: 'Rui — um pedido de desculpa específico, não genérico.', accent: VERRA.teal },
    { tag: 'evitar repetir', title: '3 passos práticos', body: 'Aviso até 30 min antes · ritual de jantares · check-in semanal.', accent: VERRA.amber },
  ];
  return (
    <VFrame>
      <div style={{ padding: '20px 24px 28px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
          <VBack />
          <div style={{ flex: 1 }}>
            <VStepper step={4} />
          </div>
          <div style={{
            padding: '6px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.05)',
            border: `1px solid ${VERRA.line}`, fontSize: 12, color: VERRA.textSoft,
          }}>Partilhar</div>
        </div>

        <div style={{ marginTop: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 0.6, color: VERRA.teal, textTransform: 'uppercase' }}>resolução</div>
          <h1 style={{ margin: '8px 0 0', fontFamily: VSERIF, fontSize: 34, fontWeight: 500, letterSpacing: -0.9, lineHeight: 1.05 }}>
            Não basta saber quem.<br/>
            <em style={{ color: VERRA.teal, fontStyle: 'italic' }}>Importa o como.</em>
          </h1>
        </div>

        <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cards.map((c, i) => (
            <div key={i} style={{
              padding: 16, borderRadius: 18, background: VERRA.ink2,
              border: `1px solid ${VERRA.line}`,
              display: 'flex', gap: 14, alignItems: 'flex-start',
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 12,
                background: `${c.accent}1f`, color: c.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: VSERIF, fontSize: 17, fontWeight: 600, flexShrink: 0,
              }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color: c.accent }}>{c.tag}</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginTop: 2, letterSpacing: -0.2 }}>{c.title}</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.45, color: VERRA.textSoft, marginTop: 4 }}>{c.body}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <VBtn primary>
          <svg width="16" height="16" viewBox="0 0 16 16"><path d="M14 2L1 8l5 1.5L11 5l-3 6 1.5 3z" fill={VERRA.ink}/></svg>
          Enviar resolução ao Rui
        </VBtn>
        <div style={{
          marginTop: 10, padding: '12px 14px', borderRadius: 14,
          background: 'rgba(255,255,255,0.04)', border: `1px solid ${VERRA.line}`,
          display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5, color: VERRA.textSoft,
        }}>
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M7 1l6 3v4c0 3-2.5 5-6 5.5C3.5 13 1 11 1 8V4z" fill="none" stroke={VERRA.teal} strokeWidth="1.5"/></svg>
          Apenas tu e o Rui terão acesso. Verra nunca partilha.
        </div>
      </div>
    </VFrame>
  );
}

Object.assign(window, {
  S1Welcome, S2Voice, S3Invite, S4Analyzing, S5Verdict, S6Resolution,
  VERRA, VFONT, VSERIF,
});
