import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, FUI, GRAD } from '../design/tokens'

const STORAGE_KEY = 'mara_cookie_consent'

function grantAnalytics() {
  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', { analytics_storage: 'granted' })
  }
}

export default function CookieBanner() {
  const nav = useNavigate()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      // small delay so it doesn't flash on first paint
      const t = setTimeout(() => setVisible(true), 1200)
      return () => clearTimeout(t)
    }
    if (stored === 'accepted') grantAnalytics()
  }, [])

  function accept() {
    localStorage.setItem(STORAGE_KEY, 'accepted')
    grantAnalytics()
    setVisible(false)
  }

  function reject() {
    localStorage.setItem(STORAGE_KEY, 'rejected')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      padding: '0 16px 16px',
      pointerEvents: 'none',
    }}>
      <div style={{
        maxWidth: 560, margin: '0 auto',
        background: '#1A1428', border: `1px solid ${X.line}`,
        borderRadius: 20, padding: '18px 20px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.6)',
        pointerEvents: 'all',
        display: 'flex', flexDirection: 'column', gap: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <span style={{ fontSize: 20, lineHeight: 1 }}>🍪</span>
          <div>
            <div style={{ fontFamily: FUI, fontWeight: 700, fontSize: 14, color: X.text, marginBottom: 4 }}>
              Cookies e privacidade
            </div>
            <div style={{ fontFamily: FUI, fontSize: 13, color: X.textSoft, lineHeight: 1.55 }}>
              Usamos cookies de análise (Google Analytics) para melhorar o serviço.
              Consulte a nossa{' '}
              <span
                onClick={() => { nav('/privacy'); setVisible(false) }}
                style={{ color: X.acc1, cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2 }}
              >
                Política de Privacidade
              </span>
              .
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={reject}
            style={{
              flex: 1, height: 40, borderRadius: 999,
              background: 'rgba(255,255,255,0.05)', border: `1px solid ${X.line}`,
              color: X.textSoft, fontFamily: FUI, fontWeight: 600, fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Rejeitar
          </button>
          <button
            onClick={accept}
            style={{
              flex: 2, height: 40, borderRadius: 999,
              background: GRAD, border: 'none',
              color: '#fff', fontFamily: FUI, fontWeight: 700, fontSize: 13,
              cursor: 'pointer', boxShadow: `0 4px 16px rgba(124,87,255,0.4)`,
            }}
          >
            Aceitar cookies
          </button>
        </div>
      </div>
    </div>
  )
}
