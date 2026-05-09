// MARA AI — refined dark editorial concept (v2).
// Design language: deep ink + glass surfaces, single-accent gradient, big serif display, generous whitespace.
// Mascot: a refined "lens" — concentric rings + soft core. No face, no character art.

const X = {
  ink: '#0A0717',         // near-black violet
  ink2: '#13102A',        // surface
  ink3: '#1B1638',        // raised
  line: 'rgba(180,160,255,0.10)',
  lineSoft: 'rgba(180,160,255,0.06)',
  text: '#F2EEFF',
  textSoft: 'rgba(228,222,255,0.62)',
  textMute: 'rgba(228,222,255,0.34)',
  // single-accent palette — purple to magenta
  acc1: '#9B7BFF',        // soft lavender (primary)
  acc2: '#FF6BB1',        // soft magenta (secondary)
  accDeep: '#5A2BD9',
  good: '#34D399',
  warm: '#FFB36B',
};

const FUI = '"Inter", -apple-system, "SF Pro Text", system-ui, sans-serif';
const FED = '"Fraunces", "Times New Roman", Georgia, serif';
const GRAD = `linear-gradient(135deg, ${X.acc1} 0%, ${X.acc2} 100%)`;
const GRAD_TXT = `linear-gradient(90deg, ${X.acc1}, ${X.acc2})`;

// ─── chrome ───────────────────────────────────────────────
function XStatus({ time = '9:41' }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '18px 28px 6px', color: X.text, fontFamily: FUI,
      fontSize: 15, fontWeight: 600, letterSpacing: -0.1,
    }}>
      <span>{time}</span>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <svg width="17" height="11" viewBox="0 0 17 11"><g fill={X.text}>
          <rect x="0" y="7" width="3" height="4" rx="0.5"/><rect x="4.5" y="5" width="3" height="6" rx="0.5"/>
          <rect x="9" y="2.5" width="3" height="8.5" rx="0.5"/><rect x="13.5" y="0" width="3" height="11" rx="0.5"/>
        </g></svg>
        <svg width="15" height="11" viewBox="0 0 15 11" fill={X.text}>
          <path d="M7.5 2.8c2 0 3.9.8 5.3 2.1l1-1A8.4 8.4 0 007.5 1.4 8.4 8.4 0 001.7 3.9l1 1c1.4-1.3 3.3-2.1 4.8-2.1z"/>
          <path d="M7.5 6c1.2 0 2.3.5 3.1 1.3l1-1A6 6 0 007.5 4.7 6 6 0 003.4 6.3l1 1A4.4 4.4 0 017.5 6z"/>
          <circle cx="7.5" cy="9.3" r="1.3"/>
        </svg>
        <svg width="24" height="11" viewBox="0 0 24 11">
          <rect x="0.5" y="0.5" width="20" height="10" rx="2.5" fill="none" stroke={X.text} strokeOpacity="0.45"/>
          <rect x="2" y="2" width="17" height="7" rx="1.5" fill={X.text}/>
          <path d="M22 4v3c.7-.2 1.2-.9 1.2-1.5S22.7 4.2 22 4z" fill={X.text} fillOpacity="0.5"/>
        </svg>
      </div>
    </div>
  );
}

function XFrame({ children, bg }) {
  return (
    <div style={{
      width: 390, height: 844, borderRadius: 48, overflow: 'hidden',
      position: 'relative', background: bg || X.ink, color: X.text,
      boxShadow: '0 30px 80px rgba(0,0,0,0.45), 0 0 0 1px rgba(255,255,255,0.05)',
      fontFamily: FUI, WebkitFontSmoothing: 'antialiased',
    }}>
      <div style={{
        position: 'absolute', top: 11, left: '50%', transform: 'translateX(-50%)',
        width: 120, height: 34, borderRadius: 22, background: '#000', zIndex: 50,
      }}/>
      <XStatus />
      <div style={{
        position: 'absolute', bottom: 8, left: 0, right: 0,
        display: 'flex', justifyContent: 'center',
      }}>
        <div style={{ width: 134, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.5)' }}/>
      </div>
      {children}
    </div>
  );
}

// Refined "lens" mascot — concentric rings + soft glowing core
function Lens({ size = 120, intensity = 1 }) {
  const id = `g${size}_${Math.round(intensity * 100)}`;
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <div style={{
        position: 'absolute', inset: -size * 0.45,
        background: `radial-gradient(circle, ${X.acc1}${Math.round(intensity * 0x55).toString(16).padStart(2, '0')} 0%, transparent 60%)`,
        filter: 'blur(14px)',
      }}/>
      <svg viewBox="0 0 120 120" width={size} height={size} style={{ position: 'relative' }}>
        <defs>
          <radialGradient id={`${id}c`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95"/>
            <stop offset="35%" stopColor={X.acc2} stopOpacity="0.9"/>
            <stop offset="100%" stopColor={X.accDeep} stopOpacity="1"/>
          </radialGradient>
          <linearGradient id={`${id}r`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={X.acc1}/>
            <stop offset="100%" stopColor={X.acc2}/>
          </linearGradient>
        </defs>
        {/* outer rings */}
        <circle cx="60" cy="60" r="56" fill="none" stroke={`url(#${id}r)`} strokeWidth="0.6" opacity="0.35"/>
        <circle cx="60" cy="60" r="48" fill="none" stroke={`url(#${id}r)`} strokeWidth="0.8" opacity="0.5"/>
        <circle cx="60" cy="60" r="38" fill="none" stroke={`url(#${id}r)`} strokeWidth="1.1" opacity="0.7"/>
        {/* core */}
        <circle cx="60" cy="60" r="26" fill={`url(#${id}c)`}/>
        {/* highlight crescent */}
        <path d="M44 50 Q60 38 76 50" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

// Wordmark — lowercase serif italic with a bullet glyph
function Wordmark({ size = 28, color = X.text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
      <span style={{
        fontFamily: FED, fontSize: size, fontWeight: 500, fontStyle: 'italic',
        letterSpacing: -0.6, color,
      }}>mara</span>
      <span style={{
        width: 5, height: 5, borderRadius: 3, display: 'inline-block',
        background: GRAD,
      }}/>
      <span style={{
        fontFamily: FUI, fontSize: size * 0.42, fontWeight: 700,
        letterSpacing: 1.4, color: X.textSoft, textTransform: 'uppercase',
      }}>ai</span>
    </div>
  );
}

function XBack() {
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 20,
      background: 'rgba(255,255,255,0.04)', border: `1px solid ${X.line}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(10px)',
    }}>
      <svg width="9" height="14" viewBox="0 0 9 14"><path d="M7 1L1 7l6 6" stroke={X.text} strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
    </div>
  );
}

function XBtn({ children, primary, ghost, style }) {
  const bg = primary ? GRAD : ghost ? 'transparent' : 'rgba(255,255,255,0.05)';
  return (
    <div style={{
      height: 56, borderRadius: 999,
      background: bg, color: X.text,
      border: ghost ? `1px solid ${X.line}` : 'none',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
      fontFamily: FUI, fontWeight: 600, fontSize: 16, letterSpacing: -0.1,
      boxShadow: primary ? `0 16px 40px ${X.acc1}40` : 'none',
      ...style,
    }}>{children}</div>
  );
}

function XGradText({ children, size = 36, weight = 500 }) {
  return (
    <em style={{
      fontFamily: FED, fontSize: size, fontWeight: weight, fontStyle: 'italic',
      letterSpacing: -1, lineHeight: 1,
      background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
    }}>{children}</em>
  );
}

// abstract "person" chip — soft gradient disc, no face
function Disc({ initial, hue = X.acc1, size = 44 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: size / 2,
      background: `radial-gradient(circle at 35% 30%, ${hue}, ${X.accDeep} 80%)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: FED, fontSize: size * 0.4, fontWeight: 500, fontStyle: 'italic', color: '#fff',
      flexShrink: 0, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.15)',
    }}>{initial}</div>
  );
}

// soft section card
function Card({ children, style, raised }) {
  return (
    <div style={{
      borderRadius: 22,
      background: raised
        ? `linear-gradient(180deg, ${X.ink2} 0%, ${X.ink3} 100%)`
        : 'rgba(255,255,255,0.025)',
      border: `1px solid ${X.line}`,
      backdropFilter: 'blur(10px)',
      ...style,
    }}>{children}</div>
  );
}

// ───────────────────────────────────────────────────────────
// 01 · Welcome — minimal, editorial
function S01Welcome() {
  return (
    <XFrame>
      {/* atmospheric glow */}
      <div style={{
        position: 'absolute', top: 80, left: '50%', transform: 'translateX(-50%)',
        width: 500, height: 500, borderRadius: '50%',
        background: `radial-gradient(circle, ${X.acc1}33 0%, transparent 60%)`,
        filter: 'blur(40px)', pointerEvents: 'none',
      }}/>
      <div style={{ position: 'relative', padding: '32px 32px 36px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Wordmark size={26} />
          <Disc initial="a" hue={X.acc2} size={34} />
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 36 }}>
          <Lens size={140} intensity={1.3} />

          <div>
            <div style={{
              fontSize: 12, fontWeight: 700, letterSpacing: 1.6,
              color: X.acc1, textTransform: 'uppercase', marginBottom: 14,
            }}>mediação imparcial</div>
            <h1 style={{
              margin: 0, fontFamily: FED, fontSize: 56, fontWeight: 400,
              letterSpacing: -2, lineHeight: 0.96, color: X.text,
            }}>
              Quem tem<br/><XGradText size={56}>razão?</XGradText>
            </h1>
            <p style={{ margin: '22px 0 0', fontSize: 16, color: X.textSoft, lineHeight: 1.5, maxWidth: 290 }}>
              Conta a tua versão. A Mara escuta os dois lados — e diz com clareza.
            </p>
          </div>
        </div>

        {/* compact input pill */}
        <Card style={{
          padding: 6, borderRadius: 999, display: 'flex',
          alignItems: 'center', gap: 6,
        }} raised>
          <div style={{ flex: 1, padding: '0 18px', fontSize: 15, color: X.textMute }}>
            Conta-me o que aconteceu…
          </div>
          <div style={{
            width: 44, height: 44, borderRadius: 22, background: GRAD,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 6px 16px ${X.acc1}55`,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 7h10m0 0L8 3m4 4l-4 4" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>
        </Card>

        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex' }}>
            {[X.acc1, X.acc2, X.warm].map((c, i) => (
              <div key={i} style={{
                width: 22, height: 22, borderRadius: 11,
                background: `radial-gradient(circle at 35% 30%, ${c}, ${X.accDeep})`,
                marginLeft: i === 0 ? 0 : -7, border: `2px solid ${X.ink}`,
              }}/>
            ))}
          </div>
          <span style={{ fontSize: 13, color: X.textSoft, fontVariantNumeric: 'tabular-nums' }}>
            <strong style={{ color: X.text }}>12.352</strong> casos analisados
          </span>
        </div>
      </div>
    </XFrame>
  );
}

// 02 · Setup — relationship type with refined cards
function S02Setup() {
  const types = [
    { k: 'casal', label: 'Casal', sub: 'parceiro · ex', glyph: 'heart', active: true },
    { k: 'amigos', label: 'Amigos', sub: 'amizade · grupo', glyph: 'people' },
    { k: 'familia', label: 'Família', sub: 'pais · irmãos', glyph: 'home' },
    { k: 'trabalho', label: 'Trabalho', sub: 'colegas · chefe', glyph: 'work' },
  ];
  const glyph = (g, color) => {
    const stroke = { stroke: color, strokeWidth: 1.6, fill: 'none', strokeLinejoin: 'round', strokeLinecap: 'round' };
    if (g === 'heart') return <svg width="22" height="22" viewBox="0 0 22 22"><path d="M11 19L3 11.5a4.5 4.5 0 016.4-6.3L11 6.3l1.6-1.1a4.5 4.5 0 016.4 6.3z" {...stroke}/></svg>;
    if (g === 'people') return <svg width="22" height="22" viewBox="0 0 22 22"><circle cx="8" cy="8" r="3" {...stroke}/><circle cx="15" cy="9" r="2.4" {...stroke}/><path d="M2 18c0-2.5 2.6-4.5 6-4.5s6 2 6 4.5M14 18c0-1.8 1.6-3 4-3s4 1.2 4 3" {...stroke}/></svg>;
    if (g === 'home') return <svg width="22" height="22" viewBox="0 0 22 22"><path d="M3 11l8-7 8 7v8a1 1 0 01-1 1h-4v-6H8v6H4a1 1 0 01-1-1z" {...stroke}/></svg>;
    return <svg width="22" height="22" viewBox="0 0 22 22"><rect x="3" y="6" width="16" height="12" rx="2" {...stroke}/><path d="M8 6V4a1 1 0 011-1h4a1 1 0 011 1v2" {...stroke}/></svg>;
  };
  return (
    <XFrame>
      <div style={{ padding: '20px 28px 28px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 14 }}>
          <XBack />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', color: X.textSoft }}>
              <span style={{ color: X.acc1 }}>passo 1</span><span>de 3</span>
            </div>
            <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
              <div style={{ width: '33%', height: 3, background: GRAD }}/>
            </div>
          </div>
        </div>

        <h1 style={{
          margin: '36px 0 6px', fontFamily: FED, fontSize: 38, fontWeight: 400,
          letterSpacing: -1.2, lineHeight: 1.05,
        }}>Que tipo de<br/><XGradText size={38}>relação?</XGradText></h1>
        <p style={{ margin: '6px 0 0', fontSize: 14, color: X.textSoft }}>
          A Mara adapta as perguntas ao contexto.
        </p>

        <div style={{ marginTop: 22, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {types.map(t => (
            <div key={t.k} style={{
              padding: 16, borderRadius: 22,
              background: t.active ? GRAD : 'rgba(255,255,255,0.025)',
              border: t.active ? 'none' : `1px solid ${X.line}`,
              boxShadow: t.active ? `0 14px 30px ${X.acc1}40` : 'none',
              display: 'flex', flexDirection: 'column', gap: 28,
              minHeight: 124,
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 12,
                background: t.active ? 'rgba(255,255,255,0.18)' : 'rgba(155,123,255,0.10)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {glyph(t.glyph, t.active ? '#fff' : X.acc1)}
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600, letterSpacing: -0.2 }}>{t.label}</div>
                <div style={{ fontSize: 12, color: t.active ? 'rgba(255,255,255,0.75)' : X.textMute, marginTop: 2 }}>{t.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: X.text }}>Há quanto tempo?</div>
            <div style={{ fontFamily: FED, fontStyle: 'italic', fontSize: 18, color: X.acc1 }}>1.5 anos</div>
          </div>
          <div style={{ marginTop: 14, position: 'relative', height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
            <div style={{
              position: 'absolute', left: 0, top: 0, height: 4, borderRadius: 2, width: '52%', background: GRAD,
            }}/>
            <div style={{
              position: 'absolute', top: -7, left: 'calc(52% - 9px)', width: 18, height: 18,
              borderRadius: 9, background: '#fff', boxShadow: `0 0 0 4px ${X.acc1}55, 0 4px 12px rgba(0,0,0,0.3)`,
            }}/>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, fontSize: 11.5, color: X.textMute }}>
            <span>6 meses</span><span>3+ anos</span>
          </div>
        </div>

        <div style={{ flex: 1 }} />
        <XBtn primary>
          Continuar
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 7h10m0 0L8 3m4 4l-4 4" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </XBtn>
      </div>
    </XFrame>
  );
}

// 03 · Chat — tighter, single bubble at a time, refined waveform
function S03Chat() {
  return (
    <XFrame>
      <div style={{ padding: '20px 24px 28px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
          <XBack />
          <Lens size={32} intensity={0.6} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 15, fontWeight: 600, fontFamily: FED, fontStyle: 'italic', letterSpacing: -0.3 }}>Mara</div>
            <div style={{ fontSize: 11.5, color: X.textSoft, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: X.good, boxShadow: `0 0 6px ${X.good}` }}/>
              a escutar
            </div>
          </div>
          <div style={{
            width: 32, height: 32, borderRadius: 16, background: 'rgba(255,255,255,0.04)',
            border: `1px solid ${X.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill={X.text}><circle cx="3" cy="7" r="1.4"/><circle cx="7" cy="7" r="1.4"/><circle cx="11" cy="7" r="1.4"/></svg>
          </div>
        </div>

        <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* mara bubble */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
            <Lens size={26} intensity={0.4} />
            <div style={{
              maxWidth: '78%',
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${X.line}`,
              padding: '14px 16px', borderRadius: '4px 20px 20px 20px',
              fontSize: 15, lineHeight: 1.45,
            }}>
              Olá. Sem pressa — conta-me o que aconteceu. Só preciso da tua versão.
              <div style={{ fontSize: 10.5, color: X.textMute, marginTop: 6, letterSpacing: 0.4 }}>09:41</div>
            </div>
          </div>
          {/* user */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <div style={{
              maxWidth: '78%', background: GRAD, color: '#fff',
              padding: '14px 16px', borderRadius: '20px 4px 20px 20px',
              fontSize: 15, lineHeight: 1.45, fontWeight: 500,
              boxShadow: `0 10px 30px ${X.acc1}33`,
            }}>
              Cheguei 2 horas atrasada ao jantar dele. Não avisei.
              <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.7)', marginTop: 6, letterSpacing: 0.4 }}>09:43 ✓✓</div>
            </div>
          </div>
          {/* mara follow-up */}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
            <Lens size={26} intensity={0.4} />
            <div style={{
              maxWidth: '78%',
              background: 'rgba(255,255,255,0.04)',
              border: `1px solid ${X.line}`,
              padding: '14px 16px', borderRadius: '4px 20px 20px 20px',
              fontSize: 15, lineHeight: 1.45,
            }}>
              Era ocasião marcada? E tinhas algum motivo para o atraso?
              <div style={{ fontSize: 10.5, color: X.textMute, marginTop: 6, letterSpacing: 0.4 }}>09:44</div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }} />

        {/* recording dock — minimal */}
        <Card raised style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 24, background: GRAD,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 8px 22px ${X.acc1}55`, flexShrink: 0,
          }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: '#fff' }}/>
          </div>
          <svg width="100%" height="32" viewBox="0 0 220 32" style={{ flex: 1 }}>
            <defs>
              <linearGradient id="wv2" x1="0" x2="1"><stop offset="0%" stopColor={X.acc1}/><stop offset="100%" stopColor={X.acc2}/></linearGradient>
            </defs>
            {Array.from({ length: 38 }).map((_, i) => {
              const h = 4 + Math.abs(Math.sin(i * 0.7) * 12) + (i > 12 && i < 28 ? 6 : 0);
              return <rect key={i} x={i * 5.6} y={16 - h / 2} width="2" height={h} rx="1"
                fill={i < 24 ? 'url(#wv2)' : 'rgba(180,160,255,0.18)'}/>;
            })}
          </svg>
          <div style={{ fontSize: 13, color: X.textSoft, fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>0:42</div>
        </Card>
      </div>
    </XFrame>
  );
}

// 04 · Invite — refined editorial card
function S04Invite() {
  return (
    <XFrame>
      <div style={{
        position: 'absolute', top: 60, right: -80, width: 320, height: 320, borderRadius: '50%',
        background: `radial-gradient(circle, ${X.acc2}33 0%, transparent 60%)`,
        filter: 'blur(40px)', pointerEvents: 'none',
      }}/>
      <div style={{ position: 'relative', padding: '20px 28px 28px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginTop: 18 }}><XBack /></div>

        <div style={{ marginTop: 32 }}>
          <div style={{
            fontSize: 11.5, fontWeight: 700, letterSpacing: 1.6, textTransform: 'uppercase',
            color: X.acc2,
          }}>passo 2 de 3</div>
          <h1 style={{
            margin: '12px 0 0', fontFamily: FED, fontSize: 42, fontWeight: 400,
            letterSpacing: -1.4, lineHeight: 1.0,
          }}>
            Agora é a vez<br/><XGradText size={42}>do outro lado.</XGradText>
          </h1>
          <p style={{ margin: '14px 0 0', fontSize: 15, color: X.textSoft, lineHeight: 1.45, maxWidth: 320 }}>
            Sem a versão dele, não há veredicto justo. Envia o convite — anónimo do teu lado.
          </p>
        </div>

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Card style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
            <Disc initial="r" hue={X.acc1} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 600, fontFamily: FED, fontStyle: 'italic', letterSpacing: -0.3 }}>Rui</div>
              <div style={{ fontSize: 13, color: X.textSoft, fontVariantNumeric: 'tabular-nums' }}>+351 912 345 678</div>
            </div>
            <div style={{
              padding: '6px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700,
              letterSpacing: 0.6, textTransform: 'uppercase',
              color: X.acc1, background: 'rgba(155,123,255,0.10)', border: `1px solid ${X.line}`,
            }}>editar</div>
          </Card>

          <Card style={{ padding: 16, position: 'relative' }}>
            <div style={{
              position: 'absolute', top: -8, left: 16, padding: '2px 8px', borderRadius: 999,
              fontSize: 10, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase',
              color: X.acc1, background: X.ink, border: `1px solid ${X.line}`,
            }}>pré-visualização</div>
            <div style={{ fontFamily: FED, fontStyle: 'italic', fontSize: 16, lineHeight: 1.5, color: X.text, marginTop: 4 }}>
              "Olá Rui. A Ana pediu uma análise imparcial sobre uma situação entre vocês. Há um veredicto preliminar — a tua versão pode mudar o resultado."
            </div>
          </Card>
        </div>

        <div style={{ flex: 1 }} />

        <XBtn primary>
          <svg width="16" height="16" viewBox="0 0 16 16"><path d="M14 2L1 8l5 1.5L11 5l-3 6 1.5 3z" fill="#fff"/></svg>
          Enviar convite
        </XBtn>
        <div style={{ marginTop: 12, textAlign: 'center', fontSize: 12.5, color: X.textMute, display: 'flex', justifyContent: 'center', gap: 14 }}>
          <span>· anónimo</span><span>· expira em 48 h</span>
        </div>
      </div>
    </XFrame>
  );
}

// 05 · Analyzing — refined ring with subtle stat ticks
function S05Analyzing() {
  const r = 88, c = 2 * Math.PI * r, p = 0.73;
  return (
    <XFrame>
      <div style={{ padding: '20px 28px 28px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <XBack />
          <div style={{
            padding: '6px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700,
            letterSpacing: 1.2, textTransform: 'uppercase',
            color: X.acc1, background: 'rgba(155,123,255,0.10)', border: `1px solid ${X.line}`,
          }}>em curso</div>
        </div>

        <div style={{ marginTop: 18, textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontFamily: FED, fontSize: 32, fontWeight: 400, letterSpacing: -0.8, lineHeight: 1.1 }}>
            A pesar <XGradText size={32}>os dois lados.</XGradText>
          </h1>
          <p style={{ margin: '8px auto 0', fontSize: 13.5, color: X.textSoft, maxWidth: 240, lineHeight: 1.5 }}>
            Quanto mais contexto, mais justo o veredicto.
          </p>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', margin: '28px 0 24px' }}>
          <div style={{ position: 'relative', width: 220, height: 220 }}>
            <div style={{
              position: 'absolute', inset: -10,
              background: `radial-gradient(circle, ${X.acc1}55 0%, transparent 60%)`,
              filter: 'blur(20px)',
            }}/>
            <svg width="220" height="220" viewBox="0 0 220 220" style={{ transform: 'rotate(-90deg)', position: 'relative' }}>
              <defs>
                <linearGradient id="rg" x1="0" x2="1" y1="0" y2="1"><stop offset="0%" stopColor={X.acc1}/><stop offset="100%" stopColor={X.acc2}/></linearGradient>
              </defs>
              {/* tick ring */}
              {Array.from({ length: 60 }).map((_, i) => {
                const a = (i * 6) * Math.PI / 180;
                const x1 = 110 + Math.cos(a) * 100, y1 = 110 + Math.sin(a) * 100;
                const x2 = 110 + Math.cos(a) * 104, y2 = 110 + Math.sin(a) * 104;
                return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke={X.text} strokeOpacity={i % 5 === 0 ? 0.4 : 0.15} strokeWidth="1"/>;
              })}
              <circle cx="110" cy="110" r={r} fill="none" stroke="rgba(155,123,255,0.12)" strokeWidth="6"/>
              <circle cx="110" cy="110" r={r} fill="none" stroke="url(#rg)" strokeWidth="6"
                strokeDasharray={c} strokeDashoffset={c * (1 - p)} strokeLinecap="round"/>
            </svg>
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ fontFamily: FED, fontSize: 64, fontWeight: 400, letterSpacing: -2.5, lineHeight: 1 }}>
                73<span style={{ fontSize: 22, color: X.textSoft }}>%</span>
              </div>
              <div style={{ fontSize: 11, color: X.textMute, marginTop: 4, letterSpacing: 1.2, textTransform: 'uppercase' }}>analisado</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[
            { t: 'Convite enviado', done: true },
            { t: 'Rui abriu o convite', done: true },
            { t: 'Rui está a responder', active: true },
            { t: 'Cálculo do veredicto', mute: true },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 18, height: 18, borderRadius: 9,
                background: s.done ? X.good : s.active ? 'transparent' : 'transparent',
                border: s.active ? `1.5px solid ${X.acc1}` : s.mute ? `1.5px solid ${X.line}` : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {s.done && <svg width="9" height="9" viewBox="0 0 9 9"><path d="M1 4.5L3.5 7 8 2" stroke={X.ink} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                {s.active && <div style={{ width: 6, height: 6, borderRadius: 3, background: X.acc1, boxShadow: `0 0 6px ${X.acc1}` }}/>}
              </div>
              <div style={{ fontSize: 14, color: s.mute ? X.textMute : X.text, fontWeight: s.active ? 600 : 400 }}>{s.t}</div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />
        <Card style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M9 2l6 3v4c0 4-3 5.5-6 6-3-.5-6-2-6-6V5z" stroke={X.acc1} strokeWidth="1.5"/>
          </svg>
          <div style={{ fontSize: 13, color: X.textSoft, lineHeight: 1.4 }}>
            Avisamos-te assim que o Rui responder.
          </div>
        </Card>
      </div>
    </XFrame>
  );
}

// 06 · Replied — celebratory but minimal
function S06Replied() {
  return (
    <XFrame>
      <div style={{
        position: 'absolute', top: 100, left: '50%', transform: 'translateX(-50%)',
        width: 480, height: 480, borderRadius: '50%',
        background: `radial-gradient(circle, ${X.acc2}33 0%, transparent 60%)`,
        filter: 'blur(40px)',
      }}/>
      <div style={{ position: 'relative', padding: '20px 28px 28px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginTop: 18 }}><XBack /></div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
          <Lens size={140} intensity={1.2} />

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.6, color: X.acc2, textTransform: 'uppercase' }}>respondeu</div>
            <h1 style={{
              margin: '10px 0 0', fontFamily: FED, fontSize: 44, fontWeight: 400,
              letterSpacing: -1.4, lineHeight: 1.0,
            }}>
              Rui partilhou<br/><XGradText size={44}>a versão dele.</XGradText>
            </h1>
            <p style={{ margin: '14px 0 0', fontSize: 14.5, color: X.textSoft, lineHeight: 1.5, maxWidth: 280 }}>
              A Mara já tem toda a informação. Vamos cruzar os dois lados.
            </p>
          </div>

          {/* both discs centered */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Disc initial="a" hue={X.acc2} size={56} />
            <div style={{ width: 22, height: 1, background: X.line }}/>
            <Lens size={26} intensity={0.4} />
            <div style={{ width: 22, height: 1, background: X.line }}/>
            <Disc initial="r" hue={X.acc1} size={56} />
          </div>
        </div>

        <Card raised style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, fontFamily: FED, fontStyle: 'italic' }}>A recalcular o veredicto…</div>
            <svg width="100%" height="20" viewBox="0 0 240 20" style={{ marginTop: 6 }}>
              {Array.from({ length: 36 }).map((_, i) => {
                const h = 3 + Math.abs(Math.sin(i * 0.6) * 12);
                return <rect key={i} x={i * 6.5} y={10 - h / 2} width="1.8" height={h} rx="1"
                  fill={i < 32 ? X.acc1 : 'rgba(155,123,255,0.20)'}/>;
              })}
            </svg>
          </div>
          <div style={{ fontFamily: FED, fontSize: 26, fontWeight: 400, fontStyle: 'italic',
            background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>99%</div>
        </Card>
      </div>
    </XFrame>
  );
}

// 07 · Interrogation complete — stats
function S07Complete() {
  return (
    <XFrame>
      <div style={{ padding: '20px 28px 28px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginTop: 18 }}><XBack /></div>

        <div style={{ marginTop: 18 }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: 1.6, color: X.acc1, textTransform: 'uppercase' }}>análise concluída</div>
          <h1 style={{
            margin: '10px 0 0', fontFamily: FED, fontSize: 44, fontWeight: 400,
            letterSpacing: -1.4, lineHeight: 1.0,
          }}>
            Interrogação<br/><XGradText size={44}>completa.</XGradText>
          </h1>
          <p style={{ margin: '12px 0 0', fontSize: 14.5, color: X.textSoft, lineHeight: 1.5 }}>
            Análise imparcial baseada em ambas as versões.
          </p>
        </div>

        <div style={{ marginTop: 26, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          {[
            { v: '2', l: 'versões' },
            { v: '28', l: 'perguntas' },
            { v: '1', l: 'veredicto' },
          ].map((s, i) => (
            <Card key={i} style={{ padding: '20px 12px', textAlign: 'center' }}>
              <div style={{
                fontFamily: FED, fontSize: 44, fontWeight: 400, letterSpacing: -1.5, lineHeight: 1,
                background: GRAD_TXT, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              }}>{s.v}</div>
              <div style={{ fontSize: 11, color: X.textSoft, marginTop: 8, letterSpacing: 1.2, textTransform: 'uppercase' }}>{s.l}</div>
            </Card>
          ))}
        </div>

        <Card raised style={{ marginTop: 14, padding: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, color: X.acc1, textTransform: 'uppercase' }}>resumo</div>
          <div style={{ fontSize: 14, fontFamily: FED, fontStyle: 'italic', lineHeight: 1.5, color: X.text, marginTop: 8 }}>
            "Cruzámos as duas versões em 28 perguntas. O padrão é claro — uma das partes tem responsabilidade desproporcional."
          </div>
        </Card>

        <div style={{ flex: 1 }} />
        <XBtn primary>
          Ver veredicto
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M2 7h10m0 0L8 3m4 4l-4 4" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </XBtn>
        <div style={{
          marginTop: 10, height: 44, borderRadius: 999,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontSize: 13, color: X.textSoft,
        }}>
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v8m0 0L4 6.5m2.5 2.5L9 6.5M2 11h9" stroke={X.textSoft} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Guardar relatório (PDF)
        </div>
      </div>
    </XFrame>
  );
}

// 08 · Paywall — restrained, editorial
function S08Paywall() {
  return (
    <XFrame>
      <div style={{ padding: '20px 28px 28px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'flex-end' }}>
          <div style={{
            padding: '6px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700,
            letterSpacing: 1.2, textTransform: 'uppercase',
            color: X.textSoft, background: 'rgba(255,255,255,0.04)', border: `1px solid ${X.line}`,
          }}>×</div>
        </div>

        <div style={{ marginTop: 16, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 28,
            background: 'rgba(155,123,255,0.10)', border: `1px solid ${X.line}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="22" height="24" viewBox="0 0 22 24" fill="none">
              <path d="M5 10V7a6 6 0 1112 0v3" stroke={X.acc1} strokeWidth="1.6"/>
              <rect x="2" y="10" width="18" height="13" rx="2.5" stroke={X.acc1} strokeWidth="1.6"/>
            </svg>
          </div>
          <h1 style={{ margin: 0, fontFamily: FED, fontSize: 32, fontWeight: 400, letterSpacing: -0.9, lineHeight: 1.1 }}>
            O resultado<br/><XGradText size={32}>está pronto.</XGradText>
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: X.textSoft, maxWidth: 270, lineHeight: 1.5 }}>
            Desbloqueia para ver quem teve razão e como resolver.
          </p>
        </div>

        <Card raised style={{ marginTop: 22, padding: 22 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12, color: X.textSoft, fontFamily: FED, fontStyle: 'italic' }}>Ana</div>
              <div style={{ fontFamily: FED, fontSize: 36, fontWeight: 400, letterSpacing: -1.4, lineHeight: 1, color: X.acc1, filter: 'blur(10px)' }}>30%</div>
            </div>
            <div style={{ width: 1, height: 48, background: X.line }}/>
            <div style={{ flex: 1, textAlign: 'right' }}>
              <div style={{ fontSize: 12, color: X.textSoft, fontFamily: FED, fontStyle: 'italic' }}>Rui</div>
              <div style={{ fontFamily: FED, fontSize: 36, fontWeight: 400, letterSpacing: -1.4, lineHeight: 1, color: X.acc2, filter: 'blur(10px)' }}>70%</div>
            </div>
          </div>
          <div style={{ marginTop: 14, height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', display: 'flex', filter: 'blur(2px)' }}>
            <div style={{ width: '30%', background: X.acc1, opacity: 0.5 }}/>
            <div style={{ flex: 1, background: X.acc2, opacity: 0.5 }}/>
          </div>
        </Card>

        <div style={{ marginTop: 22, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8 }}>
            <span style={{ fontFamily: FED, fontSize: 44, fontWeight: 400, letterSpacing: -1.6, lineHeight: 1 }}>€4,99</span>
          </div>
          <div style={{ fontSize: 12, color: X.textMute, marginTop: 4 }}>Pagamento único · sem subscrições</div>
        </div>

        <div style={{ flex: 1 }} />

        <XBtn primary>
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M3 6V4a3.5 3.5 0 117 0v2m-9 0h11v7H1z" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinejoin="round"/></svg>
          Desbloquear veredicto
        </XBtn>
        <div style={{
          marginTop: 12, display: 'flex', justifyContent: 'center', gap: 10,
          fontSize: 11, color: X.textMute,
        }}>
          <span>✓ pagamento seguro</span>
          <span>·</span>
          <span>✓ apple pay · g pay · cartão</span>
        </div>
      </div>
    </XFrame>
  );
}

// 09 · Verdict reveal — editorial drama
function S09Verdict() {
  return (
    <XFrame>
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 25%, ${X.acc1}55 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, ${X.acc2}33 0%, transparent 60%)`,
      }}/>
      <div style={{ position: 'relative', padding: '20px 28px 28px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginTop: 18, display: 'flex', justifyContent: 'space-between' }}>
          <XBack />
          <div style={{
            padding: '6px 12px', borderRadius: 999, fontSize: 11, fontWeight: 700,
            letterSpacing: 1.6, textTransform: 'uppercase',
            color: X.text, background: 'rgba(155,123,255,0.18)', border: `1px solid ${X.acc1}`,
          }}>veredicto</div>
        </div>

        <div style={{ marginTop: 28, textAlign: 'center' }}>
          <div style={{ fontFamily: FED, fontSize: 14, color: X.textSoft, fontStyle: 'italic', letterSpacing: 0.4 }}>
            a balança decidiu
          </div>
          <h1 style={{
            margin: '14px 0 0', fontFamily: FED, fontSize: 56, fontWeight: 400,
            letterSpacing: -2, lineHeight: 0.95,
          }}>
            Rui esteve<br/><XGradText size={56}>mais errado.</XGradText>
          </h1>
        </div>

        {/* split bar */}
        <div style={{ marginTop: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, color: X.textSoft, textTransform: 'uppercase' }}>ana</div>
              <div style={{ fontFamily: FED, fontSize: 38, fontWeight: 400, letterSpacing: -1.4, color: X.acc1, lineHeight: 1 }}>30<span style={{ fontSize: 18, color: X.textSoft }}>%</span></div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, color: X.textSoft, textTransform: 'uppercase' }}>rui</div>
              <div style={{ fontFamily: FED, fontSize: 38, fontWeight: 400, letterSpacing: -1.4, color: X.acc2, lineHeight: 1 }}>70<span style={{ fontSize: 18, color: X.textSoft }}>%</span></div>
            </div>
          </div>
          <div style={{ height: 10, borderRadius: 5, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', display: 'flex' }}>
            <div style={{ width: '30%', background: X.acc1 }}/>
            <div style={{ flex: 1, background: X.acc2 }}/>
          </div>
        </div>

        <Card raised style={{ marginTop: 22, padding: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.4, color: X.acc2, textTransform: 'uppercase' }}>razão principal</div>
          <div style={{ fontFamily: FED, fontStyle: 'italic', fontSize: 17, lineHeight: 1.5, marginTop: 8, color: X.text }}>
            "Falta de aviso quebrou a confiança numa ocasião marcada — a responsabilidade pende para o lado do Rui."
          </div>
        </Card>

        <div style={{ flex: 1 }} />
        <div style={{ textAlign: 'center', fontSize: 12, color: X.textSoft, letterSpacing: 1.2, textTransform: 'uppercase' }}>desliza para a análise</div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
          <svg width="20" height="12" viewBox="0 0 20 12"><path d="M2 2l8 8 8-8" stroke={X.textSoft} strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
      </div>
    </XFrame>
  );
}

// 10 · Resolution — three editorial cards
function S10Resolution() {
  const cards = [
    { tag: 'reconhecer', title: 'O que correu mal', body: 'Falta de aviso quebrou a confiança numa ocasião marcada.', accent: X.acc2 },
    { tag: 'reparar', title: 'Quem dá o passo', body: 'Rui — um pedido de desculpa específico, não genérico.', accent: X.acc1 },
    { tag: 'evitar repetir', title: '3 passos práticos', body: 'Aviso até 30 min · ritual de jantares · check-in semanal.', accent: X.warm },
  ];
  return (
    <XFrame>
      <div style={{ padding: '20px 28px 28px', height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginTop: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
          <XBack />
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: 6 }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{
                width: i === 1 ? 24 : 6, height: 4, borderRadius: 2,
                background: i <= 1 ? GRAD : 'rgba(255,255,255,0.10)',
              }}/>
            ))}
          </div>
          <div style={{ width: 40, height: 40, borderRadius: 20, background: 'rgba(255,255,255,0.04)', border: `1px solid ${X.line}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="3.5" cy="7" r="1.4" stroke={X.text} strokeWidth="1.2"/>
              <circle cx="10.5" cy="3.5" r="1.4" stroke={X.text} strokeWidth="1.2"/>
              <circle cx="10.5" cy="10.5" r="1.4" stroke={X.text} strokeWidth="1.2"/>
              <path d="M5 6.5l4-2M5 7.5l4 2" stroke={X.text} strokeWidth="1.2"/>
            </svg>
          </div>
        </div>

        <div style={{ marginTop: 22 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1.6, color: X.acc1, textTransform: 'uppercase' }}>resolução</div>
          <h1 style={{ margin: '8px 0 0', fontFamily: FED, fontSize: 32, fontWeight: 400, letterSpacing: -0.9, lineHeight: 1.05 }}>
            Não basta saber quem.<br/><XGradText size={32}>Importa o como.</XGradText>
          </h1>
        </div>

        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {cards.map((c, i) => (
            <Card key={i} style={{ padding: 16, display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 12,
                background: `${c.accent}1f`, color: c.accent,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: FED, fontSize: 16, fontWeight: 500, fontStyle: 'italic', flexShrink: 0,
                border: `1px solid ${c.accent}40`,
              }}>{i + 1}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: c.accent }}>{c.tag}</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginTop: 3, letterSpacing: -0.2 }}>{c.title}</div>
                <div style={{ fontSize: 13, lineHeight: 1.45, color: X.textSoft, marginTop: 3 }}>{c.body}</div>
              </div>
            </Card>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <XBtn primary>
          <svg width="16" height="16" viewBox="0 0 16 16"><path d="M14 2L1 8l5 1.5L11 5l-3 6 1.5 3z" fill="#fff"/></svg>
          Enviar resolução ao Rui
        </XBtn>
        <div style={{
          marginTop: 10, padding: '10px 14px', borderRadius: 999,
          background: 'rgba(255,255,255,0.025)', border: `1px solid ${X.line}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          fontSize: 12, color: X.textSoft,
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12"><path d="M6 1l5 2.5v3.5c0 2.5-2 4-5 4.5C3 10.5 1 9 1 6.5V3.5z" fill="none" stroke={X.acc1} strokeWidth="1.3"/></svg>
          confidencial · só tu e o Rui
        </div>
      </div>
    </XFrame>
  );
}

Object.assign(window, {
  S01Welcome, S02Setup, S03Chat, S04Invite, S05Analyzing,
  S06Replied, S07Complete, S08Paywall, S09Verdict, S10Resolution,
  Lens, Wordmark, X,
});
