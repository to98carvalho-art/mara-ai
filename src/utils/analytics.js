/**
 * Mara AI — Analytics helper
 * Fires GA4 + Meta Pixel events safely
 */

// GA4  (Measurement ID: G-CMRMJS0N8E)
export function track(eventName, params = {}) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, params)
      console.log('[Mara GA4]', eventName, params)
    } else {
      console.warn('[Mara GA4] gtag not ready —', eventName, params)
    }
  } catch (err) {
    console.error('[Mara GA4] erro ao enviar evento:', eventName, err)
  }
}

// Meta Pixel — standard + custom events
export function pixel(eventName, params = {}) {
  try {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      // Map to Meta standard events where possible
      const standard = {
        purchase_completed: () => window.fbq('track', 'Purchase', { value: 9.99, currency: 'BRL', ...params }),
        checkout_opened:    () => window.fbq('track', 'InitiateCheckout', params),
        payment_shown:      () => window.fbq('track', 'AddToCart', params),
        chat_started:       () => window.fbq('track', 'Lead', params),
        step1_completed:    () => window.fbq('track', 'CompleteRegistration', params),
      }
      if (standard[eventName]) {
        standard[eventName]()
      } else {
        window.fbq('trackCustom', eventName, params)
      }
    }
  } catch (_) {}
}

// Fire both GA + Pixel at once
export function trackAll(eventName, params = {}) {
  track(eventName, params)
  pixel(eventName, params)
}
