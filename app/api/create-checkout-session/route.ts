import { NextResponse } from "next/server"
import { getStripeInstance } from "@/lib/stripe"
import { createCheckoutSessionSchema, validateRequest, sanitizeInput } from "@/lib/validations"
import { getSubscriptionStatus } from "@/lib/subscription"

const stripe = getStripeInstance()

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const sanitizedBody = sanitizeInput(body)
    
    const validation = validateRequest(createCheckoutSessionSchema, sanitizedBody)
    if (!validation.success) {
      return NextResponse.json({ 
        error: "Valideringsfel", 
        details: (validation as any).errors 
      }, { status: 400 })
    }

    const { priceId, userId, cvId } = validation.data

    // Last line of defence against selling the same person a second
    // subscription: whatever the client thought, refuse if Stripe already has one.
    // If the lookup itself fails, fall through to checkout rather than block a sale.
    let accountEmail: string | null = null
    try {
      const status = await getSubscriptionStatus(userId)
      if (status.subscribed) {
        return NextResponse.json({ alreadySubscribed: true }, { status: 409 })
      }
      accountEmail = status.email
    } catch (error) {
      console.error("Subscription lookup failed before checkout:", error)
    }

    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000"
    // With ?id= the editor reopens the CV the customer was paying to download;
    // without it, it starts a new blank CV and rewrites the URL on load.
    const returnUrl = `${baseUrl}/profil/skapa-cv?${cvId ? `id=${cvId}&` : ""}checkout=success&session_id={CHECKOUT_SESSION_ID}`

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      mode: "subscription",
      return_url: returnUrl,
      // Ties the Stripe customer to the account email, which is what
      // getSubscriptionStatus looks sessions up by.
      ...(accountEmail ? { customer_email: accountEmail } : {}),
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7,
        metadata: {
          userId,
        },
      },
      metadata: {
        userId,
      },
    })

    if (!session.client_secret) {
      throw new Error("No client secret received from Stripe")
    }

    return NextResponse.json({ clientSecret: session.client_secret })
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return NextResponse.json(
      { 
        error: "Failed to create checkout session",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
