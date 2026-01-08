import { NextResponse } from "next/server"
import { getStripeInstance } from "@/lib/stripe"
import { createPaymentIntentSchema, validateRequest, sanitizeInput } from "@/lib/validations"
import { paymentRateLimit, getClientIP, checkRateLimit, createRateLimitResponse } from "@/lib/rate-limit"
import { logSecurityEvent, SecurityEventType } from "@/lib/security-logger"
import { createSecurePaymentResponse, createSecureErrorResponse } from "@/lib/security-headers"

const stripe = getStripeInstance()

export async function POST(req: Request) {
  try {
    // Rate limiting for payment endpoints
    const clientIP = getClientIP(req)
    const rateLimitResult = await checkRateLimit(paymentRateLimit, clientIP, req)
    
    if (!rateLimitResult.success) {
      // Log rate limit exceeded
      logSecurityEvent(
        SecurityEventType.RATE_LIMIT_EXCEEDED,
        req as any,
        { ipAddress: clientIP, endpoint: '/api/create-payment-intent' },
        undefined,
        undefined,
        'high'
      )
      return createRateLimitResponse(rateLimitResult.remaining, rateLimitResult.reset)
    }

    const body = await req.json()
    const sanitizedBody = sanitizeInput(body)
    
    const validation = validateRequest(createPaymentIntentSchema, sanitizedBody)
    if (!validation.success) {
      // Log validation failure
      logSecurityEvent(
        SecurityEventType.PAYMENT_ATTEMPT,
        req as any,
        { validationErrors: (validation as any).errors, endpoint: '/api/create-payment-intent' },
        undefined,
        undefined,
        'medium'
      )
      return createSecureErrorResponse("Valideringsfel", 400, (validation as any).errors)
    }

    const { amount } = validation.data

    // Log payment attempt
    logSecurityEvent(
      SecurityEventType.PAYMENT_ATTEMPT,
      req as any,
      { amount, endpoint: '/api/create-payment-intent' },
      undefined,
      undefined,
      'low'
    )

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
    })

    // Log successful payment intent creation
    logSecurityEvent(
      SecurityEventType.PAYMENT_SUCCESS,
      req as any,
      { paymentIntentId: paymentIntent.id, amount, endpoint: '/api/create-payment-intent' },
      undefined,
      undefined,
      'low'
    )

    return createSecurePaymentResponse({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    console.error("Error creating payment intent:", error)
    
    // Log payment failure
    logSecurityEvent(
      SecurityEventType.PAYMENT_FAILURE,
      req as any,
      { error: error instanceof Error ? error.message : 'Unknown error', endpoint: '/api/create-payment-intent' },
      undefined,
      undefined,
      'high'
    )
    
    return createSecureErrorResponse("Error creating payment intent", 500)
  }
}
