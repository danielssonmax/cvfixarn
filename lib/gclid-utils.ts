const GCLID_KEY = 'cvfixaren_gclid'
const GBRAID_KEY = 'cvfixaren_gbraid'
const WBRAID_KEY = 'cvfixaren_wbraid'
const REFERRER_KEY = 'cvfixaren_referrer'

/**
 * Captures gclid, gbraid, and wbraid from URL parameters on landing.
 * Stored in localStorage so they persist across sessions and don't
 * depend on cookie consent (these are first-party stored values,
 * not tracking cookies).
 */
export function captureGclidsFromUrl(): void {
  if (typeof window === 'undefined') return

  const params = new URLSearchParams(window.location.search)

  const gclid = params.get('gclid')
  if (gclid) localStorage.setItem(GCLID_KEY, gclid)

  const gbraid = params.get('gbraid')
  if (gbraid) localStorage.setItem(GBRAID_KEY, gbraid)

  const wbraid = params.get('wbraid')
  if (wbraid) localStorage.setItem(WBRAID_KEY, wbraid)
}

/**
 * Returns the gclid — checks localStorage first (URL capture),
 * then falls back to the _gcl_aw cookie (set by gtag when ad_storage is granted).
 */
export function getGclid(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(GCLID_KEY) || extractGclCookie('_gcl_aw')
}

/**
 * Returns the gbraid — checks localStorage first, then _gcl_gb cookie.
 */
export function getGbraid(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(GBRAID_KEY) || extractGclCookie('_gcl_gb')
}

/**
 * @deprecated Use getGclid() instead — it checks both localStorage and cookies.
 */
export function getGclidFromCookie(): string | null {
  return extractGclCookie('_gcl_aw')
}

/**
 * @deprecated Use getGbraid() instead — it checks both localStorage and cookies.
 */
export function getGbraidFromCookie(): string | null {
  return extractGclCookie('_gcl_gb')
}

/**
 * Shared parser for _gcl_* cookies (gclid, gbraid, wbraid, etc.)
 * All follow the same format: GCL.{timestamp}.{value}
 */
function extractGclCookie(cookieName: string): string | null {
  if (typeof window === 'undefined') return null

  const cookies = document.cookie.split(';')
  const targetCookie = cookies.find(c => c.trim().startsWith(`${cookieName}=`))
  if (!targetCookie) return null

  const cookieValue = targetCookie.split('=')[1]?.trim()
  if (!cookieValue) return null

  const parts = cookieValue.split('.')
  if (parts.length < 3) return null

  return parts.slice(2).join('.') || null
}

/**
 * Captures and stores the original referrer when the user first lands on the site.
 * Should be called once on app mount. Only stores the first referrer per session.
 */
export function captureReferrer(): void {
  if (typeof window === 'undefined') return

  if (sessionStorage.getItem(REFERRER_KEY)) return

  const referrer = document.referrer
  if (referrer) {
    try {
      const url = new URL(referrer)
      if (url.hostname !== window.location.hostname) {
        sessionStorage.setItem(REFERRER_KEY, referrer)
      }
    } catch {
      sessionStorage.setItem(REFERRER_KEY, referrer)
    }
  }
}

/**
 * Returns the stored original referrer, or null if none captured.
 */
export function getReferrer(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem(REFERRER_KEY) || null
}
