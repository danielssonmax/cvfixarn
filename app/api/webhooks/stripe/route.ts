import { headers } from "next/headers"
import { NextResponse } from "next/server"
import { getStripeInstance } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"
import { logSecurityEvent, SecurityEventType } from "@/lib/security-logger"
import { createSecureApiResponse, createSecureErrorResponse } from "@/lib/security-headers"
import { ENDED_STATUSES, syncPremiumWithSubscription } from "@/lib/subscription"
import type Stripe from "stripe"

const stripe = getStripeInstance()

// Service role, not anon: the premium table's RLS policy only lets the service
// role write (see the create_premium_table migration), so an anon-key upsert
// here is rejected and nobody gets marked as paid.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
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
    const customerEmail = session.customer_email || session.customer_details?.email

    if (userId) {
      // This event can arrive late: Stripe retries for days, and failed events
      // can be resent from the dashboard. If the subscription it started has
      // ended since, granting now would hand premium back with nothing left to
      // take it away again. "incomplete" is left out on purpose: that is a first
      // payment still in progress, not an ended subscription.
      const subscriptionId =
        typeof session.subscription === "string" ? session.subscription : session.subscription?.id
      if (subscriptionId) {
        let currentStatus: string | null = null
        try {
          const current = await stripe.subscriptions.retrieve(
            subscriptionId,
            {},
            { timeout: 5_000, maxNetworkRetries: 0 }
          )
          currentStatus = current.status
        } catch (error) {
          // Stripe could not be asked: grant as before. A new customer must
          // never be kept waiting because of this check.
          console.warn(
            "Could not check subscription before granting premium:",
            error instanceof Error ? error.message : error
          )
        }

        if (currentStatus && currentStatus !== "incomplete" && ENDED_STATUSES.has(currentStatus)) {
          logSecurityEvent(
            SecurityEventType.PAYMENT_ATTEMPT,
            req as any,
            {
              eventType: event.type,
              sessionId: session.id,
              subscriptionId,
              status: currentStatus,
              skipped: 'subscription_ended',
              endpoint: '/api/webhooks/stripe'
            },
            userId,
            undefined,
            'low'
          )
          return createSecureApiResponse({ received: true })
        }
      }

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
      // Use upsert to ensure the row exists, then update premium to "true"
      const updateData: any = { 
        uid: userId, 
        premium: "true",
        updated_at: new Date().toISOString()
      }
      
      // Include email if available (for cases where row might not exist yet)
      if (customerEmail) {
        updateData.email = customerEmail
      }
      
      const { error } = await supabase
        .from("premium")
        .upsert(
          updateData,
          { 
            onConflict: "uid",
            ignoreDuplicates: false
          }
        )

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

  // Ending a subscription is what takes premium away again. invoice.payment_failed
  // is deliberately not handled: a failed charge moves the subscription to
  // past_due (still access) and, once Stripe gives up, to canceled or unpaid,
  // and both moves arrive here as subscription events anyway.
  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription
    const logDetails = {
      eventType: event.type,
      subscriptionId: subscription.id,
      eventStatus: subscription.status,
      endpoint: '/api/webhooks/stripe'
    }

    try {
      const result = await syncPremiumWithSubscription(subscription.id)
      const revoked = result.decision === "revoke" && result.changed
      const unresolved = result.reason === "user_not_resolved" || result.reason === "incomplete_lookup"

      logSecurityEvent(
        result.decision === "grant"
          ? SecurityEventType.PAYMENT_SUCCESS
          : unresolved
            ? SecurityEventType.PAYMENT_FAILURE
            : SecurityEventType.PAYMENT_ATTEMPT,
        req as any,
        {
          ...logDetails,
          status: result.status,
          decision: result.decision,
          premiumChanged: result.changed,
          resolvedVia: result.via,
          reason: result.reason
        },
        result.userId ?? undefined,
        undefined,
        revoked || unresolved ? 'medium' : 'low'
      )
    } catch (error) {
      console.error("Error syncing premium status with subscription:", error)

      logSecurityEvent(
        SecurityEventType.PAYMENT_FAILURE,
        req as any,
        {
          ...logDetails,
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        undefined,
        undefined,
        'high'
      )

      // Nothing was changed. A 500 makes Stripe deliver the event again later.
      return createSecureErrorResponse("Failed to sync premium status", 500)
    }
  }

  return createSecureApiResponse({ received: true })
}
