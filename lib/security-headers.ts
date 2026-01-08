import { NextResponse } from "next/server"

// Security headers configuration
export const SECURITY_HEADERS = {
  // Prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Strict transport security
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com https://unpkg.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co https://api.stripe.com",
    "frame-src https://js.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; '),
  
  // Permissions Policy
  'Permissions-Policy': [
    'camera=()',
    'microphone=()',
    'geolocation=()',
    'interest-cohort=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()'
  ].join(', '),
  
  // Cross-Origin policies
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  
  // Cache control for sensitive data
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  
  // Server information hiding
  'Server': 'WebServer',
  'X-Powered-By': '',
}

// API-specific security headers
export const API_SECURITY_HEADERS = {
  ...SECURITY_HEADERS,
  'Content-Type': 'application/json',
  'X-API-Version': '1.0',
  'X-Response-Time': '0ms', // This would be set dynamically
}

// Authentication-specific headers
export const AUTH_SECURITY_HEADERS = {
  ...SECURITY_HEADERS,
  'WWW-Authenticate': 'Bearer',
  'X-Auth-Method': 'JWT',
}

// Payment-specific headers
export const PAYMENT_SECURITY_HEADERS = {
  ...SECURITY_HEADERS,
  'X-Payment-Provider': 'Stripe',
  'X-PCI-Compliant': 'true',
}

// File upload headers
export const FILE_UPLOAD_HEADERS = {
  ...SECURITY_HEADERS,
  'X-File-Size-Limit': '5MB',
  'X-Allowed-Types': 'image/*,application/pdf,text/*',
}

// Add security headers to response
export function addSecurityHeaders(
  response: NextResponse,
  headers: Record<string, string> = SECURITY_HEADERS
): NextResponse {
  // Add each header
  for (const [key, value] of Object.entries(headers)) {
    if (value) {
      response.headers.set(key, value)
    } else {
      response.headers.delete(key)
    }
  }
  
  return response
}

// Create secure API response
export function createSecureApiResponse(
  data: any,
  status: number = 200,
  headers: Record<string, string> = API_SECURITY_HEADERS
): NextResponse {
  const response = NextResponse.json(data, { status })
  return addSecurityHeaders(response, headers)
}

// Create secure error response
export function createSecureErrorResponse(
  error: string,
  status: number = 400,
  details?: any
): NextResponse {
  const response = NextResponse.json(
    { 
      error, 
      details,
      timestamp: new Date().toISOString(),
      requestId: generateRequestId()
    },
    { status }
  )
  return addSecurityHeaders(response, API_SECURITY_HEADERS)
}

// Create secure authentication response
export function createSecureAuthResponse(
  data: any,
  status: number = 200
): NextResponse {
  const response = NextResponse.json(data, { status })
  return addSecurityHeaders(response, AUTH_SECURITY_HEADERS)
}

// Create secure payment response
export function createSecurePaymentResponse(
  data: any,
  status: number = 200
): NextResponse {
  const response = NextResponse.json(data, { status })
  return addSecurityHeaders(response, PAYMENT_SECURITY_HEADERS)
}

// Generate request ID for tracking
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
}

// Validate security headers in request
export function validateSecurityHeaders(request: Request): {
  valid: boolean
  missing: string[]
  warnings: string[]
} {
  const missing: string[] = []
  const warnings: string[] = []
  
  // Check for required headers
  const requiredHeaders = [
    'user-agent',
    'accept',
  ]
  
  for (const header of requiredHeaders) {
    if (!request.headers.get(header)) {
      missing.push(header)
    }
  }
  
  // Check for suspicious headers
  const suspiciousHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-originating-ip',
    'x-remote-ip',
    'x-remote-addr',
  ]
  
  for (const header of suspiciousHeaders) {
    if (request.headers.get(header)) {
      warnings.push(`Suspicious header detected: ${header}`)
    }
  }
  
  return {
    valid: missing.length === 0,
    missing,
    warnings
  }
}

// Security header middleware
export function securityHeaderMiddleware(
  request: Request,
  response: NextResponse
): NextResponse {
  // Validate request headers
  const validation = validateSecurityHeaders(request)
  
  if (!validation.valid) {
    console.warn('Security header validation failed:', validation.missing)
  }
  
  if (validation.warnings.length > 0) {
    console.warn('Security header warnings:', validation.warnings)
  }
  
  // Add security headers to response
  return addSecurityHeaders(response, SECURITY_HEADERS)
}

// Rate limiting headers
export function addRateLimitHeaders(
  response: NextResponse,
  remaining: number,
  reset: Date
): NextResponse {
  response.headers.set('X-RateLimit-Remaining', remaining.toString())
  response.headers.set('X-RateLimit-Reset', reset.toISOString())
  response.headers.set('X-RateLimit-Limit', '100') // This should be dynamic
  
  return response
}

// CORS headers for API
export function addCorsHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_URL || 'http://localhost:3000')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token')
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Max-Age', '86400')
  
  return response
}
