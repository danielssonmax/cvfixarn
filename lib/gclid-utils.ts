/**
 * Extracts the gclid from the _gcl_aw cookie
 * Cookie format: GCL.{timestamp}.{gclid}
 * Example: GCL.1768392494.CjwKCAiAmp3LBhAkEiwAJM2JUIgWnyqzmqqnnelJIb_HrGxC88cIQb1GzsJTrZWWzffsrtCcz4pBbhoCt7sQAvD_BwE
 * Returns: CjwKCAiAmp3LBhAkEiwAJM2JUIgWnyqzmqqnnelJIb_HrGxC88cIQb1GzsJTrZWWzffsrtCcz4pBbhoCt7sQAvD_BwE
 */
export function getGclidFromCookie(): string | null {
  if (typeof window === 'undefined') {
    return null
  }

  // Get the _gcl_aw cookie
  const cookies = document.cookie.split(';')
  const gclAwCookie = cookies.find(cookie => cookie.trim().startsWith('_gcl_aw='))

  if (!gclAwCookie) {
    return null
  }

  // Extract the value (everything after '=')
  const cookieValue = gclAwCookie.split('=')[1]?.trim()

  if (!cookieValue) {
    return null
  }

  // Parse the cookie value: GCL.{timestamp}.{gclid}
  // Split by '.' and get everything after the second dot
  const parts = cookieValue.split('.')
  
  if (parts.length < 3) {
    return null
  }

  // Join everything after the second dot (index 2 onwards)
  const gclid = parts.slice(2).join('.')

  return gclid || null
}
