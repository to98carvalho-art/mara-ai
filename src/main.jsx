import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Capacitor native plugins (only active inside native app shell)
async function initNative() {
  try {
    const { SplashScreen } = await import('@capacitor/splash-screen')
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    const { Keyboard } = await import('@capacitor/keyboard')
    await StatusBar.setStyle({ style: Style.Dark })
    await StatusBar.setBackgroundColor({ color: '#0A0717' }).catch(() => {})
    Keyboard.setAccessoryBarVisible({ isVisible: false }).catch(() => {})
    await SplashScreen.hide({ fadeOutDuration: 300 })
  } catch {
    // Not running inside Capacitor — ignore
  }
}
initNative()

// Register service worker for PWA / offline support (web only)
if ('serviceWorker' in navigator && !window.Capacitor) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => {})
  })
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
