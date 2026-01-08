import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { getStripeInstance } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"
import { logSecurityEvent, SecurityEventType } from "@/lib/security-logger"
import { createSecureApiResponse, createSecureErrorResponse } from "@/lib/security-headers"
import type Stripe from "stripe"

const stripe = getStripeInstance()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(req: Request) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get("Stripe-Signature") as string

  // Log webhook attempt
  logSecurityEvent(
    SecurityEventType.PAYMENT_ATTEMPT,
    req as any,
    { endpoint: '/api/webhooks/stripe', hasSignature: !!signature },
    undefined,
    undefined,
    'low'
  )

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    // Log webhook signature verification failure
    logSecurityEvent(
      SecurityEventType.PAYMENT_FAILURE,
      req as any,
      { error: 'Webhook signature verification failed', endpoint: '/api/webhooks/stripe' },
      undefined,
      undefined,
      'high'
    )
    
    return createSecureErrorResponse("Webhook signature verification failed", 400)
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.userId

    if (userId) {
      // Log successful payment
      logSecurityEvent(
        SecurityEventType.PAYMENT_SUCCESS,
        req as any,
        { 
          eventType: event.type, 
          sessionId: session.id, 
          userId, 
          endpoint: '/api/webhooks/stripe' 
        },
        userId,
        undefined,
        'low'
      )

      // Update the premium status in the database
      const { error } = await supabase
        .from("premium")
        .update({ premium: true })
        .eq("uid", userId)

      if (error) {
        console.error("Error updating premium status:", error)
        
        // Log database update failure
        logSecurityEvent(
          SecurityEventType.PAYMENT_FAILURE,
          req as any,
          { 
            error: error.message, 
            userId, 
            sessionId: session.id,
            endpoint: '/api/webhooks/stripe' 
          },
          userId,
          undefined,
          'high'
        )
        
        return createSecureErrorResponse("Failed to update premium status", 500)
      }
    }
  }

  return createSecureApiResponse({ received: true })
}
