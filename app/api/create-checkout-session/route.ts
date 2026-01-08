import { NextResponse } from "next/server"
import { getStripeInstance } from "@/lib/stripe"
import { createCheckoutSessionSchema, validateRequest, sanitizeInput } from "@/lib/validations"

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

    const { priceId, userId } = validation.data

    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000"
    const returnUrl = `${baseUrl}/return?session_id={CHECKOUT_SESSION_ID}`

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      mode: "subscription",
      return_url: returnUrl,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 7,
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
