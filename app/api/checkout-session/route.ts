import { NextResponse } from "next/server"
import { getStripeInstance } from "@/lib/stripe"
import { checkoutSessionSchema, validateRequest } from "@/lib/validations"
import { createSecureApiResponse, createSecureErrorResponse } from "@/lib/security-headers"

const stripe = getStripeInstance()

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const sessionId = searchParams.get("session_id")

  const validation = validateRequest(checkoutSessionSchema, { session_id: sessionId })
  if (!validation.success) {
    return createSecureErrorResponse("Valideringsfel", 400, (validation as any).errors)
  }

  const { session_id } = validation.data

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id)
    return createSecureApiResponse({ status: session.status })
  } catch (error) {
    console.error("Error:", error)
    return createSecureErrorResponse("Error retrieving session", 500)
  }
}
