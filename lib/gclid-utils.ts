/**
 * Extracts the gclid from the _gcl_aw cookie
 * Cookie format: GCL.{timestamp}.{gclid}
 */
export function getGclidFromCookie(): string | null {
  return extractGclCookie('_gcl_aw')
}

/**
 * Extracts the gbraid from the _gcl_gb cookie
 * Cookie format: GCL.{timestamp}.{gbraid}
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

const REFERRER_KEY = 'cvfixaren_referrer'

/**
 * Captures and stores the original referrer when the user first lands on the site.
 * Should be called once on app mount. Only stores the first referrer per session.
 */
export function captureReferrer(): void {
  if (typeof window === 'undefined') return

  // Only store if we don't already have one (first landing)
  if (sessionStorage.getItem(REFERRER_KEY)) return

  const referrer = document.referrer
  if (referrer) {
    try {
      const url = new URL(referrer)
      // Don't store self-referrals
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
