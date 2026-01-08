import { NextRequest } from "next/server"

// CSRF token configuration
export const CSRF_CONFIG = {
  // Token expiration time (1 hour)
  TOKEN_EXPIRY: 60 * 60 * 1000,
  // Token length
  TOKEN_LENGTH: 32,
  // Header name for CSRF token
  HEADER_NAME: 'x-csrf-token',
  // Cookie name for CSRF token
  COOKIE_NAME: 'csrf-token',
}

// In-memory token store (för produktion, använd Redis)
const tokenStore = new Map<string, { createdAt: number; userId?: string }>()

// Generate secure CSRF token
export function generateCSRFToken(userId?: string): string {
  const array = new Uint8Array(CSRF_CONFIG.TOKEN_LENGTH)
  crypto.getRandomValues(array)
  const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  
  // Store token with metadata
  tokenStore.set(token, {
    createdAt: Date.now(),
    userId,
  })
  
  return token
}

// Validate CSRF token
export function validateCSRFToken(token: string, userId?: string): boolean {
  const tokenData = tokenStore.get(token)
  
  if (!tokenData) {
    return false
  }
  
  // Check if token has expired
  if (Date.now() - tokenData.createdAt > CSRF_CONFIG.TOKEN_EXPIRY) {
    tokenStore.delete(token)
    return false
  }
  
  // If userId is provided, check if it matches
  if (userId && tokenData.userId && tokenData.userId !== userId) {
    return false
  }
  
  return true
}

// Invalidate CSRF token
export function invalidateCSRFToken(token: string): void {
  tokenStore.delete(token)
}

// Cleanup expired tokens
export function cleanupExpiredTokens(): void {
  const now = Date.now()
  for (const [token, data] of tokenStore.entries()) {
    if (now - data.createdAt > CSRF_CONFIG.TOKEN_EXPIRY) {
      tokenStore.delete(token)
    }
  }
}

// CSRF middleware for API routes
export async function validateCSRFMiddleware(request: NextRequest): Promise<{
  valid: boolean
  error?: string
}> {
  try {
    // Skip CSRF validation for GET requests
    if (request.method === 'GET') {
      return { valid: true }
    }
    
    // Get token from header or cookie
    const headerToken = request.headers.get(CSRF_CONFIG.HEADER_NAME)
    const cookieToken = request.cookies.get(CSRF_CONFIG.COOKIE_NAME)?.value
    
    const token = headerToken || cookieToken
    
    if (!token) {
      return { valid: false, error: 'CSRF token missing' }
    }
    
    // Validate token
    const isValid = validateCSRFToken(token)
    
    if (!isValid) {
      return { valid: false, error: 'Invalid or expired CSRF token' }
    }
    
    return { valid: true }
  } catch (error) {
    console.error('CSRF validation error:', error)
    return { valid: false, error: 'CSRF validation failed' }
  }
}

// Generate CSRF token response
export function createCSRFTokenResponse(token: string) {
  return new Response(JSON.stringify({ csrfToken: token }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `${CSRF_CONFIG.COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=${CSRF_CONFIG.TOKEN_EXPIRY / 1000}`,
    },
  })
}

// CSRF error response
export function createCSRFErrorResponse(error: string) {
  return new Response(
    JSON.stringify({ 
      error: 'CSRF validation failed', 
      message: error 
    }),
    { 
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    }
  )
}

// Auto-cleanup expired tokens (run this periodically)
setInterval(cleanupExpiredTokens, CSRF_CONFIG.TOKEN_EXPIRY)

// Export token store for monitoring
export function getCSRFStats() {
  return {
    activeTokens: tokenStore.size,
    tokens: Array.from(tokenStore.entries()).map(([token, data]) => ({
      token: token.substring(0, 8) + '...', // Only show first 8 characters
      createdAt: new Date(data.createdAt).toISOString(),
      userId: data.userId,
    }))
  }
}
