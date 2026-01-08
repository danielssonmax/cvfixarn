import { NextRequest } from "next/server"

// Security event types
export enum SecurityEventType {
  LOGIN_ATTEMPT = 'login_attempt',
  LOGIN_SUCCESS = 'login_success',
  LOGIN_FAILURE = 'login_failure',
  REGISTRATION_ATTEMPT = 'registration_attempt',
  REGISTRATION_SUCCESS = 'registration_success',
  REGISTRATION_FAILURE = 'registration_failure',
  PAYMENT_ATTEMPT = 'payment_attempt',
  PAYMENT_SUCCESS = 'payment_success',
  PAYMENT_FAILURE = 'payment_failure',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
  CSRF_VIOLATION = 'csrf_violation',
  XSS_ATTEMPT = 'xss_attempt',
  SQL_INJECTION_ATTEMPT = 'sql_injection_attempt',
  FILE_UPLOAD_ATTEMPT = 'file_upload_attempt',
  FILE_UPLOAD_SUCCESS = 'file_upload_success',
  FILE_UPLOAD_FAILURE = 'file_upload_failure',
  SESSION_EXPIRED = 'session_expired',
  UNAUTHORIZED_ACCESS = 'unauthorized_access',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
}

// Security event interface
export interface SecurityEvent {
  id: string
  type: SecurityEventType
  timestamp: number
  userId?: string
  email?: string
  ipAddress: string
  userAgent: string
  endpoint: string
  method: string
  details: Record<string, any>
  severity: 'low' | 'medium' | 'high' | 'critical'
  resolved: boolean
}

// In-memory event store (för produktion, använd en databas)
const eventStore: SecurityEvent[] = []

// Generate event ID
function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
}

// Get client information from request
export function getClientInfo(request: NextRequest): {
  ipAddress: string
  userAgent: string
  endpoint: string
  method: string
} {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  const ipAddress = forwarded?.split(',')[0].trim() || realIP || 'unknown'
  const endpoint = request.nextUrl.pathname
  const method = request.method
  
  return {
    ipAddress,
    userAgent,
    endpoint,
    method,
  }
}

// Log security event
export function logSecurityEvent(
  type: SecurityEventType,
  request: NextRequest,
  details: Record<string, any> = {},
  userId?: string,
  email?: string,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'
): void {
  try {
    const clientInfo = getClientInfo(request)
    
    const event: SecurityEvent = {
      id: generateEventId(),
      type,
      timestamp: Date.now(),
      userId,
      email,
      ipAddress: clientInfo.ipAddress,
      userAgent: clientInfo.userAgent,
      endpoint: clientInfo.endpoint,
      method: clientInfo.method,
      details,
      severity,
      resolved: false,
    }
    
    eventStore.push(event)
    
    // Log to console for development
    console.log(`[SECURITY] ${type}:`, {
      id: event.id,
      userId,
      email,
      ipAddress: clientInfo.ipAddress,
      endpoint: clientInfo.endpoint,
      severity,
      details,
    })
    
    // In production, send to external logging service
    if (process.env.NODE_ENV === 'production') {
      // Send to external logging service (e.g., Sentry, LogRocket, etc.)
      sendToExternalLogger(event)
    }
  } catch (error) {
    console.error('Failed to log security event:', error)
  }
}

// Send to external logging service
async function sendToExternalLogger(event: SecurityEvent): Promise<void> {
  try {
    // Example: Send to external service
    // await fetch('https://your-logging-service.com/api/events', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(event),
    // })
  } catch (error) {
    console.error('Failed to send event to external logger:', error)
  }
}

// Get security events
export function getSecurityEvents(
  limit: number = 100,
  type?: SecurityEventType,
  severity?: 'low' | 'medium' | 'high' | 'critical',
  userId?: string
): SecurityEvent[] {
  let events = [...eventStore]
  
  // Filter by type
  if (type) {
    events = events.filter(event => event.type === type)
  }
  
  // Filter by severity
  if (severity) {
    events = events.filter(event => event.severity === severity)
  }
  
  // Filter by user
  if (userId) {
    events = events.filter(event => event.userId === userId)
  }
  
  // Sort by timestamp (newest first)
  events.sort((a, b) => b.timestamp - a.timestamp)
  
  // Limit results
  return events.slice(0, limit)
}

// Get security statistics
export function getSecurityStats(): {
  totalEvents: number
  eventsByType: Record<string, number>
  eventsBySeverity: Record<string, number>
  recentEvents: SecurityEvent[]
  criticalEvents: SecurityEvent[]
} {
  const events = [...eventStore]
  
  // Count by type
  const eventsByType: Record<string, number> = {}
  events.forEach(event => {
    eventsByType[event.type] = (eventsByType[event.type] || 0) + 1
  })
  
  // Count by severity
  const eventsBySeverity: Record<string, number> = {}
  events.forEach(event => {
    eventsBySeverity[event.severity] = (eventsBySeverity[event.severity] || 0) + 1
  })
  
  // Get recent events (last 24 hours)
  const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000)
  const recentEvents = events
    .filter(event => event.timestamp > oneDayAgo)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 50)
  
  // Get critical events
  const criticalEvents = events
    .filter(event => event.severity === 'critical')
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 20)
  
  return {
    totalEvents: events.length,
    eventsByType,
    eventsBySeverity,
    recentEvents,
    criticalEvents,
  }
}

// Mark event as resolved
export function resolveSecurityEvent(eventId: string): boolean {
  const event = eventStore.find(e => e.id === eventId)
  if (event) {
    event.resolved = true
    return true
  }
  return false
}

// Cleanup old events (older than 30 days)
export function cleanupOldEvents(): void {
  const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000)
  const initialLength = eventStore.length
  
  // Remove old events
  for (let i = eventStore.length - 1; i >= 0; i--) {
    if (eventStore[i].timestamp < thirtyDaysAgo) {
      eventStore.splice(i, 1)
    }
  }
  
  const removedCount = initialLength - eventStore.length
  if (removedCount > 0) {
    console.log(`Cleaned up ${removedCount} old security events`)
  }
}

// Auto-cleanup old events (run daily)
setInterval(cleanupOldEvents, 24 * 60 * 60 * 1000)

// Security event response helper
export function createSecurityEventResponse(event: SecurityEvent) {
  return new Response(
    JSON.stringify({
      success: true,
      event: {
        id: event.id,
        type: event.type,
        timestamp: new Date(event.timestamp).toISOString(),
        severity: event.severity,
        details: event.details,
      }
    }),
    {
      headers: { 'Content-Type': 'application/json' }
    }
  )
}
