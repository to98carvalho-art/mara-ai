/**
 * Mara AI — Analytics helper
 * Fires gtag events safely (no-op if GA not loaded or consent not given)
 */
export function track(eventName, params = {}) {
  try {
    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', eventName, params)
    }
  } catch (_) {}
}
