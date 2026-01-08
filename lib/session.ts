import { createClient } from "@supabase/supabase-js"

// Session configuration
export const SESSION_CONFIG = {
  // Session timeout in milliseconds (30 minutes)
  TIMEOUT: 30 * 60 * 1000,
  // Refresh token timeout (7 days)
  REFRESH_TIMEOUT: 7 * 24 * 60 * 60 * 1000,
  // Maximum session duration (24 hours)
  MAX_DURATION: 24 * 60 * 60 * 1000,
  // Check interval for session validation (5 minutes)
  CHECK_INTERVAL: 5 * 60 * 1000,
}

// Session storage interface
interface SessionData {
  userId: string
  email: string
  createdAt: number
  lastActivity: number
  isActive: boolean
  refreshToken?: string
}

// In-memory session store (för produktion, använd Redis)
const sessionStore = new Map<string, SessionData>()

// Cleanup expired sessions
export function cleanupExpiredSessions() {
  const now = Date.now()
  for (const [sessionId, session] of sessionStore.entries()) {
    if (now - session.lastActivity > SESSION_CONFIG.TIMEOUT) {
      sessionStore.delete(sessionId)
    }
  }
}

// Create a new session
export function createSession(userId: string, email: string, refreshToken?: string): string {
  const sessionId = generateSecureSessionId()
  const now = Date.now()
  
  const sessionData: SessionData = {
    userId,
    email,
    createdAt: now,
    lastActivity: now,
    isActive: true,
    refreshToken,
  }
  
  sessionStore.set(sessionId, sessionData)
  return sessionId
}

// Validate and refresh session
export function validateSession(sessionId: string): { valid: boolean; userId?: string; email?: string } {
  const session = sessionStore.get(sessionId)
  const now = Date.now()
  
  if (!session) {
    return { valid: false }
  }
  
  // Check if session has expired
  if (now - session.lastActivity > SESSION_CONFIG.TIMEOUT) {
    sessionStore.delete(sessionId)
    return { valid: false }
  }
  
  // Check if session has exceeded maximum duration
  if (now - session.createdAt > SESSION_CONFIG.MAX_DURATION) {
    sessionStore.delete(sessionId)
    return { valid: false }
  }
  
  // Update last activity
  session.lastActivity = now
  sessionStore.set(sessionId, session)
  
  return {
    valid: true,
    userId: session.userId,
    email: session.email,
  }
}

// Invalidate session
export function invalidateSession(sessionId: string): void {
  sessionStore.delete(sessionId)
}

// Invalidate all sessions for a user
export function invalidateUserSessions(userId: string): void {
  for (const [sessionId, session] of sessionStore.entries()) {
    if (session.userId === userId) {
      sessionStore.delete(sessionId)
    }
  }
}

// Generate secure session ID
function generateSecureSessionId(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Session middleware for API routes
export async function validateSessionMiddleware(request: Request): Promise<{
  valid: boolean
  userId?: string
  email?: string
  error?: string
}> {
  try {
    const sessionId = request.headers.get('x-session-id') || 
                     request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!sessionId) {
      return { valid: false, error: 'No session provided' }
    }
    
    const validation = validateSession(sessionId)
    
    if (!validation.valid) {
      return { valid: false, error: 'Invalid or expired session' }
    }
    
    return validation
  } catch (error) {
    console.error('Session validation error:', error)
    return { valid: false, error: 'Session validation failed' }
  }
}

// Auto-cleanup expired sessions (run this periodically)
setInterval(cleanupExpiredSessions, SESSION_CONFIG.CHECK_INTERVAL)

// Export session store for monitoring
export function getSessionStats() {
  return {
    activeSessions: sessionStore.size,
    sessions: Array.from(sessionStore.entries()).map(([id, session]) => ({
      id,
      userId: session.userId,
      email: session.email,
      createdAt: new Date(session.createdAt).toISOString(),
      lastActivity: new Date(session.lastActivity).toISOString(),
      isActive: session.isActive,
    }))
  }
}
