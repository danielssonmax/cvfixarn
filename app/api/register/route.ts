import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { registerSchema, validateRequest, sanitizeInput } from "@/lib/validations"
import { authRateLimit, getClientIP, checkRateLimit, createRateLimitResponse } from "@/lib/rate-limit"
import { logSecurityEvent, SecurityEventType } from "@/lib/security-logger"
import { createSecureApiResponse, createSecureErrorResponse } from "@/lib/security-headers"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

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
        { ipAddress: clientIP, endpoint: '/api/register' },
        undefined,
        undefined,
        'high'
      )
      return createRateLimitResponse(rateLimitResult.remaining, rateLimitResult.reset)
    }

    const body = await req.json()
    const sanitizedBody = sanitizeInput(body)
    
    const validation = validateRequest(registerSchema, sanitizedBody)
    if (!validation.success) {
      // Log validation failure
      logSecurityEvent(
        SecurityEventType.REGISTRATION_ATTEMPT,
        req as any,
        { validationErrors: (validation as any).errors, endpoint: '/api/register' },
        undefined,
        sanitizedBody.email,
        'medium'
      )
      return createSecureErrorResponse("Valideringsfel", 400, (validation as any).errors)
    }

    const { userId, email, name } = validation.data

    // Log registration attempt
    logSecurityEvent(
      SecurityEventType.REGISTRATION_ATTEMPT,
      req as any,
      { userId, endpoint: '/api/register' },
      userId,
      email,
      'low'
    )

    const { error } = await supabase.from("premium").insert([{ uid: userId, email, name, premium: false }])

    if (error) {
      // Log registration failure
      logSecurityEvent(
        SecurityEventType.REGISTRATION_FAILURE,
        req as any,
        { error: error.message, userId, endpoint: '/api/register' },
        userId,
        email,
        'medium'
      )
      throw error
    }

    // Log successful registration
    logSecurityEvent(
      SecurityEventType.REGISTRATION_SUCCESS,
      req as any,
      { userId, endpoint: '/api/register' },
      userId,
      email,
      'low'
    )

    return createSecureApiResponse({ success: true })
  } catch (error) {
    console.error("Error creating user:", error)
    
    // Log registration failure
    logSecurityEvent(
      SecurityEventType.REGISTRATION_FAILURE,
      req as any,
      { error: error instanceof Error ? error.message : 'Unknown error', endpoint: '/api/register' },
      undefined,
      undefined,
      'high'
    )
    
    return createSecureErrorResponse("Error creating user", 500)
  }
}
