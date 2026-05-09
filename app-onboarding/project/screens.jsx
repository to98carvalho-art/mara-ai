// Bikeshare iOS signup flow screens
// Brand: Pedalo — blue (#1E5BFF) + orange (#FF6A1A) modern color scheme

const PEDALO = {
  blue: '#1E5BFF',
  blueDeep: '#0B36A8',
  orange: '#FF6A1A',
  orangeSoft: '#FFE7D6',
  ink: '#0E1530',
  inkSoft: '#5B6480',
  line: '#E6E9F2',
  bg: '#F5F7FB',
  white: '#FFFFFF',
};

const FONT = '-apple-system, "SF Pro Text", "Inter", system-ui, sans-serif';

// Reusable bits ────────────────────────────────────────────────
function StatusBarSlim({ dark }) {
  return <IOSStatusBar dark={dark} time="9:41" />;
}

function Logo({ size = 28, color = PEDALO.blue }) {
  // simple geometric mark — two interlocked circles (wheels) + connector
  return (
    <svg width={size} height={size} viewBox="0 0 32 32">
      <circle cx="9" cy="22" r="6.5" fill="none" stroke={color} strokeWidth="2.5" />
      <circle cx="23" cy="22" r="6.5" fill="none" stroke={color} strokeWidth="2.5" />
      <path d="M9 22 L16 9 L23 22" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="16" cy="9" r="2" fill={PEDALO.orange} />
    </svg>
  );
}

function PrimaryButton({ children, color = PEDALO.blue, fg = '#fff', style }) {
  return (
    <div style={{
      height: 54, borderRadius: 16, background: color, color: fg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: FONT, fontWeight: 600, fontSize: 17, letterSpacing: -0.2,
      boxShadow: color === PEDALO.blue
        ? '0 8px 20px rgba(30,91,255,0.28)'
        : '0 8px 20px rgba(255,106,26,0.28)',
      ...style,
    }}>{children}</div>
  );
}

function GhostButton({ children, style }) {
  return (
    <div style={{
      height: 54, borderRadius: 16, background: '#fff', color: PEDALO.ink,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: FONT, fontWeight: 600, fontSize: 17, letterSpacing: -0.2,
      border: `1.5px solid ${PEDALO.line}`,
      ...style,
    }}>{children}</div>
  );
}

function Field({ label, value, placeholder, focused, prefix, trailing }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {label && (
        <div style={{
          fontFamily: FONT, fontSize: 13, fontWeight: 600,
          color: PEDALO.inkSoft, letterSpacing: 0.2, textTransform: 'uppercase',
        }}>{label}</div>
      )}
      <div style={{
        height: 54, borderRadius: 14, background: '#fff',
        border: focused ? `2px solid ${PEDALO.blue}` : `1.5px solid ${PEDALO.line}`,
        display: 'flex', alignItems: 'center', padding: '0 16px',
        fontFamily: FONT, fontSize: 17, color: value ? PEDALO.ink : '#A8AEC2',
        letterSpacing: -0.2,
      }}>
        {prefix && (
          <span style={{ color: PEDALO.ink, marginRight: 8, fontWeight: 500 }}>{prefix}</span>
        )}
        <span style={{ flex: 1 }}>{value || placeholder}</span>
        {focused && <Caret />}
        {trailing}
      </div>
    </div>
  );
}

function Caret() {
  return <span style={{
    width: 2, height: 22, background: PEDALO.blue, borderRadius: 1, marginLeft: 2,
  }} />;
}

function Dots({ step, total = 5 }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center' }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{
          width: i === step ? 22 : 6, height: 6, borderRadius: 3,
          background: i === step ? PEDALO.blue : i < step ? PEDALO.ink : PEDALO.line,
          transition: 'all 0.2s',
        }} />
      ))}
    </div>
  );
}

function BackPill() {
  return (
    <div style={{
      width: 40, height: 40, borderRadius: 20, background: '#fff',
      border: `1.5px solid ${PEDALO.line}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <svg width="10" height="16" viewBox="0 0 10 16">
        <path d="M8 2L2 8l6 6" stroke={PEDALO.ink} strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 1 — Welcome
// ─────────────────────────────────────────────────────────────
function ScreenWelcome() {
  return (
    <IOSDevice>
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(180deg, ${PEDALO.blue} 0%, ${PEDALO.blueDeep} 100%)`,
      }} />
      <StatusBarSlim dark />
      <div style={{
        position: 'relative', zIndex: 2, height: '100%',
        display: 'flex', flexDirection: 'column',
        padding: '90px 24px 50px', color: '#fff', fontFamily: FONT,
      }}>
        {/* Hero illustration area */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 32,
        }}>
          {/* Big logo */}
          <div style={{
            width: 120, height: 120, borderRadius: 36,
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            backdropFilter: 'blur(20px)',
          }}>
            <Logo size={64} color="#fff" />
          </div>
          {/* Sun/orange accent ring */}
          <div style={{
            position: 'absolute', top: 140, right: -80,
            width: 220, height: 220, borderRadius: '50%',
            background: `radial-gradient(circle, ${PEDALO.orange}66 0%, transparent 70%)`,
          }} />
        </div>

        {/* Headline */}
        <div style={{ marginBottom: 36 }}>
          <h1 style={{
            margin: 0, fontSize: 40, lineHeight: 1.05, fontWeight: 800,
            letterSpacing: -1.2, textWrap: 'pretty',
          }}>
            Two wheels.<br/>
            <span style={{ color: PEDALO.orange }}>One city.</span>
          </h1>
          <p style={{
            margin: '14px 0 0', fontSize: 16, lineHeight: 1.45,
            color: 'rgba(255,255,255,0.78)', letterSpacing: -0.1, fontWeight: 400,
          }}>
            Unlock 12,000 bikes across the city. First ride is on us.
          </p>
        </div>

        {/* CTAs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <PrimaryButton color={PEDALO.orange}>Create account</PrimaryButton>
          <div style={{
            height: 54, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: FONT, fontWeight: 600, fontSize: 17, color: '#fff',
          }}>
            I already have an account
          </div>
        </div>
      </div>
    </IOSDevice>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 2 — Phone number
// ─────────────────────────────────────────────────────────────
function ScreenPhone() {
  return (
    <IOSDevice keyboard>
      <StatusBarSlim />
      <div style={{ padding: '14px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <BackPill />
        <Dots step={0} />
        <div style={{ width: 40 }} />
      </div>
      <div style={{ padding: '32px 24px 0', fontFamily: FONT, color: PEDALO.ink }}>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: -0.8, lineHeight: 1.1 }}>
          What's your<br/>phone number?
        </h1>
        <p style={{ margin: '10px 0 32px', fontSize: 15, color: PEDALO.inkSoft, lineHeight: 1.4, letterSpacing: -0.1 }}>
          We'll text a 6‑digit code to verify it's you.
        </p>
        <Field label="Phone" prefix="🇺🇸  +1" value="(415) 555‑0188" focused />
        <div style={{
          marginTop: 16, padding: '12px 14px', borderRadius: 12,
          background: PEDALO.orangeSoft, display: 'flex', gap: 10, alignItems: 'flex-start',
        }}>
          <div style={{
            width: 18, height: 18, borderRadius: 9, background: PEDALO.orange, flexShrink: 0,
            color: '#fff', fontSize: 12, fontWeight: 700, display: 'flex',
            alignItems: 'center', justifyContent: 'center', marginTop: 1,
          }}>i</div>
          <div style={{ fontSize: 13, color: '#7A3A0E', lineHeight: 1.4 }}>
            Standard message rates apply. We'll never share your number.
          </div>
        </div>
      </div>
    </IOSDevice>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 3 — OTP verification
// ─────────────────────────────────────────────────────────────
function ScreenOTP() {
  const digits = ['4', '7', '2', '9', '', ''];
  return (
    <IOSDevice keyboard>
      <StatusBarSlim />
      <div style={{ padding: '14px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <BackPill />
        <Dots step={1} />
        <div style={{ width: 40 }} />
      </div>
      <div style={{ padding: '32px 24px 0', fontFamily: FONT, color: PEDALO.ink }}>
        <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: -0.8, lineHeight: 1.1 }}>
          Enter the code
        </h1>
        <p style={{ margin: '10px 0 32px', fontSize: 15, color: PEDALO.inkSoft, lineHeight: 1.4, letterSpacing: -0.1 }}>
          Sent to <strong style={{ color: PEDALO.ink }}>(415) 555‑0188</strong>.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
          {digits.map((d, i) => (
            <div key={i} style={{
              height: 60, borderRadius: 14, background: '#fff',
              border: i === 4 ? `2px solid ${PEDALO.blue}` : `1.5px solid ${PEDALO.line}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: FONT, fontSize: 26, fontWeight: 700, color: PEDALO.ink,
              position: 'relative',
            }}>
              {d}
              {i === 4 && <Caret />}
            </div>
          ))}
        </div>
        <div style={{
          marginTop: 24, fontSize: 15, color: PEDALO.inkSoft, textAlign: 'center',
        }}>
          Didn't get it? <span style={{ color: PEDALO.blue, fontWeight: 600 }}>Resend in 0:24</span>
        </div>
      </div>
    </IOSDevice>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 4 — Profile basics
// ─────────────────────────────────────────────────────────────
function ScreenProfile() {
  return (
    <IOSDevice>
      <StatusBarSlim />
      <div style={{ padding: '14px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <BackPill />
        <Dots step={2} />
        <div style={{ width: 40 }} />
      </div>
      <div style={{ padding: '32px 24px 0', fontFamily: FONT, color: PEDALO.ink, display: 'flex', flexDirection: 'column', gap: 18 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: -0.8, lineHeight: 1.1 }}>
            Tell us about<br/>yourself
          </h1>
          <p style={{ margin: '10px 0 0', fontSize: 15, color: PEDALO.inkSoft, lineHeight: 1.4, letterSpacing: -0.1 }}>
            We use this to keep your rides insured.
          </p>
        </div>
        <Field label="Full name" value="Maya Alvarez" />
        <Field label="Email" value="maya@hey.com" />
        <Field label="Date of birth" placeholder="MM / DD / YYYY" trailing={
          <svg width="18" height="18" viewBox="0 0 18 18">
            <rect x="2" y="3.5" width="14" height="12.5" rx="2.5" fill="none" stroke={PEDALO.inkSoft} strokeWidth="1.5"/>
            <line x1="2" y1="7" x2="16" y2="7" stroke={PEDALO.inkSoft} strokeWidth="1.5"/>
            <line x1="6" y1="2" x2="6" y2="5" stroke={PEDALO.inkSoft} strokeWidth="1.5" strokeLinecap="round"/>
            <line x1="12" y1="2" x2="12" y2="5" stroke={PEDALO.inkSoft} strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        } />
        <div style={{ flex: 1 }} />
        <PrimaryButton style={{ marginBottom: 24 }}>Continue</PrimaryButton>
      </div>
    </IOSDevice>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 5 — Choose plan
// ─────────────────────────────────────────────────────────────
function ScreenPlan() {
  const plans = [
    { id: 'pay', title: 'Pay as you ride', price: '$1.50', sub: 'unlock + $0.20/min', selected: false },
    { id: 'monthly', title: 'Monthly', price: '$19', sub: '60 min/day · save 40%', selected: true, badge: 'Popular' },
    { id: 'annual', title: 'Annual', price: '$179', sub: 'unlimited 60‑min rides', selected: false },
  ];
  return (
    <IOSDevice>
      <StatusBarSlim />
      <div style={{ padding: '14px 20px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <BackPill />
        <Dots step={3} />
        <div style={{ width: 40 }} />
      </div>
      <div style={{ padding: '32px 24px 0', fontFamily: FONT, color: PEDALO.ink, display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 30, fontWeight: 800, letterSpacing: -0.8, lineHeight: 1.1 }}>
            Pick a plan
          </h1>
          <p style={{ margin: '10px 0 0', fontSize: 15, color: PEDALO.inkSoft, lineHeight: 1.4, letterSpacing: -0.1 }}>
            Cancel or switch any time. First ride free.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {plans.map((p) => (
            <div key={p.id} style={{
              padding: '16px 16px', borderRadius: 16, background: '#fff',
              border: p.selected ? `2px solid ${PEDALO.blue}` : `1.5px solid ${PEDALO.line}`,
              display: 'flex', alignItems: 'center', gap: 14, position: 'relative',
              boxShadow: p.selected ? '0 8px 20px rgba(30,91,255,0.10)' : 'none',
            }}>
              {/* Radio */}
              <div style={{
                width: 22, height: 22, borderRadius: 11,
                border: p.selected ? `6px solid ${PEDALO.blue}` : `1.5px solid ${PEDALO.line}`,
                background: '#fff', flexShrink: 0,
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: -0.2 }}>{p.title}</span>
                  {p.badge && (
                    <span style={{
                      fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase',
                      color: PEDALO.orange, background: PEDALO.orangeSoft,
                      padding: '3px 8px', borderRadius: 6,
                    }}>{p.badge}</span>
                  )}
                </div>
                <div style={{ fontSize: 13, color: PEDALO.inkSoft, marginTop: 2 }}>{p.sub}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: -0.4 }}>{p.price}</div>
                {p.id !== 'pay' && (
                  <div style={{ fontSize: 11, color: PEDALO.inkSoft, marginTop: 1 }}>
                    {p.id === 'monthly' ? '/month' : '/year'}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div style={{ flex: 1 }} />
        <PrimaryButton style={{ marginBottom: 24 }}>Continue with Monthly</PrimaryButton>
      </div>
    </IOSDevice>
  );
}

// ─────────────────────────────────────────────────────────────
// Screen 6 — All set / Ready to ride
// ─────────────────────────────────────────────────────────────
function ScreenReady() {
  return (
    <IOSDevice>
      {/* gradient backdrop */}
      <div style={{
        position: 'absolute', inset: 0,
        background: `radial-gradient(ellipse at 50% 0%, ${PEDALO.orangeSoft} 0%, ${PEDALO.bg} 55%)`,
      }} />
      <StatusBarSlim />
      <div style={{
        position: 'relative', zIndex: 2, height: '100%',
        display: 'flex', flexDirection: 'column',
        padding: '80px 24px 50px', fontFamily: FONT, color: PEDALO.ink,
      }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 28 }}>
          {/* Big check w/ orange badge */}
          <div style={{ position: 'relative' }}>
            <div style={{
              width: 140, height: 140, borderRadius: 70, background: PEDALO.blue,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 20px 50px rgba(30,91,255,0.30)',
            }}>
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                <path d="M16 33l11 11 22-26" stroke="#fff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div style={{
              position: 'absolute', bottom: -6, right: -6,
              padding: '6px 12px', borderRadius: 999, background: PEDALO.orange,
              color: '#fff', fontSize: 13, fontWeight: 700, letterSpacing: 0.2,
              boxShadow: '0 8px 18px rgba(255,106,26,0.35)',
            }}>1 free ride</div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <h1 style={{ margin: 0, fontSize: 32, fontWeight: 800, letterSpacing: -0.8, lineHeight: 1.1 }}>
              You're all set,<br/>Maya.
            </h1>
            <p style={{ margin: '12px 0 0', fontSize: 16, color: PEDALO.inkSoft, lineHeight: 1.4, letterSpacing: -0.1 }}>
              Scan any bike's QR code to unlock.<br/>Helmet up — let's go.
            </p>
          </div>
        </div>

        <Dots step={4} />
        <div style={{ height: 18 }} />
        <PrimaryButton color={PEDALO.orange}>Find a bike near me</PrimaryButton>
      </div>
    </IOSDevice>
  );
}

Object.assign(window, {
  ScreenWelcome, ScreenPhone, ScreenOTP, ScreenProfile, ScreenPlan, ScreenReady,
  PEDALO, FONT, Logo,
});
