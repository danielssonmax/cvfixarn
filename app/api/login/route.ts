import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { loginSchema, validateRequest, sanitizeInput } from "@/lib/validations"
import { authRateLimit, getClientIP, checkRateLimit, createRateLimitResponse } from "@/lib/rate-limit"
import { logSecurityEvent, SecurityEventType } from "@/lib/security-logger"
import { createSecureAuthResponse, createSecureErrorResponse } from "@/lib/security-headers"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase environment variables")
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

export async function POST(req: Request) {
  try {
    // Rate limiting
    const clientIP = getClientIP(req)
    const rateLimitResult = await checkRateLimit(authRateLimit, clientIP, req)
    
    if (!rateLimitResult.success) {
      // Log rate limit exceeded
      logSecurityEvent(
        SecurityEventType.RATE_LIMIT_EXCEEDED,
        req as any,
        { ipAddress: clientIP, endpoint: '/api/login' },
        undefined,
        undefined,
        'high'
      )
      return createRateLimitResponse(rateLimitResult.remaining, rateLimitResult.reset)
    }

    const body = await req.json()
    const sanitizedBody = sanitizeInput(body)
    
    const validation = validateRequest(loginSchema, sanitizedBody)
    if (!validation.success) {
      // Log validation failure
      logSecurityEvent(
        SecurityEventType.LOGIN_ATTEMPT,
        req as any,
        { validationErrors: (validation as any).errors, endpoint: '/api/login' },
        undefined,
        sanitizedBody.email,
        'medium'
      )
      return createSecureErrorResponse("Valideringsfel", 400, (validation as any).errors)
    }

    const { email, password } = validation.data

    // Log login attempt
    logSecurityEvent(
      SecurityEventType.LOGIN_ATTEMPT,
      req as any,
      { endpoint: '/api/login' },
      undefined,
      email,
      'low'
    )

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      // Log login failure
      logSecurityEvent(
        SecurityEventType.LOGIN_FAILURE,
        req as any,
        { error: error.message, endpoint: '/api/login' },
        undefined,
        email,
        'medium'
      )
      return createSecureErrorResponse(error.message, 400)
    }

    // Log successful login
    logSecurityEvent(
      SecurityEventType.LOGIN_SUCCESS,
      req as any,
      { userId: data.user?.id, endpoint: '/api/login' },
      data.user?.id,
      email,
      'low'
    )

    return createSecureAuthResponse({ user: data.user, session: data.session })
  } catch (error) {
    console.error("Error in login route:", error)
    return createSecureErrorResponse("An unexpected error occurred", 500)
  }
}
